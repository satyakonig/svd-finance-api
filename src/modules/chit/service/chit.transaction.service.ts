import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChitTransactionEntity } from "../../models/entity/chit.transaction.entity";
import { ChitTransactionDto } from "../../models/dto/chit.transaction.dto";

@Injectable()
export class ChitTransactionService {
  constructor(
    @InjectRepository(ChitTransactionEntity)
    private chitTransactionRepo: Repository<ChitTransactionEntity>
  ) {}

  async getChitTransactionList(
    agentId: any,
    date: any,
    phaseId: any,
    locationId: any,
    status: any
  ) {
    let chitTransactionList: ChitTransactionEntity[];
    try {
      chitTransactionList = await this.chitTransactionRepo.find({
        where: {
          status: status ?? null,
          date: date ?? null,
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
          description: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get chit list");
    }
    return chitTransactionList;
  }

  public async saveOrUpdateChitTransaction(
    chit: ChitTransactionDto
  ): Promise<ChitTransactionEntity> {
    let updatedChit: ChitTransactionEntity;

    try {
      if (chit.id) {
        const result = await this.chitTransactionRepo.update(
          chit.id,
          ChitTransactionDto.toEntity(chit)
        );

        if (result.affected === 0) {
          throw new Error(
            `Chit Transaction with ID ${chit.id} not found or no changes detected.`
          );
        }

        updatedChit = await this.chitTransactionRepo.findOne({
          where: { id: chit.id },
        });
      } else {
        updatedChit = await this.chitTransactionRepo.save(
          ChitTransactionDto.toEntity(chit)
        );
      }
    } catch (error) {
      throw new Error("Failed to update chit transaction");
    }

    return updatedChit;
  }
}
