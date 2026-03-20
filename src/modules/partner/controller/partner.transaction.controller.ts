import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { PartnerTransactionService } from "../service/partner.transaction.service";

@Controller("partner/transaction")
@UseGuards(JwtAuthGuard)
export class PartnerTransactionController {
  constructor(private partnerTransactionService: PartnerTransactionService) {}

  @Get()
  public getPartnerransaction(@Query("id") id: number) {
    return this.partnerTransactionService.getPartnerransaction(id);
  }

  @Get("list")
  public getPartnerTransactionList(
    @Query("date") date: any,
    @Query("locationId") locationId: any,
    @Query("status") status: any,
    @Query("pageIndex") pageIndex: any,
    @Query("pageSize") pageSize: any,
  ) {
    return this.partnerTransactionService.getPartnerTransactionList(
      date,
      locationId,
      status,
      pageIndex,
      pageSize,
    );
  }

  @Post("save")
  public saveOrUpdatePartnerTransaction(@Body() payload: any) {
    return this.partnerTransactionService.saveOrUpdatePartnerTransaction(
      payload,
    );
  }
}
