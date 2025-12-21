import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { DayEntity } from "../../models/entity/day.entity";
import { DayDto } from "../../models/dto/day.dto";

@Injectable()
export class DayService {
  constructor(
    @InjectRepository(DayEntity)
    private dayRepo: Repository<DayEntity>
  ) {}

  async getDayList(name: any, status: string) {
    let dayList: DayEntity[];
    try {
      dayList = await this.dayRepo.find({
        where: {
          name: name ? ILike(`%${name}%`) : undefined,
          status: status ?? undefined,
        },
        order: {
          id: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get day's list");
    }
    return dayList;
  }

  public async saveOrUpdateDay(day: DayDto): Promise<DayEntity> {
    let updatedDay: DayEntity;

    try {
      updatedDay = await this.dayRepo.save(DayDto.toEntity(day));
    } catch (error) {
      throw new Error("Failed to update day");
    }

    return updatedDay;
  }
}
