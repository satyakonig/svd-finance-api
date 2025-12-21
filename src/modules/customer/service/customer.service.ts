import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEntity } from "../../models/entity/customer.entity";
import { DataSource, ILike, Repository } from "typeorm";
import { LoanEntity } from "../../models/entity/loan.entity";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepo: Repository<CustomerEntity>,
    private readonly dataSource: DataSource
  ) {}

  async getCustomerList(
    name: any,
    mobileNo: any,
    status: any,
    locationId: any,
    pageIndex: number = 0,
    pageSize: number = 10
  ) {
    let result: any;
    try {
      const skip = Number(pageIndex) * Number(pageSize);
      const take = Number(pageSize);

      result = await this.customerRepo.findAndCount({
        where: {
          name: name ? ILike(`%${name}%`) : undefined,
          mobileNo: mobileNo ? ILike(`%${mobileNo}%`) : undefined,
          status: status ?? undefined,
          area: {
            location: { id: locationId ?? undefined },
          },
        },
        skip,
        take,
        relations: ["area"],
        order: {
          name: "ASC",
        },
      });
    } catch (err) {
      throw new Error("Failed to get customer list");
    }
    return { list: result[0], count: result[1] };
  }

  public async saveOrUpdateCustomerAndLoan(
    payload: any
  ): Promise<CustomerEntity> {
    let savedCustomer;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { customer, loan } = payload;

      savedCustomer = await queryRunner.manager.save(CustomerEntity, customer);
      if (loan) {
        loan.customer = savedCustomer;
        await queryRunner.manager.save(LoanEntity, loan);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }

    return savedCustomer;
  }
}
