import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { BFEntity } from "../../models/entity/bf.entity";
import { BFDto } from "../../models/dto/bf.dto";
import { LoanEntity } from "../../models/entity/loan.entity";
import { LoanPaymentEntity } from "../../models/entity/loan-payment.entity";
import { SpentEntity } from "../../models/entity/spent.entity";
import { getPhase, getPreviousPhaseAndDate } from "../../../util/common";
import { LocationEntity } from "../../models/entity/location.entity";
import { AgentLocationEntity } from "../../models/entity/agent.location.entity";
import { FineEntity } from "../../models/entity/fine.entity";
import { ChitTransactionEntity } from "src/modules/models/entity/chit.transaction.entity";

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
    @InjectRepository(ChitTransactionEntity)
    private chitTransactionRepo: Repository<ChitTransactionEntity>,
    @InjectRepository(AgentLocationEntity)
    private agentLocationRepo: Repository<AgentLocationEntity>,
    @InjectRepository(LocationEntity)
    private locationRepo: Repository<LocationEntity>
  ) {}

  async getBFList(
    fromDate: any,
    toDate: any,
    date: any,
    phaseId: any,
    locationId: any,

    pageIndex: number = 0,
    pageSize: number = 10
  ) {
    try {
      const query = this.bfRepo
        .createQueryBuilder("bf")
        .leftJoinAndSelect("bf.agentLocation", "agentLocation")
        .leftJoinAndSelect("agentLocation.location", "location")
        .leftJoinAndSelect("agentLocation.agent", "agent")
        .leftJoinAndSelect("agentLocation.phase", "phase")
        .where(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
        .andWhere(locationId ? "location.id = :locationId" : "1=1", {
          locationId,
        })
        .andWhere(date ? "bf.bfDate = :date" : "1=1", { date })
        .andWhere(
          fromDate && toDate
            ? "bf.bfDate BETWEEN :fromDate AND :toDate"
            : "1=1",
          { fromDate, toDate }
        )
        .skip(pageIndex * pageSize)
        .take(pageSize);

      const [data, count] = await query.getManyAndCount(); // <-- returns both data + total count

      return { list: data, count: count };
    } catch (err) {
      throw new Error("Failed to get BF list");
    }
  }

  public async saveOrUpdateBF(bf: BFDto): Promise<BFEntity> {
    let savedBF: BFEntity;
    try {
      savedBF = await this.bfRepo.save(BFDto.toEntity(bf));
    } catch (error) {
      throw new Error(`Failed to save or update BF Error: ${error?.message}`);
    }
    return savedBF;
  }

  public async generateBF(date: string, phaseId: number, locationId: number) {
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

    // --- 2. Count unique phases for previous-phase logic ---
    const phaseCountRaw = await this.agentLocationRepo
      .createQueryBuilder("agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .where("location.id = :locationId", { locationId })
      .select("COUNT(DISTINCT phase.name)", "uniquePhaseCount")
      .getRawOne();

    const uniquePhases = Number(phaseCountRaw?.uniquePhaseCount ?? 0);

    // Get previous phase id
    const previousPhaseId = getPhase(uniquePhases, phaseId);

    // --- 3. Fetch previous BF ---
    const previousBfRecord = await this.bfRepo.findOne({
      where: {
        bfDate: LessThan(date),
        agentLocation: {
          location: { id: locationId },
          phase: { id: previousPhaseId },
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
      .where("loanPayment.paymentDate = :date", { date })
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

    const spentRow = await this.spentRepo
      .createQueryBuilder("spent")
      .leftJoin("spent.agentLocation", "agentLocation")
      .leftJoin("agentLocation.location", "location")
      .leftJoin("agentLocation.phase", "phase")
      .select("SUM(spent.amount)", "sum")
      .where("spent.paymentDate = :date", { date })
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
      .where("fine.fineDate = :date", { date })
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

    const formattedChitsRow = chitsRow?.reduce((acc, obj) => {
      acc[obj?.type] = obj?.sum;
      return acc;
    }, {});

    // Convert all sums to numeric
    const collectionTotal = Number(collectionRow?.sum ?? 0);
    const paymentTotal = Number(paymentRow?.loanSum ?? 0);
    const payableTotal = Number(paymentRow?.payableSum ?? 0);
    const spentTotal = Number(spentRow?.sum ?? 0);
    const finesTotal = Number(finesRow?.sum ?? 0);
    const chitsPay = Number(formattedChitsRow?.chitInstallment ?? 0);
    const chitsCollect = Number(formattedChitsRow?.chitWithdraw ?? 0);

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
          .leftJoinAndSelect("bf.agentLocation", "agentLocation")
          .leftJoinAndSelect("agentLocation.location", "location")
          .leftJoinAndSelect("agentLocation.agent", "agent")
          .leftJoinAndSelect("agentLocation.phase", "phase")
          .where("location.id = :locationId", { locationId })
          .andWhere(date ? "bf.bfDate = :date" : "1=1", { date })
          .andWhere(phaseId ? "phase.id = :phaseId" : "1=1", { phaseId })
          .getOne();

        return {
          id: locationId,
          name: locationName,
          bf,
        };
      })
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
