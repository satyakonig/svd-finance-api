import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { DayService } from "../service/day.service";

@Controller("day")
@UseGuards(JwtAuthGuard)
export class DayController {
  constructor(private dayService: DayService) {}

  @Get("getall")
  public getDayList(@Query("name") name: any, @Query("status") status: any) {
    return this.dayService.getDayList(name, status);
  }

  @Post("save")
  public saveOrUpdateDay(@Body() payload: any) {
    return this.dayService.saveOrUpdateDay(payload);
  }
}
