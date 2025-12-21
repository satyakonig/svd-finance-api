import { AgentLocationEntity } from "../entity/agent.location.entity";
import { AgentDto } from "./agent.dto";
import { BaseDto } from "./base.dto";
import { DayDto } from "./day.dto";
import { LocationDto } from "./location.dto";
import { PhaseDto } from "./phase.dto";

export class AgentLocationDto extends BaseDto {
  supportPerson: string;
  day: DayDto;
  location: LocationDto;
  phase: PhaseDto;
  agent: AgentDto;

  public static fromEntity(
    agentLocationEntity: AgentLocationEntity
  ): AgentLocationDto {
    if (!agentLocationEntity) return null;
    const { ...agentLocationObject } = agentLocationEntity;
    const dto: AgentLocationDto = {
      ...agentLocationObject,
    };
    return dto;
  }

  public static toEntity(
    loanDurationDto: AgentLocationDto
  ): AgentLocationEntity {
    if (!loanDurationDto) return null;
    const { ...agentLocationObject } = loanDurationDto;
    const entity: AgentLocationEntity = {
      ...agentLocationObject,
    };
    return entity;
  }
}
