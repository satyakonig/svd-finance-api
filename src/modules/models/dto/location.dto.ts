import { LocationEntity } from "../entity/location.entity";
import { AreaDto } from "./area.dto";
import { BaseDto } from "./base.dto";

export class LocationDto extends BaseDto {
  name: string;
  areaList: AreaDto[];

  public static fromEntity(locationEntity: LocationEntity): LocationDto {
    if (!locationEntity) return null;
    const { ...locationObject } = locationEntity;
    const dto: LocationDto = {
      ...locationObject,
    };
    return dto;
  }

  public static toEntity(locationDto: LocationDto): LocationEntity {
    if (!locationDto) return null;
    const { ...locationObject } = locationDto;
    const entity: LocationEntity = {
      ...locationObject,
    };
    return entity;
  }
}
