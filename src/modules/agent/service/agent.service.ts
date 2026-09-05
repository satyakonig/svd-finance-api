import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AgentEntity } from "../../models/entity/agent.entity";
import { AgentDto } from "../../models/dto/agent.dto";
import { AgentLocationEntity } from "../../models/entity/agent.location.entity";
import { reponseGenerator } from "../../../util/common";
import { MAX_AGENTS_LIMIT } from "../../../util/constants";

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private agentRepo: Repository<AgentEntity>,
    @InjectRepository(AgentLocationEntity)
    private readonly dataSource: DataSource,
  ) {}

  async validateUserName(username: string) {
    let isExist = await this.agentRepo.exists({
      where: {
        username: username,
      },
    });

    return isExist;
  }

  async getAgent(id: number) {
    let agentList: AgentEntity;
    try {
      agentList = await this.agentRepo
        .createQueryBuilder("agent")
        .leftJoinAndSelect(
          "agent.agentLocation",
          "agentLocation",
          "agentLocation.status = :status",
          { status: "ACTIVE" },
        )
        .leftJoinAndSelect("agentLocation.location", "location")
        .leftJoinAndSelect("agentLocation.day", "day")
        .leftJoinAndSelect("agentLocation.phase", "phase")
        .where(id ? "agent.id =:id" : "1=1", { id })
        .getOne();
    } catch (err) {
      throw new Error(`Failed to get agent ${err.message}`);
    }
    return agentList;
  }

  async getAgentList(
    name: any,
    mobileNo: any,
    status: any,
    location: any,
    role: any,
    pageSize: number,
    pageIndex: number,
  ) {
    try {
      let query = await this.agentRepo
        .createQueryBuilder("agent")
        .leftJoinAndSelect(
          "agent.agentLocation",
          "agentLocation",
          "agentLocation.status = :status",
          { status: "ACTIVE" },
        )
        .leftJoinAndSelect("agentLocation.location", "location")
        .leftJoinAndSelect("agentLocation.day", "day")
        .leftJoinAndSelect("agentLocation.phase", "phase")
        .where(name ? "agent.name ILIKE :name" : "1=1", { name: `%${name}%` })
        .andWhere(mobileNo ? "agent.mobileNo = :mobileNo" : "1=1", { mobileNo })
        .andWhere(status ? "agent.status = :agentStatus" : "1=1", {
          agentStatus: status,
        })
        .andWhere(location ? "agentLocation.id = :location" : "1=1", {
          location,
        })
        .andWhere(role ? "agent.role = :role" : "1=1", { role })
        .orderBy("agent.name", "ASC")
        .addOrderBy("day.id", "ASC")
        .skip(pageSize * pageIndex)
        .limit(pageIndex)
        .getManyAndCount();

      let list = query[0];
      let count = query[1];

      return { list, count };
    } catch (err) {
      throw new Error(`Failed to get agents ${err.message}`);
    }
  }

  public async saveOrUpdateAgent(agent: AgentDto) {
    let savedAgent;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { agentLocation, ...agentPayload } = agent;

      let agentsCount = await this.agentRepo.count({
        where: { role: "AGENT" },
      });

      if (agentsCount >= MAX_AGENTS_LIMIT) {
        return { infoMessage: "Limit Exceeded, Increase your plan" };
      }

      const bycrypt = require("bcrypt");

      const plainPassword = agentPayload.password;

      const hashedPassword = await bycrypt.hash(plainPassword, 10);

      savedAgent = await queryRunner.manager.save(AgentEntity, {
        ...agentPayload,
        password: hashedPassword,
      });

      await Promise.all(
        agentLocation.map(async (loc) => {
          // Save agent's own location
          const savedLoc = await queryRunner.manager.save(AgentLocationEntity, {
            ...loc,
            agent: savedAgent,
          });
        }),
      );

      await queryRunner.commitTransaction();

      let agentWithRelations = await this.agentRepo
        .createQueryBuilder("agent")
        .leftJoinAndSelect(
          "agent.agentLocation",
          "agentLocation",
          "agentLocation.status = :status",
          { status: "ACTIVE" },
        )
        .leftJoinAndSelect("agentLocation.location", "location")
        .leftJoinAndSelect("agentLocation.day", "day")
        .leftJoinAndSelect("agentLocation.phase", "phase")
        .where("agent.id = :id", { id: savedAgent?.id })
        .getOne();
      return {
        successMessage: reponseGenerator("Agent", agent?.id, agent?.status),
        result: agentWithRelations,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
