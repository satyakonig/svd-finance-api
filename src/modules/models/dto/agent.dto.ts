import { AgentEntity } from "../entity/agent.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";

export class AgentDto extends BaseDto {
  name: string;
  mobileNo: string;
  gender: string;
  username: string;
  password: string;
  role: string;
  adminControl: boolean;
  agentLocation: AgentLocationDto[];

  public static fromEntity(agentEntity: AgentEntity): AgentDto {
    if (!agentEntity) return null;
    const { ...agentObject } = agentEntity;
    const dto: AgentDto = {
      ...agentObject,
    };
    return dto;
  }

  public static toEntity(agentDto: AgentDto): AgentEntity {
    if (!agentDto) return null;
    const { ...agentObject } = agentDto;
    const entity: AgentEntity = {
      ...agentObject,
    };
    return entity;
  }
}
