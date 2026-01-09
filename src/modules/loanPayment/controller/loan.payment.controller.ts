import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { LoanPaymentService } from "../service/loan.payment.service";

@Controller("loanPayment")
@UseGuards(JwtAuthGuard)
export class LoanPaymentController {
  constructor(private loanPayment: LoanPaymentService) {}

  @Post("save")
  public saveOrUpdatePayment(@Body() payload: any) {
    return this.loanPayment.saveOrUpdatePayment(payload);
  }

  @Get("get")
  public getPayment(@Query("loanId") loanId: any, @Query("date") date: any) {
    return this.loanPayment.getPayment(loanId, date);
  }

  @Get("list")
  public getPaymentsList(@Query("loanId") loanId: any) {
    return this.loanPayment.getPaymentsList(loanId);
  }
}
