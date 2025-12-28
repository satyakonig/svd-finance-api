import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AgentEntity } from "../../models/entity/agent.entity";
import { AgentDto } from "../../models/dto/agent.dto";
import { AgentLocationEntity } from "../../models/entity/agent.location.entity";
import { reponseGenerator } from "../../../util/common";

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private agentRepo: Repository<AgentEntity>,
    @InjectRepository(AgentLocationEntity)
    private agentLocationRepo: Repository<AgentLocationEntity>,
    private readonly dataSource: DataSource
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
          { status: "ACTIVE" }
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
    role: any
  ) {
    let agentList: AgentEntity[];
    try {
      agentList = await this.agentRepo
        .createQueryBuilder("agent")
        .leftJoinAndSelect(
          "agent.agentLocation",
          "agentLocation",
          "agentLocation.status = :status",
          { status: "ACTIVE" }
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
        .getMany();
    } catch (err) {
      throw new Error(`Failed to get agents ${err.message}`);
    }
    return agentList;
  }

  public async saveOrUpdateAgent(agent: AgentDto) {
    let savedAgent;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { agentLocation, ...agentPayload } = agent;

      savedAgent = await queryRunner.manager.save(AgentEntity, agentPayload);

      // Get all admins once (outside loop would be even better)
      const adminList = await this.agentRepo.find({
        where: { role: "ADMIN" },
      });

      await Promise.all(
        agentLocation.map(async (loc) => {
          // Save agent's own location
          const savedLoc = await queryRunner.manager.save(AgentLocationEntity, {
            ...loc,
            agent: savedAgent,
          });

          await Promise.all(
            adminList.map(async (admin) => {
              const existing = await this.agentLocationRepo.findOne({
                where: {
                  agent: { id: admin.id },
                  location: { id: loc.location.id },
                  phase: { id: loc.phase.id },
                },
              });

              if (!existing) {
                // Create a NEW object — DO NOT reuse loc
                let { id, status, createdOn, supportPerson, ...locRest } = loc;
                await queryRunner.manager.save(AgentLocationEntity, {
                  ...locRest,
                  agent: admin,
                });
              }
            })
          );
        })
      );

      await queryRunner.commitTransaction();

      let agentWithRelations = await this.agentRepo
        .createQueryBuilder("agent")
        .leftJoinAndSelect(
          "agent.agentLocation",
          "agentLocation",
          "agentLocation.status = :status",
          { status: "ACTIVE" }
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
