import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SpentDto } from "../../models/dto/spent.dto";
import { SpentEntity } from "../../models/entity/spent.entity";
import { Repository } from "typeorm";
import { reponseGenerator } from "../../../util/common";

@Injectable()
export class SpentService {
  constructor(
    @InjectRepository(SpentEntity)
    private spentRepo: Repository<SpentEntity>
  ) {}

  async getSpent(id: number) {
    let spent: SpentEntity;
    try {
      spent = await this.spentRepo.findOne({
        where: {
          id: id ?? null,
        },
        relations: [
          "agentLocation",
          "agentLocation.agent",
          "agentLocation.location",
        ],
        order: {
          expenseDescription: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get spent list");
    }
    return spent;
  }

  async getSpentList(
    agentId: any,
    date: any,
    phaseId: any,
    locationId: any,
    status: any,
    pageIndex: number,
    pageSize: number
  ) {
    try {
      let query = this.spentRepo
        .createQueryBuilder("spent")
        .select([
          "spent.id AS id",
          "spent.expenseDescription AS expensedescription",
          "spent.amount AS amount",
          "agent.name AS agentname",
        ])
        .leftJoin("spent.agentLocation", "agentLocation")
        .leftJoin("agentLocation.agent", "agent")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.phase", "phase")
        .where("location.id =:locationId", { locationId })
        .andWhere("phase.id =:phaseId", { phaseId })
        .andWhere("spent.paymentDate =:date", { date })
        .andWhere("spent.status =:status", { status });

      if (pageIndex && pageSize) {
        query.offset(pageSize * pageIndex).limit(pageSize);
      }

      let list = await query.getRawMany();
      let count = await query.getCount();

      return { list, count };
    } catch (err) {
      throw new Error("Failed to get spent list");
    }
  }

  public async saveOrUpdateSpent(spent: SpentDto) {
    try {
      let saveOrUpdatedSpent: SpentEntity;
      saveOrUpdatedSpent = await this.spentRepo.save(SpentDto.toEntity(spent));

      let saveOrUpdatedSpentWithRelation = await this.spentRepo
        .createQueryBuilder("spent")
        .select([
          "spent.id AS id",
          "spent.expenseDescription AS expensedescription",
          "spent.amount AS amount",
          "agent.name AS agentname",
        ])
        .leftJoin("spent.agentLocation", "agentLocation")
        .leftJoin("agentLocation.agent", "agent")
        .where("spent.id =:id", { id: saveOrUpdatedSpent })
        .getRawOne();

      return {
        successMessage: reponseGenerator("Spent", spent?.id, spent?.status),
        result: saveOrUpdatedSpentWithRelation,
      };
    } catch (error) {
      throw new Error("Failed to update spent");
    }
  }
}
