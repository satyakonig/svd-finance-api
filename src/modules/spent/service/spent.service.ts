import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SpentDto } from "../../models/dto/spent.dto";
import { SpentEntity } from "../../models/entity/spent.entity";
import { Repository } from "typeorm";

@Injectable()
export class SpentService {
  constructor(
    @InjectRepository(SpentEntity)
    private spentRepo: Repository<SpentEntity>
  ) {}

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

  public async saveOrUpdateSpent(spent: SpentDto): Promise<SpentEntity> {
    let updatedSpent: SpentEntity;

    try {
      if (spent.id) {
        const result = await this.spentRepo.update(
          spent.id,
          SpentDto.toEntity(spent)
        );

        if (result.affected === 0) {
          throw new Error(
            `Spent with ID ${spent.id} not found or no changes detected.`
          );
        }

        updatedSpent = await this.spentRepo.findOne({
          where: { id: spent.id },
        });
      } else {
        updatedSpent = await this.spentRepo.save(SpentDto.toEntity(spent));
      }
    } catch (error) {
      throw new Error("Failed to update spent");
    }

    return updatedSpent;
  }
}
