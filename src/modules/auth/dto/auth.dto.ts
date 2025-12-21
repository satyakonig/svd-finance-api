import { AgentDto } from "../../models/dto/agent.dto";

export interface AuthDto {
  token: string;
  user: AgentDto;
}
