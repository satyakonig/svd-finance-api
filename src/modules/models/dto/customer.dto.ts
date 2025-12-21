import { CustomerEntity } from "../entity/customer.entity";
import { AreaDto } from "./area.dto";
import { BaseDto } from "./base.dto";

export class CustomerDto extends BaseDto {
  name: string;
  mobileNo: string;
  gender: string;
  area: AreaDto;

  public static fromEntity(customerEntity: CustomerEntity): CustomerDto {
    if (!customerEntity) return null;
    const { ...customerObject } = customerEntity;
    const dto: CustomerDto = {
      ...customerObject,
    };
    return dto;
  }

  public static toEntity(customerDto: CustomerDto): CustomerEntity {
    if (!customerDto) return null;
    const { ...customerObject } = customerDto;
    const entity: CustomerEntity = {
      ...customerObject,
    };
    return entity;
  }
}
