import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { PhaseEntity } from "../../models/entity/phase.entity";
import { PhaseDto } from "../../models/dto/phase.dto";

@Injectable()
export class PhaseService {
  constructor(
    @InjectRepository(PhaseEntity)
    private phaseRepo: Repository<PhaseEntity>
  ) {}

  async getPhaseList(name: any, status: string) {
    let phaseList: PhaseEntity[];
    try {
      phaseList = await this.phaseRepo.find({
        where: {
          name: name ? ILike(`%${name}%`) : undefined,
          status: status ?? undefined,
        },
        order: {
          id: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get phase's list");
    }
    return phaseList;
  }

  public async saveOrUpdatePhase(phase: PhaseDto): Promise<PhaseEntity> {
    let updatedPhase: PhaseEntity;

    try {
      updatedPhase = await this.phaseRepo.save(PhaseDto.toEntity(phase));
    } catch (error) {
      throw new Error("Failed to save or update phase");
    }

    return updatedPhase;
  }
}
