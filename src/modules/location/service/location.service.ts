import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LocationDto } from "../../models/dto/location.dto";
import { LocationEntity } from "../../models/entity/location.entity";
import { DataSource, ILike, Repository } from "typeorm";
import { AreaEntity } from "../../models/entity/area.entity";
import { LoanDurationEntity } from "../../models/entity/loanDuration.entity";
import { AgentLocationEntity } from "../../models/entity/agent.location.entity";
import { reponseGenerator } from "../../../util/common";

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

  async getLocation(id: number) {
    let location: LocationEntity;
    try {
      location = await this.locationRepo.findOne({
        where: {
          id: id ?? undefined,
        },
      });
      return location ?? {};
    } catch (err) {
      throw new Error(`Failed to get location ${err.message}`);
    }
  }

  async getLocationList(
    name: string,
    status: string,
    pageSize: number,
    pageIndex: number
  ) {
    try {
      let result = await this.locationRepo.findAndCount({
        where: {
          name: name ? ILike(`%${name}%`) : undefined,
          status: status ?? undefined,
        },
        order: {
          name: "ASC",
        },
        skip: pageSize && pageIndex ? pageSize * pageIndex : undefined,
        take: pageSize ?? undefined,
      });
      let list = result[0];
      let count = result[1];
      return { list, count };
    } catch (err) {
      throw new Error(`Failed to get locations ${err.message}`);
    }
  }

  public async saveOrUpdateLocation(location: LocationDto) {
    try {
      const existingLocation = await this.locationRepo
        .createQueryBuilder("location")
        .where("LOWER(location.name) = LOWER(:name)", {
          name: location?.name,
        })
        .getOne();

      if (existingLocation && !location?.id) {
        return { infoMessage: "Location already exists" };
      }
      let saveOrUpdatedLocation = await this.locationRepo.save(
        LocationDto.toEntity(location)
      );

      return {
        successMessage: reponseGenerator(
          "Location",
          location?.id,
          location?.status
        ),
        result: saveOrUpdatedLocation,
      };
    } catch (error) {
      throw new Error(`Failed to save location ${error.message}`);
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

      let restoredLocation = await queryRunner.manager.save(
        LocationEntity,
        location
      );

      await queryRunner.commitTransaction();

      return {
        successMessage: reponseGenerator(
          "Location",
          location?.id,
          location?.status
        ),
        result: restoredLocation,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to update location ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
