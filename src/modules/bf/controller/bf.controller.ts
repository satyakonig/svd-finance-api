import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { BFService } from "../service/bf.service";

@Controller("bf")
@UseGuards(JwtAuthGuard)
export class BFController {
  constructor(private bfService: BFService) {}

  @Get("get/list")
  public getBFList(
    @Query("fromDate") fromDate: any,
    @Query("toDate") toDate: any,
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any,
    @Query("pageIndex") pageIndex: any,
    @Query("pageSize") pageSize: any
  ) {
    return this.bfService.getBFList(
      fromDate,
      toDate,
      date,
      phaseId,
      locationId,
      pageIndex,
      pageSize
    );
  }

  @Post("save")
  public saveOrUpdateBF(@Body() payload: any) {
    return this.bfService.saveOrUpdateBF(payload);
  }

  @Get("generate")
  public generateBF(
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any,
    @Query("regenerate") regenerate: boolean
  ) {
    return this.bfService.generateBF(date, phaseId, locationId, regenerate);
  }

  @Get("report")
  public getReport(
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any
  ) {
    return this.bfService.getReport(date, phaseId, locationId);
  }

  @Get("check")
  public checkBF(
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any
  ) {
    return this.bfService.checkBF(date, phaseId, locationId);
  }
}
