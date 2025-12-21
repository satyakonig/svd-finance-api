import { ChitTransactionEntity } from "../entity/chit.transaction.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";

export class ChitTransactionDto extends BaseDto {
  description: string;
  date: Date;
  amount: number;
  type: string;
  agentLocation: AgentLocationDto;

  public static fromEntity(
    chitTransactionEntity: ChitTransactionEntity
  ): ChitTransactionDto {
    if (!chitTransactionEntity) return null;
    const { ...chitTransactionObject } = chitTransactionEntity;
    const dto: ChitTransactionDto = {
      ...chitTransactionObject,
    };
    return dto;
  }

  public static toEntity(
    chitTransactionDto: ChitTransactionDto
  ): ChitTransactionEntity {
    if (!chitTransactionDto) return null;
    const { ...chitTransactionObject } = chitTransactionDto;
    const entity: ChitTransactionEntity = {
      ...chitTransactionObject,
    };
    return entity;
  }
}
