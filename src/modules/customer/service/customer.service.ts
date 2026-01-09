import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEntity } from "../../models/entity/customer.entity";
import { DataSource, ILike, Repository } from "typeorm";
import { LoanEntity } from "../../models/entity/loan.entity";
import { reponseGenerator } from "src/util/common";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepo: Repository<CustomerEntity>,
    private readonly dataSource: DataSource
  ) {}

  async getCustomer(id: number) {
    let customer: {};
    try {
      customer = await this.customerRepo.findOne({
        where: {
          id: id ?? undefined,
        },
        relations: ["area"],
      });
      return customer;
    } catch (err) {
      throw new Error("Failed to get customer list");
    }
  }

  async getCustomerList(
    name: any,
    mobileNo: any,
    status: any,
    locationId: any,
    pageIndex: number = 0,
    pageSize: number = 10
  ) {
    try {
      const skip = Number(pageIndex) * Number(pageSize);
      const take = Number(pageSize);

      let query = this.customerRepo
        .createQueryBuilder("customer")
        .select([
          "customer.id AS id",
          "customer.gender AS gender",
          "customer.mobileNo AS mobileno",
          "customer.name AS name",
          "customer.status AS status",
          "area.name AS areaname",
        ])
        .leftJoin("customer.area", "area")
        .leftJoin("area.location", "location")
        .where(name ? "customer.name =:name" : "1=1", { name: `%${name}%` })
        .andWhere(mobileNo ? "customer.mobileNo =:mobileNo" : "1=1", {
          mobileNo,
        })
        .andWhere("customer.status =:status", { status })
        .andWhere("location.id =:locationId", { locationId })
        .orderBy("name", "ASC")
        .offset(skip)
        .limit(take);

      let list = await query.getRawMany();
      let count = await query.getCount();

      return { list, count };
    } catch (err) {
      throw new Error("Failed to get customer list");
    }
  }

  public async saveOrUpdateCustomerAndLoan(payload: any) {
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

      return {
        successMessage: reponseGenerator(
          "Customer",
          payload?.customer?.id,
          payload?.customer?.status
        ),
        result: savedCustomer,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
