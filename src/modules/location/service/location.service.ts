import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LocationDto } from "../../models/dto/location.dto";
import { LocationEntity } from "../../models/entity/location.entity";
import { DataSource, ILike, Repository } from "typeorm";
import { AreaEntity } from "../../models/entity/area.entity";
import { LoanDurationEntity } from "../../models/entity/loanDuration.entity";
import { AgentLocationEntity } from "../../models/entity/agent.location.entity";

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationEntity)
    private locationRepo: Repository<LocationEntity>,
    @InjectRepository(AreaEntity)
    private areaRepo: Repository<AreaEntity>,
    @InjectRepository(LoanDurationEntity)
    private loanDurationRepo: Repository<LoanDurationEntity>,
    @InjectRepository(AgentLocationEntity)
    private agentLocationRepo: Repository<AgentLocationEntity>,
    private readonly dataSource: DataSource
  ) {}

  async getLocationList(name: string, status: string) {
    let locationList: LocationEntity[];
    try {
      locationList = await this.locationRepo.find({
        where: {
          name: name ? ILike(`%${name}%`) : undefined,
          status: status ?? undefined,
        },
        order: {
          name: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get location list");
    }
    return locationList;
  }

  public async saveOrUpdateLocation(location: LocationDto) {
    try {
      const findLocation = await this.locationRepo
        .createQueryBuilder("location")
        .where("LOWER(location.name) = LOWER(:name)", {
          name: location?.name ?? "",
        })
        .getOne();

      if (findLocation && !location?.id) {
        return { info: "Location already exists" };
      }
      await this.locationRepo.save(location);

      return location?.id
        ? { message: "Location Updated Successfully" }
        : { message: "Location Saved SucessFully" };
    } catch (error) {
      throw new Error("Failed to update location");
    }
  }

  public async deleteOrRestoreLocation(location: LocationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let areas = await this.areaRepo.find({
        where: {
          location: { id: location?.id },
        },
      });

      let loanDurations = await this.loanDurationRepo.find({
        where: {
          location: { id: location?.id },
        },
      });

      let agentLocations = await this.agentLocationRepo.find({
        where: {
          location: { id: location?.id },
        },
      });

      await Promise.all(
        areas.map(async (area) => {
          area.status = location.status;
          await queryRunner.manager.save(AreaEntity, area);
        })
      );

      await Promise.all(
        loanDurations.map(async (loanDuration) => {
          loanDuration.status = location.status;
          await queryRunner.manager.save(LoanDurationEntity, loanDuration);
        })
      );

      await Promise.all(
        agentLocations.map(async (agentLocation) => {
          agentLocation.status = location.status;
          await queryRunner.manager.save(AgentLocationEntity, agentLocation);
        })
      );

      location.status = location.status;

      let savedLocation = await queryRunner.manager.save(
        LocationEntity,
        location
      );

      await queryRunner.commitTransaction();
      return savedLocation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
