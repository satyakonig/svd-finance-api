import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChitTransactionEntity } from "../../models/entity/chit.transaction.entity";
import { ChitTransactionDto } from "../../models/dto/chit.transaction.dto";
import { reponseGenerator } from "../../../util/common";

@Injectable()
export class ChitTransactionService {
  constructor(
    @InjectRepository(ChitTransactionEntity)
    private chitTransactionRepo: Repository<ChitTransactionEntity>
  ) {}

  async getChitTransaction(id: number) {
    try {
      let chitTransaction = this.chitTransactionRepo
        .createQueryBuilder("chitTransaction")
        .leftJoinAndSelect("chitTransaction.agentLocation", "agentLocation")
        .where("chitTransaction.id =:id", { id })
        .getOne();

      return chitTransaction;
    } catch (err) {
      throw new Error("Failed to get chit list");
    }
  }

  async getChitTransactionList(
    date: any,
    phaseId: any,
    locationId: any,
    status: any,
    pageIndex: number,
    pageSize: number
  ) {
    try {
      let query = this.chitTransactionRepo
        .createQueryBuilder("chitTransaction")
        .select([
          "chitTransaction.id AS id",
          "chitTransaction.description AS description",
          "chitTransaction.type AS type",
          "chitTransaction.date AS date",
          "chitTransaction.amount AS amount",
          "agent.name AS agentname",
        ])
        .leftJoin("chitTransaction.agentLocation", "agentLocation")
        .leftJoin("agentLocation.agent", "agent")
        .leftJoin("agentLocation.phase", "phase")
        .leftJoin("agentLocation.location", "location")
        .where("agent.status =:status", { status })
        .andWhere("chitTransaction.date =:date", { date })
        .andWhere("phase.id =:phaseId", { phaseId })
        .andWhere("location.id =:locationId", { locationId });

      if (pageIndex != null && pageSize != null) {
        query.offset(pageIndex * pageSize).limit(pageSize);
      }

      let list = await query.getRawMany();
      let count = await query.getCount();

      return { list, count };
    } catch (err) {
      throw new Error("Failed to get chit list");
    }
  }

  public async saveOrUpdateChitTransaction(chit: ChitTransactionDto) {
    try {
      let savedChitTransaction = await this.chitTransactionRepo.save(
        ChitTransactionDto.toEntity(chit)
      );

      let saveOrUpdatedSpentWithRelation = await this.chitTransactionRepo
        .createQueryBuilder("chitTransaction")
        .leftJoin("chitTransaction.agentLocation", "agentLocation")
        .leftJoin("agentLocation.agent", "agent")
        .select([
          "chitTransaction.id AS id",
          "chitTransaction.description AS description",
          "chitTransaction.type AS type",
          "chitTransaction.date AS date",
          "chitTransaction.amount AS amount",
          "agent.name AS agentname",
        ])
        .where("chitTransaction.id =:id", { id: savedChitTransaction?.id })
        .getRawOne();

      return {
        successMessage: reponseGenerator("Chit", chit?.id, chit?.status),
        result: saveOrUpdatedSpentWithRelation,
      };
    } catch (error) {
      throw new Error("Failed to update chit transaction");
    }
  }
}
