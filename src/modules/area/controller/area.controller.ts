import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { AreaService } from "../service/area.service";

@Controller("area")
@UseGuards(JwtAuthGuard)
export class AreaController {
  constructor(private areaService: AreaService) {}

  @Get()
  public getArea(@Query("id") id: number) {
    return this.areaService.getArea(id);
  }

  @Get("getall")
  public getAreaList(
    @Query("name") name: any,
    @Query("status") status: any,
    @Query("locationId") locationId: any
  ) {
    return this.areaService.getAreaList(name, status, locationId);
  }

  @Post("save")
  public saveOrUpdateLocation(@Body() payload: any) {
    return this.areaService.saveOrUpdateArea(payload);
  }
}
