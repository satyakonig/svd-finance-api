import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { LocationService } from "../service/location.service";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";

@Controller("location")
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get()
  public getLocation(@Query("id") id: number) {
    return this.locationService.getLocation(id);
  }

  @Get("list")
  public getLocationList(
    @Query("name") name: string,
    @Query("status") status: string,
    @Query("pageSize") pageSize: number,
    @Query("pageIndex") pageIndex: number
  ) {
    return this.locationService.getLocationList(
      name,
      status,
      pageSize,
      pageIndex
    );
  }

  @Post("save")
  public saveOrUpdateLocation(@Body() payload: any) {
    return this.locationService.saveOrUpdateLocation(payload);
  }

  @Post("deleteorrestore")
  public deleteOrRestoreLocation(@Body() payload: any) {
    return this.locationService.deleteOrRestoreLocation(payload);
  }
}
