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

  async getLoanDurationList(locationId: number, status: string) {
    let loanDurationList: LoanDurationEntity[];
    try {
      loanDurationList = await this.loanDurationRepo.find({
        where: {
          status: status ?? undefined,
          location: { id: locationId ?? undefined },
        },
        order: {
          location: { id: "ASC" },
        },
        relations: ["location"],
      });
    } catch (err) {
      throw new Error(`Failed to get loan durations ${err.message}`);
    }
    return loanDurationList;
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

      return {
        successMessage: reponseGenerator(
          "Duration",
          loanDuration?.id,
          loanDuration?.status
        ),
        result: saveOrUpdatedLoanDuration,
      };
    } catch (error) {
      throw new Error(
        `Failed to save or update loan duration ${error.message}`
      );
    }
  }
}
