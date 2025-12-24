import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CustomerService } from "../service/customer.service";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";

@Controller("customer")
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  public getCustomer(@Query("id") id: number) {
    return this.customerService.getCustomer(id);
  }

  @Get("getall")
  public getCustomerList(
    @Query("name") name: any,
    @Query("mobileNo") mobileNo: any,
    @Query("status") status: any,
    @Query("locationId") locationId: any,
    @Query("pageIndex") pageIndex: any,
    @Query("pageSize") pageSize: any
  ) {
    return this.customerService.getCustomerList(
      name,
      mobileNo,
      status,
      locationId,
      pageIndex,
      pageSize
    );
  }

  @Post("save")
  public saveOrUpdateCustomerAndLoan(@Body() payload: any) {
    return this.customerService.saveOrUpdateCustomerAndLoan(payload);
  }
}
