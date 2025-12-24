import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SpentDto } from "../../models/dto/spent.dto";
import { SpentEntity } from "../../models/entity/spent.entity";
import { Repository } from "typeorm";
import { reponseGenerator } from "../../../util/common";

@Injectable()
export class SpentService {
  constructor(
    @InjectRepository(SpentEntity)
    private spentRepo: Repository<SpentEntity>
  ) {}

  async getSpent(id: number) {
    let spent: SpentEntity;
    try {
      spent = await this.spentRepo.findOne({
        where: {
          id: id ?? null,
        },
        relations: [
          "agentLocation",
          "agentLocation.agent",
          "agentLocation.location",
        ],
        order: {
          expenseDescription: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get spent list");
    }
    return spent;
  }

  async getSpentList(
    agentId: any,
    date: any,
    phaseId: any,
    locationId: any,
    status: any
  ) {
    let spentList: SpentEntity[];
    try {
      spentList = await this.spentRepo.find({
        where: {
          status: status ?? null,
          paymentDate: date ?? null,
          agentLocation: {
            agent: { id: agentId ?? null },
            location: { id: locationId ?? null },
            phase: { id: phaseId ?? null },
          },
        },
        relations: [
          "agentLocation",
          "agentLocation.agent",
          "agentLocation.location",
        ],
        order: {
          expenseDescription: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get spent list");
    }
    return spentList;
  }

  public async saveOrUpdateSpent(spent: SpentDto) {
    try {
      let saveOrUpdatedSpent: SpentEntity;
      saveOrUpdatedSpent = await this.spentRepo.save(SpentDto.toEntity(spent));

      let saveOrUpdatedSpentWithRelation = await this.spentRepo.findOne({
        where: { id: saveOrUpdatedSpent.id },
        relations: ["agentLocation", "agentLocation.agent"],
      });

      return {
        successMessage: reponseGenerator("Spent", spent?.id, spent?.status),
        result: saveOrUpdatedSpentWithRelation,
      };
    } catch (error) {
      throw new Error("Failed to update spent");
    }
  }
}
