import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, Repository } from "typeorm";
import { AgentEntity } from "../../models/entity/agent.entity";
import { AgentDto } from "../../models/dto/agent.dto";
import { AgentLocationEntity } from "../../models/entity/agent.location.entity";

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private agentRepo: Repository<AgentEntity>,
    @InjectRepository(AgentLocationEntity)
    private agentLocationRepo: Repository<AgentLocationEntity>,
    private readonly dataSource: DataSource
  ) {}

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
      throw new Error("Failed to get agent list");
    }
    return agentList;
  }

  public async saveOrUpdateAgent(agent: AgentDto): Promise<AgentEntity> {
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
                await queryRunner.manager.save(AgentLocationEntity, {
                  ...loc,
                  agent: admin,
                });
              }
            })
          );
        })
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }

    return savedAgent;
  }

  async getAreaList(agentId: number, status: string) {
    let areaList;
    try {
      areaList = await this.agentRepo
        .createQueryBuilder("agent")
        .leftJoin("agent.agentLocation", "agentLocation")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("location.areaList", "areaList")
        .where(agentId ? "agent.id = :agentId" : "1=1", { agentId })
        .andWhere(status ? "areaList.status = :status" : "1=1", { status })
        .select([
          "areaList.id AS id",
          "areaList.name AS name",
          "areaList.createdOn AS createdOn",
        ])
        .getRawMany();
    } catch (err) {
      throw new Error("Failed to get area list");
    }
    return areaList;
  }
}
