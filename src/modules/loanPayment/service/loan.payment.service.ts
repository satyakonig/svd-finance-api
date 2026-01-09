//collection with location list

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { LoanPaymentEntity } from "../../models/entity/loan-payment.entity";
import { LoanEntity } from "../../models/entity/loan.entity";

@Injectable()
export class LoanPaymentService {
  constructor(
    @InjectRepository(LoanPaymentEntity)
    private loanPaymentRepo: Repository<LoanPaymentEntity>,
    private readonly dataSource: DataSource
  ) {}

  public async saveOrUpdatePayment(loanPayment: LoanPaymentEntity) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { loan, amount, paymentDate } = loanPayment;

      const prevPayment = await queryRunner.manager.findOne(LoanPaymentEntity, {
        where: {
          paymentDate,
          loan: { id: loan.id },
        },
      });

      let updatedBalance = loan.balanceAmount;

      if (prevPayment) {
        // revert old payment and apply new payment
        updatedBalance += prevPayment.amount;
      }

      updatedBalance -= Number(amount);
      loan.balanceAmount = updatedBalance;

      await queryRunner.manager.save(LoanEntity, loan);

      const savedPayment = await queryRunner.manager.save(
        LoanPaymentEntity,
        prevPayment ? { ...prevPayment, ...loanPayment } : loanPayment
      );

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  public async getPayment(loanId: any, date: any) {
    let payments = {};

    try {
      payments = await this.loanPaymentRepo.findOne({
        where: {
          loan: { id: loanId ?? undefined },
          paymentDate: date ?? undefined,
        },
        relations: ["agentLocation", "agentLocation.agent"],
      });
    } catch (err) {
      throw new Error(`Failed to get payment list - ${err}`);
    }

    return payments;
  }

  public async getPaymentsList(loanId: any) {
    let payments: LoanPaymentEntity[];

    try {
      payments = await this.loanPaymentRepo
        .createQueryBuilder("loanPayment")
        .select([
          "loanPayment.id AS id",
          "loanPayment.paymentDate AS paymentdate",
          "loanPayment.paymentMode AS paymentmode",
          "loanPayment.amount AS amount",
          "loanPayment.status AS status",
          "agent.name AS agentname",
        ])
        .leftJoin("loanPayment.agentLocation", "agentLocation")
        .leftJoin("loanPayment.loan", "loan")
        .leftJoin("agentLocation.agent", "agent")
        .where("loan.id = :loanId", { loanId })
        .getRawMany();

      return payments;
    } catch (err) {
      throw new Error(`Failed to get payment list - ${err}`);
    }
  }
}
