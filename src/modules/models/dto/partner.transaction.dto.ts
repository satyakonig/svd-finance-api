import { PartnerTransactionEntity } from "../entity/partner.transaction.entity";
import { BaseDto } from "./base.dto";
import { LocationDto } from "./location.dto";

export class PartnerTransactionDto extends BaseDto {
  name: string;
  date: Date;
  amount: number;
  type: string;
  location: LocationDto;

  public static fromEntity(
    partnerTransactionEntity: PartnerTransactionEntity,
  ): PartnerTransactionDto {
    if (!partnerTransactionEntity) return null;
    const { ...partnerTransactionObject } = partnerTransactionEntity;
    const dto: PartnerTransactionDto = {
      ...partnerTransactionObject,
    };
    return dto;
  }

  public static toEntity(
    partnerTransactionDto: PartnerTransactionDto,
  ): PartnerTransactionEntity {
    if (!partnerTransactionDto) return null;
    const { ...partnerTransactionObject } = partnerTransactionDto;
    const entity: PartnerTransactionEntity = {
      ...partnerTransactionObject,
    };
    return entity;
  }
}
