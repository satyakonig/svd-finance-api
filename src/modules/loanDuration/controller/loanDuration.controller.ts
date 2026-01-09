import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { LoanDurationService } from "../service/loanDuration.service";
import { number } from "joi";

@Controller("loanDuration")
@UseGuards(JwtAuthGuard)
export class LoanDurationController {
  constructor(private loanDuration: LoanDurationService) {}

  @Get()
  public getLoanDuration(@Query("id") id: number) {
    return this.loanDuration.getLoanDuration(id);
  }

  @Get("list")
  public getLoanDurationList(
    @Query("locationId") locationId: number,
    @Query("status") status: string,
    @Query("pageSize") pageSize: number,
    @Query("pageIndex") pageIndex: number
  ) {
    return this.loanDuration.getLoanDurationList(
      locationId,
      status,
      pageSize,
      pageIndex
    );
  }

  @Post("save")
  public saveOrUpdateLoanDuration(@Body() payload: any) {
    return this.loanDuration.saveOrUpdateLoanDuration(payload);
  }
}
