import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { FineEntity } from "../../models/entity/fine.entity";

@Injectable()
export class FineService {
  constructor(
    @InjectRepository(FineEntity)
    private fineRepo: Repository<FineEntity>,
    private readonly dataSource: DataSource
  ) {}

  public async saveOrUpdatePayment(finePayment: FineEntity) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let savedPayment: FineEntity;

      savedPayment = await queryRunner.manager.save(FineEntity, finePayment);

      await queryRunner.commitTransaction();

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  public async getPayment(loanId: any, date: any) {
    let payments: FineEntity[];

    try {
      payments = await this.fineRepo.find({
        where: {
          loan: { id: loanId ?? undefined },
          fineDate: date ?? undefined,
        },
      });
    } catch (err) {
      throw new Error(`Failed to get payment list - ${err}`);
    }

    return payments;
  }
}
