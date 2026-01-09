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
    return area ?? {};
  }

  async getAreaList(
    name: any,
    status: string,
    locationId: any,
    pageSize: number,
    pageIndex: number
  ) {
    try {
      let query = this.areaRepo
        .createQueryBuilder("area")
        .select([
          "area.id AS id",
          "area.name AS name",
          "area.status AS status",
          "location.name AS locationname",
        ])
        .leftJoin("area.location", "location")
        .where(name ? "area.name =:name" : "1=1", { name: `%${name}%` })
        .andWhere("area.status =:status", { status })
        .andWhere("location.id =:locationId", { locationId })
        .offset(pageSize * pageIndex)
        .limit(pageSize)
        .orderBy("area.name", "ASC");

      let list = await query.getRawMany();
      let count = await query.getCount();

      return { list, count };
    } catch (err) {
      throw new Error(`Failed to get areas ${err.message}`);
    }
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

      if (existingArea && !area.id) {
        return { infoMessage: "Area already exists" };
      }
      let saveOrUpdatedArea = await this.areaRepo.save(AreaDto.toEntity(area));

      let saveOrUpdatedAreaWithRelations = await this.areaRepo
        .createQueryBuilder("area")
        .select([
          "area.id AS id",
          "area.name AS name",
          "area.status AS status",
          "location.name AS locationname",
        ])
        .leftJoin("area.location", "location")
        .where("area.id =:id", { id: saveOrUpdatedArea?.id })
        .getRawOne();

      return {
        successMessage: reponseGenerator("Area", area?.id, area?.status),
        result: saveOrUpdatedAreaWithRelations,
      };
    } catch (error) {
      throw new Error(`Failed to get save or update area ${error.message}`);
    }
  }
}
