import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { LoanDurationService } from "../service/loanDuration.service";

@Controller("loanDuration")
@UseGuards(JwtAuthGuard)
export class LoanDurationController {
  constructor(private loanDuration: LoanDurationService) {}

  @Get("list")
  public getLoanDurationList(
    @Query("locationId") locationId: number,
    @Query("status") status: string
  ) {
    return this.loanDuration.getLoanDurationList(locationId, status);
  }

  @Post("save")
  public saveOrUpdateLoanDuration(@Body() payload: any) {
    return this.loanDuration.saveOrUpdateLoanDuration(payload);
  }
}
