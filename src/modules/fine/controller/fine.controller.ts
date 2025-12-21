import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { FineService } from "../service/fine.service";

@Controller("fine")
@UseGuards(JwtAuthGuard)
export class FineController {
  constructor(private fine: FineService) {}

  @Post("save")
  public saveOrUpdatePayment(@Body() payload: any) {
    return this.fine.saveOrUpdatePayment(payload);
  }

  @Get("get")
  public getPayment(@Query("loanId") loanId: any, @Query("date") date: any) {
    return this.fine.getPayment(loanId, date);
  }
}
