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
      const { loan, ...payload } = loanPayment;
      let savedPayment: LoanPaymentEntity;
      let updatedBalanceAmount: number;
      let prevPayment: LoanPaymentEntity;

      if (payload?.id) {
        prevPayment = await this.loanPaymentRepo.findOne({
          where: {
            id: payload?.id ?? undefined,
          },
        });
        const balanceAmountDiff = prevPayment.amount - Number(payload.amount);

        updatedBalanceAmount = loan?.balanceAmount + balanceAmountDiff;
        loan.balanceAmount = updatedBalanceAmount;
      } else {
        updatedBalanceAmount = loan?.balanceAmount - loanPayment?.amount;
        loan.balanceAmount = updatedBalanceAmount;
      }

      await queryRunner.manager.save(LoanEntity, loan);

      savedPayment = await queryRunner.manager.save(
        LoanPaymentEntity,
        loanPayment
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
    let payments: LoanPaymentEntity[];

    try {
      payments = await this.loanPaymentRepo.find({
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
}
