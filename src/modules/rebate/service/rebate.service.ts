import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RebateEntity } from "../../models/entity/rebate.entity";
import { DataSource, Repository } from "typeorm";
import { LoanEntity } from "../../models/entity/loan.entity";

@Injectable()
export class RebateService {
  constructor(
    @InjectRepository(RebateEntity)
    private rebateRepo: Repository<RebateEntity>,
    private readonly dataSource: DataSource,
  ) {}

  public async getPayments(loanId: any, date: any) {
    try {
      let payments: RebateEntity[];
      payments = await this.rebateRepo.find({
        where: {
          loan: { id: loanId ?? undefined },
          date: date ?? undefined,
        },
      });
      return payments;
    } catch (err) {
      throw new Error(`Failed to get payment list - ${err}`);
    }
  }

  public async saveOrUpdatePayment(rebatePayment: RebateEntity) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { loan, amount, date } = rebatePayment;

      const prevPayment = await queryRunner.manager.findOne(RebateEntity, {
        where: {
          date,
          loan: { id: loan.id },
        },
      });

      let updatedBalance = loan.balanceAmount;
      let updatedRebateBalance = loan.amountRebate;

      if (prevPayment) {
        // revert old payment and apply new payment
        updatedRebateBalance -= prevPayment.amount;
        updatedBalance += prevPayment.amount;
      }

      updatedBalance -= Number(amount);
      updatedRebateBalance += Number(amount);
      loan.amountRebate = updatedRebateBalance;
      loan.balanceAmount = updatedBalance;

      await queryRunner.manager.save(LoanEntity, loan);

      const savedPayment = await queryRunner.manager.save(
        RebateEntity,
        prevPayment ? { ...prevPayment, ...rebatePayment } : rebatePayment,
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

  public async getPayment(loanId: any, paymentId: any, date: any) {
    try {
      let payment: RebateEntity;
      payment = await this.rebateRepo.findOne({
        where: {
          id: paymentId ?? undefined,
          loan: { id: loanId ?? undefined },
          date: date ?? undefined,
        },
      });
      return payment ?? {};
    } catch (err) {
      throw new Error(`Failed to get payment list - ${err}`);
    }
  }
}
