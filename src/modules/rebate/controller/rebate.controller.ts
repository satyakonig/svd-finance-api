import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { RebateService } from "../service/rebate.service";

@Controller("rebate")
@UseGuards(JwtAuthGuard)
export class RebateController {
  constructor(private rebate: RebateService) {}

  @Post("save")
  public saveOrUpdatePayment(@Body() payload: any) {
    return this.rebate.saveOrUpdatePayment(payload);
  }

  @Get("get")
  public getPayment(
    @Query("loanId") loanId: any,
    @Query("paymentId") paymentId: any,
    @Query("date") date: any,
  ) {
    return this.rebate.getPayment(loanId, paymentId, date);
  }

  @Get("get/all")
  public getPayments(@Query("loanId") loanId: any, @Query("date") date: any) {
    return this.rebate.getPayments(loanId, date);
  }
}
