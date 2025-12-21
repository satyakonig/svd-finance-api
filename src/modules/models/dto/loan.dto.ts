import { FineEntity } from "../entity/fine.entity";
import { LoanPaymentEntity } from "../entity/loan-payment.entity";
import { LoanEntity } from "../entity/loan.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";
import { CustomerDto } from "./customer.dto";
import { LoanDurationDto } from "./loanDuration.dto";

export class LoanDto extends BaseDto {
  label: string;
  loanAmount: number;
  payableAmount: number;
  balanceAmount: number;
  loanDate: Date;
  repayDate: Date;
  surety: string;
  suretyMobileNo: string;
  loanDuration: LoanDurationDto;
  customer: CustomerDto;
  agentLocation: AgentLocationDto;
  payments: LoanPaymentEntity[];
  fines: FineEntity[];

  public static fromEntity(loanEntity: LoanEntity): LoanDto {
    if (!loanEntity) return null;
    const { ...loanObject } = loanEntity;
    const dto: LoanDto = {
      ...loanObject,
    };
    return dto;
  }

  public static toEntity(loanDto: LoanDto): LoanEntity {
    if (!loanDto) return null;
    const { ...loanObject } = loanDto;
    const entity: LoanEntity = {
      ...loanObject,
    };
    return entity;
  }
}
