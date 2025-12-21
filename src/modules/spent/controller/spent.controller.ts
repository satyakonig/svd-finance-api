import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { SpentService } from "../service/spent.service";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";

@Controller("spent")
@UseGuards(JwtAuthGuard)
export class SpentController {
  constructor(private spentService: SpentService) {}

  @Get("list")
  public getSpentList(
    @Query("agentId") agentId: any,
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any,
    @Query("status") status: any
  ) {
    return this.spentService.getSpentList(
      agentId,
      date,
      phaseId,
      locationId,
      status
    );
  }

  @Post("save")
  public saveOrUpdateSpent(@Body() payload: any) {
    return this.spentService.saveOrUpdateSpent(payload);
  }
}
