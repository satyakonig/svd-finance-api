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
    private readonly dataSource: DataSource,
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
    phaseId: any,
    label: any,
    pageIndex: number = 0,
    pageSize: number = 10,
  ) {
    try {
      const skip = Number(pageIndex) * Number(pageSize);
      const take = Number(pageSize);

      let query = this.customerRepo
        .createQueryBuilder("customer")
        .select([
          "customer.id AS id",
          "customer.label AS label",
          "customer.gender AS gender",
          "customer.mobileNo AS mobileno",
          "customer.alternateMobileNo AS alternatemobileno",
          "customer.name AS name",
          "customer.status AS status",
          "area.name AS areaname",
          "agent.name AS agentName",
          "agentLocation.id AS agentlocationid",
        ])
        .leftJoin("customer.area", "area")
        .leftJoin("customer.agentLocation", "agentLocation")
        .leftJoin("agentLocation.agent", "agent")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.phase", "phase")
        .where(name ? "customer.name ILIKE :name" : "1=1", {
          name: `%${name}%`,
        })
        .andWhere(label ? "customer.label ILIKE :label" : "1=1", {
          label: `%${label}%`,
        })
        .andWhere(mobileNo ? "customer.mobileNo =:mobileNo" : "1=1", {
          mobileNo,
        })
        .andWhere("customer.status =:status", { status })
        .andWhere("location.id =:locationId", { locationId })
        .andWhere("phase.id =:phaseId", { phaseId })
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { customer, loan } = payload;

      let savedCustomer = await queryRunner.manager.save(
        CustomerEntity,
        customer,
      );

      const savedCustomerWithRelations = await queryRunner.manager
        .createQueryBuilder(CustomerEntity, "customer")
        .select([
          "customer.id AS id",
          "customer.label AS label",
          "customer.gender AS gender",
          "customer.mobileNo AS mobileno",
          "customer.mobileNo AS mobileno",
          "customer.alternateMobileNo AS alternatemobileno",
          "customer.name AS name",
          "customer.status AS status",
          "area.name AS areaname",
          "agent.name AS agentname",
          "agentLocation.id AS agentlocationid",
        ])
        .leftJoin("customer.area", "area")
        .leftJoin("customer.agentLocation", "agentLocation")
        .leftJoin("agentLocation.agent", "agent")
        .where("customer.id = :id", { id: savedCustomer?.id })
        .getRawOne();

      if (loan) {
        loan.customer = savedCustomer;
        await queryRunner.manager.save(LoanEntity, loan);
      }

      await queryRunner.commitTransaction();

      return {
        successMessage: reponseGenerator(
          "Customer",
          payload?.customer?.id,
          payload?.customer?.status,
        ),
        result: savedCustomerWithRelations,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction Failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  public async generateSerialNo(locationId: any, phaseId: any) {
    let serialNo;
    try {
      serialNo = await this.customerRepo
        .createQueryBuilder("customer")
        .leftJoin("customer.agentLocation", "agentLocation")
        .leftJoin("agentLocation.location", "location")
        .leftJoin("agentLocation.phase", "phase")
        .select(
          "COALESCE(MAX(CAST(customer.label AS INTEGER)), 0) + 1",
          "count",
        )
        .where("location.id = :locationId", { locationId })
        .andWhere("phase.id = :phaseId", { phaseId })
        .getRawOne();
    } catch (err) {
      throw new Error(`Failed to generate serial no ${err}`);
    }

    return serialNo;
  }
}
