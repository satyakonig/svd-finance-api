import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { PhaseService } from "../service/phase.service";

@Controller("phase")
@UseGuards(JwtAuthGuard)
export class PhaseController {
  constructor(private phaseService: PhaseService) {}

  @Get("list")
  public getPhaseList(@Query("name") name: any, @Query("status") status: any) {
    return this.phaseService.getPhaseList(name, status);
  }

  @Post("save")
  public saveOrUpdatePhase(@Body() payload: any) {
    return this.phaseService.saveOrUpdatePhase(payload);
  }
}
