import { SpentEntity } from "../entity/spent.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";

export class SpentDto extends BaseDto {
  expenseDescription: string;
  paymentDate: Date;
  amount: number;
  agentLocation: AgentLocationDto;

  public static fromEntity(spentEntity: SpentEntity): SpentDto {
    if (!spentEntity) return null;
    const { ...spentObject } = spentEntity;
    const dto: SpentDto = {
      ...spentObject,
    };
    return dto;
  }

  public static toEntity(spentDto: SpentDto): SpentEntity {
    if (!spentDto) return null;
    const { ...spentObject } = spentDto;
    const entity: SpentEntity = {
      ...spentObject,
    };
    return entity;
  }
}
