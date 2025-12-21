import { LoanPaymentEntity } from "../entity/loan-payment.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";
import { LoanDto } from "./loan.dto";

export class LoanPaymentDto extends BaseDto {
  amount: number;
  paymentMode: string;
  paymentDate: Date;
  loan: LoanDto;
  agentLocation: AgentLocationDto;

  public static fromEntity(
    loanPaymentEntity: LoanPaymentEntity
  ): LoanPaymentDto {
    if (!loanPaymentEntity) return null;
    const { ...loanPaymentObject } = loanPaymentEntity;
    const dto: LoanPaymentDto = {
      ...loanPaymentObject,
    };
    return dto;
  }

  public static toEntity(loanPaymentDto: LoanPaymentDto): LoanPaymentEntity {
    if (!loanPaymentDto) return null;
    const { ...loanPaymentObject } = loanPaymentDto;
    const entity: LoanPaymentEntity = {
      ...loanPaymentObject,
    };
    return entity;
  }
}
