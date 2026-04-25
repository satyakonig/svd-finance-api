import { InLineEntity } from "../entity/inline.entity";
import { BaseDto } from "./base.dto";
import { LocationDto } from "./location.dto";

export class InLineDto extends BaseDto {
  date: Date;
  prevInLine: number;
  collection: number;
  payment: number;
  finalInLine: number;
  location: LocationDto;

  public static fromEntity(inLineEntity: InLineEntity): InLineDto {
    if (!inLineEntity) return null;
    const { ...inlineObject } = inLineEntity;
    const dto: InLineDto = {
      ...inlineObject,
    };
    return dto;
  }

  public static toEntity(inLineDto: InLineDto): InLineEntity {
    if (!inLineDto) return null;
    const { ...inlineObject } = inLineDto;
    const entity: InLineEntity = {
      ...inlineObject,
    };
    return entity;
  }
}
