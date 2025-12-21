import { AreaEntity } from "../entity/area.entity";
import { BaseDto } from "./base.dto";
import { LocationDto } from "./location.dto";

export class AreaDto extends BaseDto {
  name: string;
  location: LocationDto;

  public static fromEntity(areaEntity: AreaEntity): AreaDto {
    if (!areaEntity) return null;
    const { ...areaObject } = areaEntity;
    const dto: AreaDto = {
      ...areaObject,
    };
    return dto;
  }

  public static toEntity(areaDto: AreaDto): AreaEntity {
    if (!areaDto) return null;
    const { ...areaObject } = areaDto;
    const entity: AreaEntity = {
      ...areaObject,
    };
    return entity;
  }
}
