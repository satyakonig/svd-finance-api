import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { ChitTransactionService } from "../service/chit.transaction.service";

@Controller("chit/transaction")
@UseGuards(JwtAuthGuard)
export class ChitTransactionController {
  constructor(private chitTransactionService: ChitTransactionService) {}

  @Get("list")
  public getChitTransactionList(
    @Query("agentId") agentId: any,
    @Query("date") date: any,
    @Query("phaseId") phaseId: any,
    @Query("locationId") locationId: any,
    @Query("status") status: any
  ) {
    return this.chitTransactionService.getChitTransactionList(
      agentId,
      date,
      phaseId,
      locationId,
      status
    );
  }

  @Post("save")
  public saveOrUpdateChitTransaction(@Body() payload: any) {
    return this.chitTransactionService.saveOrUpdateChitTransaction(payload);
  }
}
