import { RebateEntity } from "../entity/rebate.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";
import { LoanDto } from "./loan.dto";

export class RebateDto extends BaseDto {
  amount: number;
  date: Date;
  loan: LoanDto;
  agentLocation: AgentLocationDto;

  public static fromEntity(rebateEntity: RebateEntity): RebateDto {
    if (!rebateEntity) return null;
    const { ...rebateObject } = rebateEntity;
    const dto: RebateDto = {
      ...rebateObject,
    };
    return dto;
  }

  public static toEntity(rebateDto: RebateDto): RebateEntity {
    if (!rebateDto) return null;
    const { ...rebateObject } = rebateDto;
    const entity: RebateEntity = {
      ...rebateObject,
    };
    return entity;
  }
}
