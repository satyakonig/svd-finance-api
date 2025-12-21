import { PhaseEntity } from "../entity/phase.entity";
import { BaseDto } from "./base.dto";

export class PhaseDto extends BaseDto {
  name: string;

  public static fromEntity(phaseEntity: PhaseEntity): PhaseDto {
    if (!phaseEntity) return null;
    const { ...phaseObject } = phaseEntity;
    const dto: PhaseDto = {
      ...phaseObject,
    };
    return dto;
  }

  public static toEntity(phaseDto: PhaseDto): PhaseEntity {
    if (!phaseDto) return null;
    const { ...phaseObject } = phaseDto;
    const entity: PhaseEntity = {
      ...phaseObject,
    };
    return entity;
  }
}
