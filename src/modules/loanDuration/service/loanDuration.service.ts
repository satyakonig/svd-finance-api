import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { LoanDurationEntity } from "../../models/entity/loanDuration.entity";
import { LoanDurationDto } from "../../models/dto/loanDuration.dto";
import { reponseGenerator } from "../../../util/common";

@Injectable()
export class LoanDurationService {
  constructor(
    @InjectRepository(LoanDurationEntity)
    private loanDurationRepo: Repository<LoanDurationEntity>
  ) {}

  async getLoanDuration(id: number) {
    let loanDuration: LoanDurationEntity;
    try {
      loanDuration = await this.loanDurationRepo.findOne({
        where: {
          id: id ?? undefined,
        },
        relations: ["location"],
      });
    } catch (err) {
      throw new Error(`Failed to get loan duration ${err.message}`);
    }
    return loanDuration;
  }

  async getLoanDurationList(
    locationId: number,
    status: string,
    pageSize: number,
    pageIndex: number
  ) {
    try {
      let query = this.loanDurationRepo
        .createQueryBuilder("loanDuration")
        .select([
          "loanDuration.id AS id",
          "loanDuration.durationType AS durationtype",
          "loanDuration.durationValue AS durationValue",
          "loanDuration.intrest AS intrest",
          "location.name AS locationname",
        ])
        .leftJoin("loanDuration.location", "location")
        .where("loanDuration.status = :status", { status })
        .andWhere("location.id = :locationId", { locationId })
        .offset(pageSize * pageIndex)
        .limit(pageSize)
        .orderBy("loanDuration.durationType", "ASC");

      let list = await query.getRawMany();
      let count = await query.getCount();
      return { list, count };
    } catch (err) {
      throw new Error(`Failed to get loan durations ${err.message}`);
    }
  }

  public async saveOrUpdateLoanDuration(loanDuration: LoanDurationDto) {
    try {
      let existingLoanDuration = await this.loanDurationRepo.findOne({
        where: {
          durationType: loanDuration?.durationType,
          durationValue: loanDuration?.durationValue,
          intrest: loanDuration?.intrest,
          location: { id: loanDuration?.location?.id },
        },
      });

      if (existingLoanDuration && !loanDuration?.id) {
        return { infoMessage: "Duration already exists" };
      }
      let saveOrUpdatedLoanDuration = await this.loanDurationRepo.save(
        LoanDurationDto.toEntity(loanDuration)
      );

      let saveOrUpdatedLoanDurationWithRelations = await this.loanDurationRepo
        .createQueryBuilder("loanDuration")
        .select([
          "loanDuration.id AS id",
          "loanDuration.durationType AS durationtype",
          "loanDuration.durationValue AS durationValue",
          "loanDuration.intrest AS intrest",
          "location.name AS locationname",
        ])
        .leftJoin("loanDuration.location", "location")
        .where("loanDuration.id =:id", { id: saveOrUpdatedLoanDuration?.id })
        .getRawOne();

      return {
        successMessage: reponseGenerator(
          "Duration",
          loanDuration?.id,
          loanDuration?.status
        ),
        result: saveOrUpdatedLoanDurationWithRelations,
      };
    } catch (error) {
      throw new Error(
        `Failed to save or update loan duration ${error.message}`
      );
    }
  }
}
