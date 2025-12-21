import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoanDurationEntity } from "../../models/entity/loanDuration.entity";
import { LoanDurationDto } from "../../models/dto/loanDuration.dto";

@Injectable()
export class LoanDurationService {
  constructor(
    @InjectRepository(LoanDurationEntity)
    private loanDurationRepo: Repository<LoanDurationEntity>
  ) {}

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
      throw new Error("Failed to get loan duration list");
    }
    return loanDurationList;
  }

  public async saveOrUpdateLoanDuration(
    loanDuration: LoanDurationDto
  ): Promise<LoanDurationEntity> {
    let savedLoanDuration: LoanDurationEntity;

    try {
      savedLoanDuration = await this.loanDurationRepo.save(
        LoanDurationDto.toEntity(loanDuration)
      );
    } catch (error) {
      throw new Error("Failed to save or update loan duration");
    }

    return savedLoanDuration;
  }
}
