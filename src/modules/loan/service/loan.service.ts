//collection with location list

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LoanDto } from "../../models/dto/loan.dto";
import { LoanEntity } from "../../models/entity/loan.entity";
import { Repository } from "typeorm";
import { LoanPaymentEntity } from "../../models/entity/loan-payment.entity";
import { SpentEntity } from "../../models/entity/spent.entity";
import { LocationEntity } from "../../models/entity/location.entity";
import { BFEntity } from "../../models/entity/bf.entity";
import { FineEntity } from "../../models/entity/fine.entity";
import { error } from "console";
import { ChitTransactionEntity } from "../../models/entity/chit.transaction.entity";

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(LoanEntity)
    private loanRepo: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private loanPaymentRepo: Repository<LoanPaymentEntity>,
    @InjectRepository(SpentEntity)
    private spentRepo: Repository<SpentEntity>,
    @InjectRepository(LocationEntity)
    private locationRepo: Repository<LocationEntity>,
    @InjectRepository(BFEntity)
    private bfRepo: Repository<BFEntity>,
    @InjectRepository(FineEntity)
    private fineRepo: Repository<FineEntity>,
    @InjectRepository(ChitTransactionEntity)
    private chitTranRepo: Repository<ChitTransactionEntity>
  ) {}

  async getLoanList(
    loanId: any,
    status: any,
    customerName: any,
    customerId: any,
    mobileNo: any,
    phaseId: any,
    label: any,
    date: any,
    paymentStatus: any,
    pageIndex: number,
    pageSize: number,
    locationId: number
  ) {
    try {
      const query = this.loanRepo
        .createQueryBuilder("loan")
        .leftJoinAndSelect("loan.loanDuration", "loanDuration")
        .leftJoinAndSelect("loan.agentLocation", "agentLocation")
        .leftJoinAndSelect(
          "loan.payments",
          "payments",
          date ? "payments.paymentDate = :date" : "1=1",
          { date }
        )
        .leftJoinAndSelect(
          "loan.fines",
          "fines",
          date ? "fines.fineDate = :date" : "1=1",
          { date }
        )
        .leftJoinAndSelect("payments.agentLocation", "paymentAgentLocation")
        .leftJoinAndSelect("fines.agentLocation", "fineAgentLocation")
        .leftJoinAndSelect("paymentAgentLocation.agent", "paymentAgent")
        .leftJoinAndSelect("fineAgentLocation.agent", "fineAgent")
        .leftJoinAndSelect("loan.customer", "customer")
        .leftJoinAndSelect("customer.area", "area")
        .leftJoinAndSelect("agentLocation.phase", "phase")
        .leftJoinAndSelect("agentLocation.location", "location")
        .leftJoinAndSelect("agentLocation.agent", "agent");

      if (date && paymentStatus) {
        query.leftJoin(
          LoanPaymentEntity,
          "payment",
          "payment.loan = loan.id AND DATE(payment.paymentDate) = :date",
          { date }
        );

        if (paymentStatus === "paid") {
          query.andWhere("payment.id IS NOT NULL");
          query.andWhere("payment.amount != 0");
        } else if (paymentStatus === "pending") {
          query.andWhere("payment.id IS NULL");
          query.andWhere("loan.loanDate != :date", { date });
        } else if (paymentStatus === "unpaid") {
          query.andWhere("payment.amount = 0");
        } else if (paymentStatus === "new") {
          query.andWhere("loan.loanDate = :date", { date });
        } else if (paymentStatus === "closed") {
          query.andWhere("loan.balanceAmount = 0");
        } else if (paymentStatus === "overdue") {
          query.andWhere(
            `
    (
      (
        (loan.payableAmount / NULLIF(loanDuration.durationValue, 0))
        *
        (FLOOR(
          EXTRACT(EPOCH FROM AGE(CAST(:date AS date), loan.loanDate)) /
          CASE 
            WHEN loanDuration.durationType = 'days' THEN 86400
            WHEN loanDuration.durationType = 'weeks' THEN 7 * 86400
            WHEN loanDuration.durationType = 'months' THEN 30 * 86400
            WHEN loanDuration.durationType = 'years' THEN 365 * 86400
          END
        ) - 1)
      )
      >
      (loan.payableAmount - loan.balanceAmount)
    )
    `,
            { date }
          );
        }
      }
      if (date) query.andWhere("loan.loanDate <= :date", { date });
      if (loanId) query.andWhere("loan.id = :loanId", { loanId });
      if (status)
        query.andWhere("loan.status ILIKE :status", { status: `%${status}%` });
      if (customerName)
        query.andWhere("customer.name ILIKE :customerName", {
          customerName: `%${customerName}%`,
        });
      if (customerId)
        query.andWhere("loan.customer.id = :customerId", { customerId });
      if (mobileNo)
        query.andWhere("customer.mobileNo ILIKE :mobileNo", {
          mobileNo: `%${mobileNo}%`,
        });
      if (phaseId) query.andWhere("phase.id = :phaseId", { phaseId });
      if (locationId)
        query.andWhere("location.id = :locationId", { locationId });
      if (label)
        query.andWhere("loan.label ILIKE :label", {
          label: `%${label}%`,
        });

      query.orderBy("loan.label", "ASC");

      if (pageIndex != null && pageSize != null) {
        const skip = pageIndex * pageSize;
        query.skip(skip).take(pageSize);
      }

      const [list, count] = await query.getManyAndCount();
      return { list, count };
    } catch (err) {
      throw new Error(`Failed to fetch loan list - ${err.message || err}`);
    }
  }

  public async saveLoan(loan: LoanDto): Promise<LoanEntity> {
    try {
      return await this.loanRepo.save(LoanDto.toEntity(loan));
    } catch (error) {
      throw new Error("Failed to update loan");
    }
  }

  public async getReport(date: any, phaseId: any, locationId: any) {
    const locationsList: LocationEntity[] = await this.locationRepo.find({
      where: {
        id: locationId ?? undefined,
        status: "ACTIVE",
      },
    });

    const reportList = await Promise.all(
      locationsList.map(async ({ id: locationId, name: locationName }) => {
        const collection = await this.loanPaymentRepo
          .createQueryBuilder("loanpayment")
          .leftJoinAndSelect("loanpayment.loan", "loan")
          .leftJoinAndSelect("loan.customer", "customer")
          .leftJoinAndSelect("loanpayment.agentLocation", "agentLocation")
          .leftJoinAndSelect("agentLocation.location", "location")
          .leftJoinAndSelect("agentLocation.agent", "agent")
          .leftJoinAndSelect("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere(date ? "loanpayment.paymentDate = :date" : "1=1", { date })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .andWhere("loanpayment.status = :status", { status: "ACTIVE" })
          .getMany();

        const spent = await this.spentRepo
          .createQueryBuilder("spent")
          .leftJoinAndSelect("spent.agentLocation", "agentLocation")
          .leftJoinAndSelect("agentLocation.agent", "agent")
          .leftJoinAndSelect("agentLocation.location", "location")
          .leftJoinAndSelect("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere("spent.status = :status", { status: "ACTIVE" })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .andWhere(date ? "spent.paymentDate = :date" : "1=1", { date })
          .getMany();

        const payments = await this.loanRepo
          .createQueryBuilder("loan")
          .leftJoinAndSelect("loan.customer", "customer")
          .leftJoinAndSelect("loan.agentLocation", "agentLocation")
          .leftJoinAndSelect("agentLocation.agent", "agent")
          .leftJoinAndSelect("agentLocation.location", "location")
          .leftJoinAndSelect("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .andWhere(date ? "loan.loanDate = :date" : "1=1", { date })
          .andWhere("loan.status = :status", { status: "ACTIVE" })
          .getMany();

        const bf = await this.bfRepo
          .createQueryBuilder("bf")
          .leftJoinAndSelect("bf.agentLocation", "agentLocation")
          .leftJoinAndSelect("agentLocation.agent", "agent")
          .leftJoinAndSelect("agentLocation.location", "location")
          .leftJoinAndSelect("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .andWhere(date ? "bf.bfDate = :date" : "1=1", { date })
          .andWhere("bf.status = :status", { status: "ACTIVE" })
          .getMany();

        const fines = await this.fineRepo
          .createQueryBuilder("fine")
          .leftJoinAndSelect("fine.loan", "loan")
          .leftJoinAndSelect("loan.customer", "customer")
          .leftJoinAndSelect("fine.agentLocation", "agentLocation")
          .leftJoinAndSelect("agentLocation.agent", "agent")
          .leftJoinAndSelect("agentLocation.location", "location")
          .leftJoinAndSelect("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .andWhere(date ? "fine.fineDate = :date" : "1=1", { date })
          .andWhere("fine.status = :status", { status: "ACTIVE" })
          .getMany();

        const chitTrans = await this.chitTranRepo
          .createQueryBuilder("chitTran")
          .leftJoinAndSelect("chitTran.agentLocation", "agentLocation")
          .leftJoinAndSelect("agentLocation.agent", "agent")
          .leftJoinAndSelect("agentLocation.location", "location")
          .leftJoinAndSelect("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere("chitTran.status = :status", { status: "ACTIVE" })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .andWhere(date ? "chitTran.date = :date" : "1=1", { date })
          .getMany();

        return {
          id: locationId,
          name: locationName,
          collection,
          payments,
          spent,
          fines,
          bf,
          chitTrans,
        };
      })
    );

    return reportList;
  }

  public async getTotalAmountReport(date: any, phaseId: any, locationId: any) {
    const collection = await this.loanPaymentRepo
      .createQueryBuilder("loanpayment")
      .leftJoin("loanpayment.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(loanpayment.amount)", "totalCollection")
      .where("location.id = :locationId", { locationId })
      .andWhere(date ? "loanpayment.paymentDate = :date" : "1=1", { date })
      .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
      .andWhere("loanpayment.status = :status", { status: "ACTIVE" })
      .getRawOne();

    const spent = await this.spentRepo
      .createQueryBuilder("spent")
      .leftJoin("spent.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(spent.amount)", "totalSpent")
      .where("location.id = :locationId", { locationId })
      .andWhere("spent.status = :status", { status: "ACTIVE" })
      .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
      .andWhere(date ? "spent.paymentDate = :date" : "1=1", { date })
      .getRawOne();

    const payment = await this.loanRepo
      .createQueryBuilder("loan")
      .leftJoin("loan.agentLocation", "agentLocation")
      .leftJoin("agentLocation.agent", "agent")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(loan.loanAmount)", "totalPayment")
      .addSelect(
        "SUM(loan.payableAmount) - SUM(loan.loanAmount)",
        "totalIntrest"
      )
      .where("location.id = :locationId", { locationId })
      .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
      .andWhere(date ? "loan.loanDate = :date" : "1=1", { date })
      .andWhere("loan.status = :status", { status: "ACTIVE" })
      .getRawOne();

    const fine = await this.fineRepo
      .createQueryBuilder("fine")
      .leftJoin("fine.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(fine.amount)", "totalFine")
      .where("location.id = :locationId", { locationId })
      .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
      .andWhere(date ? "fine.fineDate = :date" : "1=1", { date })
      .andWhere("fine.status = :status", { status: "ACTIVE" })
      .getRawOne();

    return {
      ...collection,
      ...spent,
      ...payment,
      ...fine,
    };
  }

  public async generateSerialNo(locationId: any, phaseId: any) {
    let serialNo;
    try {
      serialNo = await this.loanRepo
        .createQueryBuilder("loan")
        .leftJoin("loan.agentLocation", "agentLocation")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.phase", "phase")
        .select("COALESCE(MAX(CAST(loan.label AS INTEGER)), 0) + 1", "count")
        .where("location.id = :locationId", { locationId })
        .andWhere("phase.id = :phaseId", { phaseId })
        .getRawOne();
    } catch (err) {
      throw error(`Failed to generate serial no ${err}`);
    }

    return serialNo;
  }
}
