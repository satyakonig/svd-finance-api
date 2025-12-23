import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AreaEntity } from "../../models/entity/area.entity";
import { ILike, Repository } from "typeorm";
import { AreaDto } from "../../models/dto/area.dto";
import { reponseGenerator } from "../../../util/common";

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(AreaEntity)
    private areaRepo: Repository<AreaEntity>
  ) {}

  async getArea(id: number) {
    let area: AreaEntity;
    try {
      area = await this.areaRepo.findOne({
        where: {
          id: id ?? null,
        },

        relations: ["location"],
      });
    } catch (err) {
      throw new Error(`Failed to get area ${err.message}`);
    }
    return area;
  }

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
      throw new Error(`Failed to get areas ${err.message}`);
    }
    return areaList;
  }

  public async saveOrUpdateArea(area: AreaDto) {
    try {
      let existingArea = await this.areaRepo
        .createQueryBuilder("area")
        .leftJoinAndSelect("area.location", "location")
        .where("LOWER(area.name) = LOWER(:name)", { name: area?.name ?? "" })
        .andWhere("location.id =:locationId", {
          locationId: area?.location?.id,
        })
        .getOne();

      let {
        id: existingAreaId,
        createdOn,
        ...existingAreaWithoutId
      } = existingArea ?? {};
      let { id: areaId, ...areaWithoutId } = area;

      let isExisting =
        JSON.stringify(existingAreaWithoutId) === JSON.stringify(areaWithoutId);
      if (isExisting) {
        return { infoMessage: "Area already exists" };
      }
      let saveOrUpdatedArea = await this.areaRepo.save(AreaDto.toEntity(area));

      return {
        successMessage: reponseGenerator("Area", area?.id, area?.status),
        result: saveOrUpdatedArea,
      };
    } catch (error) {
      throw new Error(`Failed to get save or update area ${error.message}`);
    }
  }
}
