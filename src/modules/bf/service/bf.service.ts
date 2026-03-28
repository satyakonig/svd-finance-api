import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Equal, LessThan, Repository } from "typeorm";
import { BFEntity } from "../../models/entity/bf.entity";
import { BFDto } from "../../models/dto/bf.dto";
import { LoanEntity } from "../../models/entity/loan.entity";
import { LoanPaymentEntity } from "../../models/entity/loan-payment.entity";
import { SpentEntity } from "../../models/entity/spent.entity";
import { getPhase, reponseGenerator } from "../../../util/common";
import { LocationEntity } from "../../models/entity/location.entity";
import { AgentLocationEntity } from "../../models/entity/agent.location.entity";
import { FineEntity } from "../../models/entity/fine.entity";
import { ChitTransactionEntity } from "../../models/entity/chit.transaction.entity";
import { RebateEntity } from "../../models/entity/rebate.entity";

@Injectable()
export class BFService {
  constructor(
    @InjectRepository(BFEntity)
    private bfRepo: Repository<BFEntity>,
    @InjectRepository(LoanEntity)
    private loanRepo: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private loanPaymentRepo: Repository<LoanPaymentEntity>,
    @InjectRepository(SpentEntity)
    private spentRepo: Repository<SpentEntity>,
    @InjectRepository(FineEntity)
    private fineRepo: Repository<FineEntity>,
    @InjectRepository(RebateEntity)
    private rebateRepo: Repository<RebateEntity>,
    @InjectRepository(AgentLocationEntity)
    private agentLocationRepo: Repository<AgentLocationEntity>,
    @InjectRepository(LocationEntity)
    private locationRepo: Repository<LocationEntity>,
    @InjectRepository(ChitTransactionEntity)
    private chitTransactionRepo: Repository<ChitTransactionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getBFList(
    fromDate: any,
    toDate: any,
    date: any,
    phaseId: any,
    locationId: any,
    pageIndex: number = 0,
    pageSize: number = 10,
  ) {
    try {
      let query = this.bfRepo
        .createQueryBuilder("bf")
        .select([
          "bf.id AS id",
          "bf.status AS status",
          "bf.bfDate AS bfdate",
          "bf.previousBf AS previousbf",
          "bf.collectionTotal AS collectiontotal",
          "bf.finesTotal AS finestotal",
          "bf.paymentTotal AS paymenttotal",
          "bf.spentTotal AS spenttotal",
          "bf.interestTotal AS interesttotal",
          "bf.rebateTotal AS rebatetotal",
          "bf.bf AS bf",
          "bf.finalBf AS finalBf",
          "bf.addedAmount AS addedamount",
          "bf.transferedAmount AS transferedamount",
          "bf.bfType AS bftype",
          "bf.addedFrom AS addedfrom",
          "bf.transferedTo AS transferedto",
          "bf.chitInstallment AS chitinstallment",
          "bf.chitWithdraw AS chitwithdraw",
          "agent.name AS agentname",
          "location.name AS locationname",
          "phase.name AS phasename",
        ])
        .leftJoin("bf.agentLocation", "agentLocation")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.agent", "agent")
        .leftJoin("agentLocation.phase", "phase")
        .where(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
        .andWhere(locationId ? "location.id = :locationId" : "1=1", {
          locationId,
        })
        .andWhere(date ? "bf.bfDate = :date" : "1=1", { date })
        .andWhere(
          fromDate && toDate
            ? "bf.bfDate BETWEEN :fromDate AND :toDate"
            : "1=1",
          { fromDate, toDate },
        )
        .orderBy("bf.id", "ASC")
        .skip(pageIndex * pageSize)
        .take(pageSize);

      let list = await query.getRawMany();
      let count = await query.getCount();

      return { list, count };
    } catch (err) {
      throw new Error("Failed to get BF list");
    }
  }

  public async saveOrUpdateBF(bf: BFDto) {
    let queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const prevBf = await queryRunner.manager.findOne(BFEntity, {
        where: {
          id: bf?.id,
        },
      });

      let savedBF = await queryRunner.manager.save(BFEntity, bf);

      let location = await queryRunner.manager.findOne(LocationEntity, {
        where: {
          id: bf?.agentLocation?.location?.id,
        },
      });

      let updatedBalance = Number(location.reserveFund);

      if (prevBf?.bfType === "Transfer & Carry Forward") {
        updatedBalance = updatedBalance - Number(prevBf.transferedAmount);
      }

      if (prevBf?.bfType === "Add & Carry Forward") {
        updatedBalance = updatedBalance + Number(prevBf.addedAmount);
      }

      if (prevBf?.bfType === "Add & Transfer & Carry Forward") {
        updatedBalance =
          updatedBalance -
          Number(prevBf.transferedAmount) +
          Number(prevBf.addedAmount);
      }

      if (bf?.bfType === "Transfer & Carry Forward") {
        updatedBalance = updatedBalance + Number(bf?.transferedAmount);
      }

      if (bf?.bfType === "Add & Carry Forward") {
        updatedBalance = updatedBalance - Number(bf?.addedAmount);
      }
      if (bf?.bfType === "Add & Transfer & Carry Forward") {
        updatedBalance =
          updatedBalance +
          Number(bf?.transferedAmount) -
          Number(bf?.addedAmount);
      }

      location.reserveFund = updatedBalance;

      await queryRunner.manager.save(LocationEntity, location);

      await queryRunner.commitTransaction();

      let savedBfWithRelations = await queryRunner.manager
        .createQueryBuilder(BFEntity, "bf")
        .select([
          "bf.id AS id",
          "bf.status AS status",
          "bf.bfDate AS bfdate",
          "bf.previousBf AS previousbf",
          "bf.collectionTotal AS collectiontotal",
          "bf.finesTotal AS finestotal",
          "bf.paymentTotal AS paymenttotal",
          "bf.spentTotal AS spenttotal",
          "bf.interestTotal AS interesttotal",
          "bf.rebateTotal AS rebatetotal",
          "bf.bf AS bf",
          "bf.finalBf AS finalBf",
          "bf.addedAmount AS addedamount",
          "bf.transferedAmount AS transferedamount",
          "bf.bfType AS bftype",
          "bf.addedFrom AS addedfrom",
          "bf.transferedTo AS transferedto",
          "bf.chitInstallment AS chitinstallment",
          "bf.chitWithdraw AS chitwithdraw",
          "agent.name AS agentname",
          "location.name AS locationname",
          "phase.name AS phasename",
        ])
        .leftJoin("bf.agentLocation", "agentLocation")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.agent", "agent")
        .leftJoin("agentLocation.phase", "phase")
        .where("bf.id = :id", { id: savedBF?.id })
        .getRawOne();

      return {
        successMessage: reponseGenerator("BF", bf?.id, bf?.status),
        result: savedBfWithRelations,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to save or update BF Error: ${error?.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  public async generateBF(
    date: string,
    phaseId: number,
    locationId: number,
    regenerate: boolean,
  ) {
    // --- 1. Fetch existing BF if present ---
    const existingBf = await this.bfRepo.findOne({
      where: {
        bfDate: date,
        agentLocation: {
          location: { id: locationId },
          phase: { id: phaseId },
        },
      },
    });

    if (existingBf && !regenerate) {
      return existingBf;
    }

    // --- 2. Count unique phases for previous-phase logic ---
    const phaseCountRaw = await this.agentLocationRepo
      .createQueryBuilder("agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .where("location.id = :locationId", { locationId })
      .select("COUNT(DISTINCT phase.name)", "uniquePhaseCount")
      .getRawOne();

    const uniquePhases = Number(phaseCountRaw?.uniquePhaseCount ?? 0);

    // // Get previous phase id
    // const previousPhaseId = getPhase(uniquePhases, phaseId);

    // --- 3. Fetch previous BF ---
    const previousBfRecord = await this.bfRepo.findOne({
      where: {
        bfDate:
          uniquePhases > 1
            ? Number(phaseId) === 1
              ? LessThan(date)
              : Equal(date)
            : LessThan(date),
        agentLocation: {
          location: { id: locationId },
          phase: {
            id: uniquePhases > 1 ? (Number(phaseId) === 1 ? 2 : 1) : phaseId,
          },
        },
      },
      order: { bfDate: "DESC" },
    });

    const prevBf = Number(previousBfRecord?.finalBf ?? 0);

    // --- 4. Totals (ensure numbers) ---
    const collectionRow = await this.loanPaymentRepo
      .createQueryBuilder("loanPayment")
      .leftJoin("loanPayment.loan", "loan")
      .leftJoin("loanPayment.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .leftJoin("loan.customer", "customer")
      .select("SUM(loanPayment.amount)", "sum")
      .where("loanPayment.date = :date", { date })
      .andWhere("location.id = :locationId", { locationId })
      .andWhere("phase.id = :phaseId", { phaseId })
      .getRawOne();

    const paymentRow = await this.loanRepo
      .createQueryBuilder("loan")
      .leftJoin("loan.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(loan.loanAmount)", "loanSum")
      .addSelect("SUM(loan.payableAmount)", "payableSum")
      .where("loan.loanDate = :date", { date })
      .andWhere("loan.status = :status", { status: "ACTIVE" })
      .andWhere("location.id = :locationId", { locationId })
      .andWhere("phase.id = :phaseId", { phaseId })
      .getRawOne();

    const rebateRow = await this.rebateRepo
      .createQueryBuilder("rebate")
      .leftJoin("rebate.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(rebate.amount)", "sum")
      .where("rebate.date = :date", { date })
      .andWhere("rebate.status = :status", { status: "ACTIVE" })
      .andWhere("location.id = :locationId", { locationId })
      .andWhere("phase.id = :phaseId", { phaseId })
      .getRawOne();

    const spentRow = await this.spentRepo
      .createQueryBuilder("spent")
      .leftJoin("spent.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(spent.amount)", "sum")
      .where("spent.date = :date", { date })
      .andWhere("spent.status = :status", { status: "ACTIVE" })
      .andWhere("location.id = :locationId", { locationId })
      .andWhere("phase.id = :phaseId", { phaseId })
      .getRawOne();

    const finesRow = await this.fineRepo
      .createQueryBuilder("fine")
      .leftJoin("fine.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(fine.amount)", "sum")
      .where("fine.date = :date", { date })
      .andWhere("fine.status = :status", { status: "ACTIVE" })
      .andWhere("location.id = :locationId", { locationId })
      .andWhere("phase.id = :phaseId", { phaseId })
      .getRawOne();

    const chitsRow = await this.chitTransactionRepo
      .createQueryBuilder("chitTransaction")
      .leftJoin("chitTransaction.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(chitTransaction.amount)", "sum")
      .addSelect("chitTransaction.type", "type")
      .groupBy("chitTransaction.type")
      .where("chitTransaction.date = :date", { date })
      .andWhere("chitTransaction.status = :status", { status: "ACTIVE" })
      .andWhere("location.id = :locationId", { locationId })
      .andWhere("phase.id = :phaseId", { phaseId })
      .getRawMany();

    const formattedChitsRow = chitsRow?.reduce(
      (acc, obj) => {
        acc[obj?.type] = obj?.sum;
        return acc;
      },
      { chitInstallment: 0, chitWithdraw: 0 },
    );

    // Convert all sums to numeric
    const collectionTotal = Number(collectionRow?.sum ?? 0);
    const paymentTotal = Number(paymentRow?.loanSum ?? 0);
    const payableTotal = Number(paymentRow?.payableSum ?? 0);
    const spentTotal = Number(spentRow?.sum ?? 0);
    const finesTotal = Number(finesRow?.sum ?? 0);
    const chitsPay = Number(formattedChitsRow?.chitInstallment ?? 0);
    const chitsCollect = Number(formattedChitsRow?.chitWithdraw ?? 0);
    const rebatesTotal = Number(rebateRow?.sum ?? 0);

    // --- 5. Final BF calculation ---
    const bf =
      prevBf +
      finesTotal +
      collectionTotal -
      spentTotal -
      paymentTotal +
      chitsCollect -
      chitsPay;

    const interestTotal = payableTotal - paymentTotal;

    // --- 6. Return ---
    const resultPayload = {
      previousBf: prevBf,
      collectionTotal,
      paymentTotal,
      spentTotal,
      finesTotal,
      interestTotal,
      rebatesTotal,
      ...formattedChitsRow,
      bf,
    };

    return existingBf
      ? {
          ...existingBf,
          ...resultPayload,
          finalBf: bf + existingBf?.addedAmount - existingBf?.transferedAmount,
        }
      : { ...resultPayload, bfType: "Carry Forward", finalBf: bf };
  }

  public async getReport(date: any, phaseId: any, locationId: any) {
    const locationsList: LocationEntity[] = await this.locationRepo.find({
      where: {
        id: locationId ?? undefined,
        status: "ACTIVE",
      },
      order: {
        name: "ASC",
      },
    });

    const reportList = await Promise.all(
      locationsList.map(async ({ id: locationId, name: locationName }) => {
        const bf = await this.bfRepo
          .createQueryBuilder("bf")
          .select([
            "bf.id AS id",
            "bf.status AS status",
            "bf.bfDate AS bfdate",
            "bf.previousBf AS previousbf",
            "bf.collectionTotal AS collectiontotal",
            "bf.finesTotal AS finestotal",
            "bf.paymentTotal AS paymenttotal",
            "bf.spentTotal AS spenttotal",
            "bf.interestTotal AS interesttotal",
            "bf.rebateTotal AS rebatetotal",
            "bf.bf AS bf",
            "bf.finalBf AS finalBf",
            "bf.addedAmount AS addedamount",
            "bf.transferedAmount AS transferedamount",
            "bf.bfType AS bftype",
            "bf.addedFrom AS addedfrom",
            "bf.transferedTo AS transferedto",
            "agent.name AS agentname",
            "location.name AS locationname",
            "phase.name AS phasename",
            "bf.chitInstallment AS chitinstallment",
            "bf.chitWithdraw AS chitwithdraw",
          ])
          .leftJoin("bf.agentLocation", "agentLocation")
          .leftJoin("agentLocation.location", "location")
          .leftJoin("agentLocation.agent", "agent")
          .leftJoin("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere(date ? "bf.bfDate = :date" : "1=1", { date })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .getRawOne();

        return {
          id: locationId,
          name: locationName,
          bf,
        };
      }),
    );

    return reportList;
  }

  public async checkBF(date: string, phaseId: number, locationId: number) {
    const existingBf = await this.bfRepo.findOne({
      where: {
        bfDate: date,
        agentLocation: {
          location: { id: locationId },
          phase: { id: phaseId },
        },
      },
    });

    if (existingBf) {
      return { saved: true };
    }
    return { saved: false };
  }
}
