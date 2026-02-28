import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { LoanService } from "../service/loan.service";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";

@Controller("loan")
@UseGuards(JwtAuthGuard)
export class LoanController {
  constructor(private loanService: LoanService) {}

  @Get()
  public getLoan(
    @Query("id") id: number,
    @Query("status") status: string,
    @Query("customerId") customerId: number,
    @Query("date") date: string,
    @Query("payments") payments: boolean,
    @Query("fines") fines: boolean,
    @Query("rebates") rebates: boolean,
  ) {
    return this.loanService.getLoan(
      id,
      status,
      customerId,
      date,
      payments,
      fines,
      rebates,
    );
  }

  @Get("getall")
  public getLoanList(
    @Query("loanId") loanId: any,
    @Query("status") status: any,
    @Query("customerName") customerName: any,
    @Query("customerId") customerId: any,
    @Query("mobileNo") mobileNo: any,
    @Query("phaseId") phaseId: any,
    @Query("label") label: any,
    @Query("date") date: any,
    @Query("paymentStatus") paymentStatus: any,
    @Query("pageIndex") pageIndex: any,
    @Query("pageSize") pageSize: any,
    @Query("locationId") locationId: number,
  ) {
    return this.loanService.getLoanList(
      loanId,
      status,
      customerName,
      customerId,
      mobileNo,
      phaseId,
      label,
      date,
      paymentStatus,
      pageIndex,
      pageSize,
      locationId,
    );
  }

  @Post("save")
  public saveLoan(@Body() payload: any) {
    return this.loanService.saveLoan(payload);
  }

  @Get("report")
  public getReport(
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any,
  ) {
    return this.loanService.getReport(date, phaseId, locationId);
  }

  @Get("amount/report")
  public getTotalAmountReport(
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any,
  ) {
    return this.loanService.getTotalAmountReport(date, phaseId, locationId);
  }

  @Get("history")
  public getLoansHistory(@Query("customerId") customerId: number) {
    return this.loanService.getLoansHistory(customerId);
  }

  @Get("active/check")
  public getActiveLoanCheck(@Query("customerId") customerId: number) {
    return this.loanService.getActiveLoanCheck(customerId);
  }
}
