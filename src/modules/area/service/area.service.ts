import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AreaEntity } from "../../models/entity/area.entity";
import { ILike, Repository } from "typeorm";
import { AreaDto } from "../../models/dto/area.dto";

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(AreaEntity)
    private areaRepo: Repository<AreaEntity>
  ) {}

  async getAreaList(name: any, status: string, locationId: any) {
    let areaList: AreaEntity[];
    try {
      areaList = await this.areaRepo.find({
        where: {
          name: name ? ILike(`%${name}%`) : undefined,
          status: status ?? undefined,
          location: { id: locationId ?? undefined },
        },
        order: {
          name: "ASC",
        },
        relations: ["location"],
      });
    } catch (err) {
      throw new Error("Failed to get location list");
    }
    return areaList;
  }

  public async saveOrUpdateArea(area: AreaDto) {
    try {
      const findArea = await this.areaRepo
        .createQueryBuilder("area")
        .where("LOWER(area.name) = LOWER(:name)", { name: area?.name ?? "" })
        .getOne();

      if (findArea && !area?.id) {
        return { info: "Area already exists" };
      }
      await this.areaRepo.save(area);

      return area?.id
        ? { message: "Area Updated Successfully" }
        : { message: "Area Saved SucessFully" };
    } catch (error) {
      throw new Error("Failed to update location");
    }
  }
}
