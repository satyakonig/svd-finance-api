import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { formatDate, reponseGenerator } from "../../../util/common";
import { InLineEntity } from "../../models/entity/inline.entity";
import { InLineDto } from "../../models/dto/inline.dto";
import { LoanEntity } from "../../models/entity/loan.entity";
import { LoanPaymentEntity } from "../../models/entity/loan-payment.entity";

@Injectable()
export class InLineService {
  constructor(
    @InjectRepository(InLineEntity)
    private inLineRepo: Repository<InLineEntity>,
    @InjectRepository(LoanEntity)
    private loanRepo: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private loanPaymentRepo: Repository<LoanPaymentEntity>,
  ) {}

  async getInline(id: number) {
    try {
      let inline: InLineEntity;
      inline = await this.inLineRepo.findOne({
        where: {
          id: id ?? null,
        },
        relations: ["location"],
      });
      return inline;
    } catch (err) {
      throw new Error("Failed to get inline list");
    }
  }

  async getInLineList(
    fromDate: any,
    toDate: any,
    status: any,
    pageIndex: number,
    pageSize: number,
    locationId: number,
  ) {
    try {
      const start = new Date(fromDate);
      start.setDate(1);

      const end = new Date(toDate);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);

      let query = this.inLineRepo
        .createQueryBuilder("inline")
        .select([
          "inline.id AS id",
          "inline.status AS status",
          "inline.date AS date",
          "inline.prevInLine AS previnline",
          "inline.collection AS collection",
          "inline.payment AS payment",
          "inline.finalInLine AS finalInLine",
          "location.id AS locationid",
          "location.name AS locationname",
        ])
        .leftJoin("inline.location", "location")
        .where("location.id =:locationId", { locationId })
        .andWhere(
          fromDate && toDate ? "inline.date BETWEEN :start AND :end" : "1=1",
          { start, end },
        )
        .andWhere("inline.status =:status", { status });

      if (pageIndex && pageSize) {
        query.offset(pageSize * pageIndex).limit(pageSize);
      }

      let list = await query.getRawMany();
      let count = await query.getCount();

      return { list, count };
    } catch (err) {
      throw new Error("Failed to get inline list");
    }
  }

  public async saveOrUpdateInline(inline: InLineDto) {
    try {
      let saveOrUpdatedInline: InLineEntity;
      saveOrUpdatedInline = await this.inLineRepo.save(
        InLineDto.toEntity(inline),
      );

      let saveOrUpdatedInlineWithRelation = await this.inLineRepo
        .createQueryBuilder("inline")
        .select([
          "inline.id AS id",
          "inline.status AS status",
          "inline.prevInLine AS previnline",
          "inline.collection AS collection",
          "inline.payment AS payment",
          "inline.finalInLine AS finalInLine",
          "location.id AS locationid",
          "location.name AS locationname",
        ])
        .leftJoin("inline.location", "location")
        .where("inline.id =:id", { id: saveOrUpdatedInline?.id })
        .getRawOne();

      return {
        successMessage: reponseGenerator("Inline", inline?.id, inline?.status),
        result: saveOrUpdatedInlineWithRelation,
      };
    } catch (error) {
      throw new Error("Failed to update Inline");
    }
  }

  public async getMonthlyReport(locationId: number, date: any) {
    try {
      const start = new Date(date);
      start.setDate(1);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const prevStart = new Date(start);
      prevStart.setMonth(prevStart.getMonth() - 1);

      const prevEnd = new Date(start); // start of current month

      const existingReport = await this.inLineRepo
        .createQueryBuilder("inline")
        .leftJoin("inline.location", "location")
        .where("inline.status = :status", { status: "ACTIVE" })
        .andWhere("inline.date >= :start AND inline.date < :end", {
          start: formatDate(start),
          end: formatDate(end),
        })
        .getOne();

      if (existingReport?.id) {
        return existingReport;
      }

      const prevReport = await this.inLineRepo
        .createQueryBuilder("inline")
        .leftJoin("inline.location", "location")
        .andWhere("inline.date >= :start AND inline.date < :end", {
          start: formatDate(prevStart),
          end: formatDate(prevEnd),
        })
        .getOne();

      const collection = await this.loanPaymentRepo
        .createQueryBuilder("loanpayment")
        .leftJoin("loanpayment.agentLocation", "agentLocation")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.phase", "phase")
        .select("SUM(loanpayment.amount)", "collection")
        .where("location.id = :locationId", { locationId })
        .andWhere("loanpayment.date >= :start AND loanpayment.date < :end", {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
        })
        .andWhere("loanpayment.status = :status", { status: "ACTIVE" })
        .getRawOne();

      const payment = await this.loanRepo
        .createQueryBuilder("loan")
        .leftJoin("loan.agentLocation", "agentLocation")
        .leftJoin("agentLocation.agent", "agent")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.phase", "phase")
        .select("SUM(loan.payableAmount)", "payment")
        .where("location.id = :locationId", { locationId })
        .andWhere("loan.status = :status", { status: "ACTIVE" })
        .andWhere("loan.loanDate >= :start AND loan.loanDate < :end", {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
        })
        .getRawOne();

      return {
        prevInLine: prevReport?.finalInLine ?? 0,
        ...collection,
        ...payment,
      };
    } catch (err) {
      throw new Error("Failed to get report");
    }
  }
}
