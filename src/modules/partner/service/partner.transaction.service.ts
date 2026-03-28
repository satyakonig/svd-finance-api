import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { reponseGenerator } from "../../../util/common";
import { PartnerTransactionEntity } from "../../models/entity/partner.transaction.entity";
import { PartnerTransactionDto } from "../../models/dto/partner.transaction.dto";
import { LocationEntity } from "../../models/entity/location.entity";
import { PARTNER_TRANSACTION_TYPES } from "../../../util/constants";

@Injectable()
export class PartnerTransactionService {
  constructor(
    @InjectRepository(PartnerTransactionEntity)
    private partnerTransactionRepo: Repository<PartnerTransactionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getPartnerransaction(id: number) {
    if (!id) {
      throw new Error("no parameters are passed");
    }

    try {
      let partnerTransaction = this.partnerTransactionRepo
        .createQueryBuilder("partnerTransaction")
        .leftJoinAndSelect("partnerTransaction.location", "location")
        .where("partnerTransaction.id = :id", { id })
        .getOne();

      return partnerTransaction;
    } catch (err) {
      throw new Error("Failed to get transaction list");
    }
  }

  async getPartnerTransactionList(
    date: any,
    locationId: any,
    status: any,
    pageIndex: number,
    pageSize: number,
  ) {
    if (!locationId && !date) {
      throw new Error("no parameters are passed");
    }

    try {
      let query = this.partnerTransactionRepo
        .createQueryBuilder("partnerTransaction")
        .select([
          "partnerTransaction.id AS id",
          "partnerTransaction.status AS status",
          "partnerTransaction.name AS name",
          "partnerTransaction.type AS type",
          "partnerTransaction.date AS date",
          "partnerTransaction.amount AS amount",
          "location.name AS locationname",
        ])
        .leftJoin("partnerTransaction.location", "location")
        .where(date ? "partnerTransaction.date = :date" : "1=1", { date })
        .andWhere(locationId ? "location.id = :locationId" : "1=1", {
          locationId,
        })
        .andWhere(status ? "partnerTransaction.status = :status" : "1=1", {
          status,
        });

      if (pageIndex != null && pageSize != null) {
        query.offset(pageIndex * pageSize).limit(pageSize);
      }

      let list = await query.getRawMany();
      let count = await query.getCount();

      return { list, count };
    } catch (err) {
      throw new Error("Failed to get transaction list");
    }
  }

  public async saveOrUpdatePartnerTransaction(
    partnerTransaction: PartnerTransactionDto,
  ) {
    let queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const prevPartnerTransaction = await queryRunner.manager.findOne(
        PartnerTransactionEntity,
        {
          where: {
            id: partnerTransaction?.id,
          },
        },
      );

      let location = await queryRunner.manager.findOne(LocationEntity, {
        where: {
          id: partnerTransaction?.location?.id,
        },
      });

      let updatedBalance = Number(location.reserveFund);

      if (
        prevPartnerTransaction?.type === PARTNER_TRANSACTION_TYPES.INVESTMENT
      ) {
        updatedBalance = updatedBalance - Number(prevPartnerTransaction.amount);
      }

      if (prevPartnerTransaction?.type === PARTNER_TRANSACTION_TYPES.WITHDRAW) {
        updatedBalance = updatedBalance + Number(prevPartnerTransaction.amount);
      }

      if (partnerTransaction?.type === PARTNER_TRANSACTION_TYPES.INVESTMENT) {
        updatedBalance = updatedBalance + Number(partnerTransaction?.amount);
      }
      if (partnerTransaction?.type === PARTNER_TRANSACTION_TYPES.WITHDRAW) {
        updatedBalance = updatedBalance - Number(partnerTransaction?.amount);
      }

      location.reserveFund = updatedBalance;

      await queryRunner.manager.save(LocationEntity, location);

      let savedPartnerTransaction = await queryRunner.manager.save(
        PartnerTransactionEntity,
        partnerTransaction,
      );

      await queryRunner.commitTransaction();

      let savedOrUpdatedPartnerTransaction = await queryRunner.manager
        .createQueryBuilder(PartnerTransactionEntity, "partnerTransaction")
        .leftJoin("partnerTransaction.location", "location")
        .select([
          "partnerTransaction.id AS id",
          "partnerTransaction.status AS status",
          "partnerTransaction.name AS name",
          "partnerTransaction.type AS type",
          "partnerTransaction.date AS date",
          "partnerTransaction.amount AS amount",
          "location.id AS locationid",
          "location.name AS locationname",
        ])
        .where("partnerTransaction.id =:id", {
          id: savedPartnerTransaction?.id,
        })
        .getRawOne();

      return {
        successMessage: reponseGenerator(
          "Payment",
          partnerTransaction?.id,
          partnerTransaction?.status,
        ),
        result: savedOrUpdatedPartnerTransaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Failed to update Partner transaction: ${error?.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
