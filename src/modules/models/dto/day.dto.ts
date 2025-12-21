import { DayEntity } from "../entity/day.entity";
import { BaseDto } from "./base.dto";

export class DayDto extends BaseDto {
  name: string;

  public static fromEntity(dayEntity: DayEntity): DayDto {
    if (!dayEntity) return null;
    const { ...dayObject } = dayEntity;
    const dto: DayDto = {
      ...dayObject,
    };
    return dto;
  }

  public static toEntity(dayDto: DayDto): DayEntity {
    if (!dayDto) return null;
    const { ...dayObject } = dayDto;
    const entity: DayEntity = {
      ...dayObject,
    };
    return entity;
  }
}
