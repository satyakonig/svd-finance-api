import { FineEntity } from "../entity/fine.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";
import { LoanDto } from "./loan.dto";

export class FineDto extends BaseDto {
  amount: number;
  paymentMode: string;
  fineDate: Date;
  loan: LoanDto;
  agentLocation: AgentLocationDto;

  public static fromEntity(fineEntity: FineEntity): FineDto {
    if (!fineEntity) return null;
    const { ...fineObject } = fineEntity;
    const dto: FineDto = {
      ...fineObject,
    };
    return dto;
  }

  public static toEntity(fineDto: FineDto): FineEntity {
    if (!fineDto) return null;
    const { ...fineObject } = fineDto;
    const entity: FineEntity = {
      ...fineObject,
    };
    return entity;
  }
}
