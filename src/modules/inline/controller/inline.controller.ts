import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { InLineService } from "../service/inline.service";

@Controller("inline")
@UseGuards(JwtAuthGuard)
export class InlineController {
  constructor(private inlineService: InLineService) {}

  @Get()
  public getInline(@Query("id") id: number) {
    return this.inlineService.getInline(id);
  }

  @Get("list")
  public getInLineList(
    @Query("fromDate") fromDate: any,
    @Query("toDate") toDate: any,
    @Query("status") status: any,
    @Query("pageIndex") pageIndex: any,
    @Query("pageSize") pageSize: any,
    @Query("locationId") locationId: any,
  ) {
    return this.inlineService.getInLineList(
      fromDate,
      toDate,
      status,
      pageIndex,
      pageSize,
      locationId,
    );
  }

  @Post("save")
  public saveOrUpdateInline(@Body() payload: any) {
    return this.inlineService.saveOrUpdateInline(payload);
  }

  @Get("report")
  public getMonthlyReport(
    @Query("locationId") locationId: number,
    @Query("date") date: any,
  ) {
    return this.inlineService.getMonthlyReport(locationId, date);
  }
}
