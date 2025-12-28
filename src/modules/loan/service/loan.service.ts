//collection with location list

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LoanDto } from "../../models/dto/loan.dto";
import { LoanEntity } from "../../models/entity/loan.entity";
import { Long, Repository } from "typeorm";
import { LoanPaymentEntity } from "../../models/entity/loan-payment.entity";
import { SpentEntity } from "../../models/entity/spent.entity";
import { LocationEntity } from "../../models/entity/location.entity";
import { BFEntity } from "../../models/entity/bf.entity";
import { FineEntity } from "../../models/entity/fine.entity";
import { error } from "console";
import { number } from "joi";

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
    private fineRepo: Repository<FineEntity>
  ) {}

  public async getLoan(
    id: number,
    status: string,
    customerId: number,
    paymentDate: string,
    payments: boolean,
    fines: boolean
  ) {
    try {
      let query = this.loanRepo
        .createQueryBuilder("loan")
        .leftJoinAndSelect("loan.loanDuration", "loanDuration")
        .leftJoinAndSelect("loan.agentLocation", "agentLocation")
        .leftJoinAndSelect("loan.customer", "customer")
        .leftJoinAndSelect("customer.area", "area")
        .where(id ? "loan.id = :id" : "1=1", { id })
        .andWhere(status ? "loan.status = :status" : "1=1", { status })
        .andWhere(customerId ? "customer.id = :customerId" : "1=1", {
          customerId,
        });

      if (payments) {
        query.leftJoinAndSelect("loan.payments", "payments");
        query
          .leftJoinAndSelect("payments.agentLocation", "paymentAgentLocation")
          .leftJoinAndSelect("paymentAgentLocation.agent", "paymentAgent");
      }

      if (fines) {
        query.leftJoinAndSelect("loan.fines", "fines");
        query
          .leftJoinAndSelect("fines.agentLocation", "fineAgentLocation")
          .leftJoinAndSelect("fineAgentLocation.agent", "fineAgent");
      }

      let loan = await query.getOne();
      return loan ?? {};
    } catch (err) {
      throw new Error(`Failed to fetch loan - ${err.message || err}`);
    }
  }

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
      /* ===================== VALIDATION ===================== */

      if (
        paymentStatus &&
        !date &&
        ["paid", "pending", "unpaid", "new", "overdue"].includes(paymentStatus)
      ) {
        throw new Error("date is required when paymentStatus is applied");
      }

      /* ======================================================
       LIST QUERY
    ====================================================== */

      const query = this.loanRepo
        .createQueryBuilder("loan")
        .select([
          "loan.id AS id",
          "loan.status AS status",
          "loan.loanDate AS loanDate",
          "loan.balanceAmount AS balanceAmount",
          "loan.label AS label",
          "customer.name AS name",
          "customer.mobileNo AS mobileno",
          "area.name AS areaname",
          "agent.name AS agentname",
          "payment.amount AS todayamount",
          "payment.paymentMode AS paymentmode",
        ])
        .distinctOn(["loan.id"])
        .leftJoin("loan.loanDuration", "loanDuration")
        .leftJoin("loan.agentLocation", "agentLocation")
        .leftJoin("loan.customer", "customer")
        .leftJoin("customer.area", "area")
        .leftJoin("agentLocation.phase", "phase")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.day", "day")
        .leftJoin("agentLocation.agent", "agent");

      if (date) {
        query.leftJoin(
          LoanPaymentEntity,
          "payment",
          "payment.loan = loan.id AND DATE(payment.paymentDate) = :date",
          { date }
        );
      }

      /* ================= PAYMENT STATUS (LIST) ================= */

      if (paymentStatus === "paid") {
        query.andWhere(
          `
        EXISTS (
          SELECT 1 FROM loan_payment_trn_tbl p
          WHERE p."LOAN_ID" = loan."ID"
            AND DATE(p."PAYMENT_DATE") = :date
            AND p."AMOUNT" != 0
        )
        `,
          { date }
        );
      }

      if (paymentStatus === "pending") {
        query.andWhere(
          `
        NOT EXISTS (
          SELECT 1 FROM loan_payment_trn_tbl p
          WHERE p."LOAN_ID" = loan."ID"
            AND DATE(p."PAYMENT_DATE") = :date
        )
        `,
          { date }
        );
        query.andWhere("loan.loanDate != :date", { date });
      }

      if (paymentStatus === "unpaid") {
        query.andWhere(
          `
        EXISTS (
          SELECT 1 FROM loan_payment_trn_tbl p
          WHERE p."LOAN_ID" = loan."ID"
            AND DATE(p."PAYMENT_DATE") = :date
            AND p."AMOUNT" = 0
        )
        `,
          { date }
        );
      }

      if (paymentStatus === "new") {
        query.andWhere("loan.loanDate = :date", { date });
      }

      if (paymentStatus === "closed") {
        query.andWhere("loan.balanceAmount = 0");
      }

      if (paymentStatus === "overdue") {
        query.andWhere(
          `
        (
          (
            (loan.payableAmount / NULLIF(loanDuration.durationValue, 0))
            *
            (
              FLOOR(
                EXTRACT(EPOCH FROM AGE(CAST(:date AS date), loan.loanDate)) /
                CASE 
                  WHEN loanDuration.durationType = 'days' THEN 86400
                  WHEN loanDuration.durationType = 'weeks' THEN 7 * 86400
                  WHEN loanDuration.durationType = 'months' THEN 30 * 86400
                  WHEN loanDuration.durationType = 'years' THEN 365 * 86400
                END
              ) - 1
            )
          )
          >
          (loan.payableAmount - loan.balanceAmount)
        )
        `,
          { date }
        );
      }

      /* ================= COMMON FILTERS ================= */

      if (date) query.andWhere("loan.loanDate <= :date", { date });
      if (loanId) query.andWhere("loan.id = :loanId", { loanId });
      if (status)
        query.andWhere("loan.status ILIKE :status", {
          status: `%${status}%`,
        });
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

      query
        .orderBy("loan.id", "DESC")
        .addOrderBy("payment.paymentDate", "DESC");

      if (pageIndex != null && pageSize != null) {
        query.offset(pageIndex * pageSize).limit(pageSize);
      }

      const list = await query.getRawMany();

      /* ======================================================
       COUNT QUERY
    ====================================================== */

      const countQuery = this.loanRepo
        .createQueryBuilder("loan")
        .select("COUNT(DISTINCT loan.id)", "count")
        .leftJoin("loan.loanDuration", "loanDuration")
        .leftJoin("loan.customer", "customer")
        .leftJoin("loan.agentLocation", "agentLocation")
        .leftJoin("agentLocation.phase", "phase")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.day", "day")
        .leftJoin("agentLocation.agent", "agent");

      if (date) countQuery.andWhere("loan.loanDate <= :date", { date });
      if (loanId) countQuery.andWhere("loan.id = :loanId", { loanId });
      if (status)
        countQuery.andWhere("loan.status ILIKE :status", {
          status: `%${status}%`,
        });
      if (customerName)
        countQuery.andWhere("customer.name ILIKE :customerName", {
          customerName: `%${customerName}%`,
        });
      if (customerId)
        countQuery.andWhere("loan.customer.id = :customerId", { customerId });
      if (mobileNo)
        countQuery.andWhere("customer.mobileNo ILIKE :mobileNo", {
          mobileNo: `%${mobileNo}%`,
        });
      if (phaseId) countQuery.andWhere("phase.id = :phaseId", { phaseId });
      if (locationId)
        countQuery.andWhere("location.id = :locationId", { locationId });
      if (label)
        countQuery.andWhere("loan.label ILIKE :label", {
          label: `%${label}%`,
        });

      /* ================= PAYMENT STATUS (COUNT) ================= */

      if (paymentStatus === "paid") {
        countQuery.andWhere(
          `
        EXISTS (
          SELECT 1 FROM loan_payment_trn_tbl p
          WHERE p."LOAN_ID" = loan."ID"
            AND DATE(p."PAYMENT_DATE") = :date
            AND p."AMOUNT" != 0
        )
        `,
          { date }
        );
      }

      if (paymentStatus === "pending") {
        countQuery.andWhere(
          `
        NOT EXISTS (
          SELECT 1 FROM loan_payment_trn_tbl p
          WHERE p."LOAN_ID" = loan."ID"
            AND DATE(p."PAYMENT_DATE") = :date
        )
        `,
          { date }
        );
        countQuery.andWhere("loan.loanDate != :date", { date });
      }

      if (paymentStatus === "unpaid") {
        countQuery.andWhere(
          `
        EXISTS (
          SELECT 1 FROM loan_payment_trn_tbl p
          WHERE p."LOAN_ID" = loan."ID"
            AND DATE(p."PAYMENT_DATE") = :date
            AND p."AMOUNT" = 0
        )
        `,
          { date }
        );
      }

      if (paymentStatus === "new") {
        countQuery.andWhere("loan.loanDate = :date", { date });
      }

      if (paymentStatus === "closed") {
        countQuery.andWhere("loan.balanceAmount = 0");
      }

      if (paymentStatus === "overdue") {
        countQuery.andWhere(
          `
        (
          (
            (loan.payableAmount / NULLIF(loanDuration.durationValue, 0))
            *
            (
              FLOOR(
                EXTRACT(EPOCH FROM AGE(CAST(:date AS date), loan.loanDate)) /
                CASE 
                  WHEN loanDuration.durationType = 'days' THEN 86400
                  WHEN loanDuration.durationType = 'weeks' THEN 7 * 86400
                  WHEN loanDuration.durationType = 'months' THEN 30 * 86400
                  WHEN loanDuration.durationType = 'years' THEN 365 * 86400
                END
              ) - 1
            )
          )
          >
          (loan.payableAmount - loan.balanceAmount)
        )
        `,
          { date }
        );
      }

      const { count } = await countQuery.getRawOne();

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

        return {
          id: locationId,
          name: locationName,
          collection,
          payments,
          spent,
          fines,
          bf,
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
