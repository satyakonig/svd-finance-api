import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { ChitTransactionService } from "../service/chit.transaction.service";

@Controller("chit/transaction")
@UseGuards(JwtAuthGuard)
export class ChitTransactionController {
  constructor(private chitTransactionService: ChitTransactionService) {}

  @Get()
  public getChitTransaction(@Query("id") id: number) {
    return this.chitTransactionService.getChitTransaction(id);
  }

  @Get("list")
  public getChitTransactionList(
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any,
    @Query("status") status: any,
    @Query("pageIndex") pageIndex: any,
    @Query("pageSize") pageSize: any
  ) {
    return this.chitTransactionService.getChitTransactionList(
      date,
      phaseId,
      locationId,
      status,
      pageIndex,
      pageSize
    );
  }

  @Post("save")
  public saveOrUpdateChitTransaction(@Body() payload: any) {
    return this.chitTransactionService.saveOrUpdateChitTransaction(payload);
  }
}
