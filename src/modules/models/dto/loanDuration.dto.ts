import { LoanDurationEntity } from "../entity/loanDuration.entity";
import { BaseDto } from "./base.dto";
import { LocationDto } from "./location.dto";

export class LoanDurationDto extends BaseDto {
  durationType: string;
  durationValue: number;
  intrest: number;
  location: LocationDto;

  public static fromEntity(
    loanDurationEntity: LoanDurationEntity
  ): LoanDurationDto {
    if (!loanDurationEntity) return null;
    const { ...loanDurationObject } = loanDurationEntity;
    const dto: LoanDurationDto = {
      ...loanDurationObject,
    };
    return dto;
  }

  public static toEntity(loanDurationDto: LoanDurationDto): LoanDurationEntity {
    if (!loanDurationDto) return null;
    const { ...loanDurationObject } = loanDurationDto;
    const entity: LoanDurationEntity = {
      ...loanDurationObject,
    };
    return entity;
  }
}
