import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AgentService } from "../service/agent.service";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";

@Controller("agent")
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get("username/validate")
  public validateUserName(@Query("username") username: string) {
    return this.agentService.validateUserName(username);
  }

  @Get()
  public getAgent(@Query("id") id: number) {
    return this.agentService.getAgent(id);
  }

  @Get("getall")
  public getAgentList(
    @Query("name") name: any,
    @Query("mobileNo") mobileNo: any,
    @Query("status") status: any,
    @Query("location") location: any,
    @Query("role") role: any,
    @Query("pageSize") pageSize: number,
    @Query("pageIndex") pageIndex: number
  ) {
    return this.agentService.getAgentList(
      name,
      mobileNo,
      status,
      location,
      role,
      pageSize,
      pageIndex
    );
  }

  @Post("save")
  public saveOrUpdateAgent(@Body() payload: any) {
    return this.agentService.saveOrUpdateAgent(payload);
  }
}
