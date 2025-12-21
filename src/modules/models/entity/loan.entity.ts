import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { CustomerEntity } from "./customer.entity";
import { LoanPaymentEntity } from "./loan-payment.entity";
import { LoanDurationEntity } from "./loanDuration.entity";
import { AgentLocationEntity } from "./agent.location.entity";
import { FineEntity } from "./fine.entity";

@Entity({ name: "loan_mst_tbl" })
export class LoanEntity extends BaseEntity {
  @Column({ name: "LABEL", type: "varchar", length: 50, default: null })
  label: string;

  @Column({ name: "LOAN_AMOUNT", type: "float", default: null })
  loanAmount: number;

  @Column({ name: "PAYABLE_AMOUNT", type: "float", default: null })
  payableAmount: number;

  @Column({ name: "BALANCE_AMOUNT", type: "float", default: null })
  balanceAmount: number;

  @CreateDateColumn({
    name: "LOAN_DATE",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  loanDate: Date;

  @CreateDateColumn({
    name: "REPAY_DATE",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  repayDate: Date;

  @Column({ name: "SURETY", type: "varchar", length: 50, default: null })
  surety: string;

  @Column({
    name: "SURETY_MOBILE_NO",
    type: "varchar",
    length: 10,
    default: null,
  })
  suretyMobileNo: string;

  @ManyToOne(
    (type) => LoanDurationEntity,
    (loanDurationEntity) => loanDurationEntity.id
  )
  @JoinColumn({ name: "LOAN_DURATION" })
  loanDuration: LoanDurationEntity;

  @OneToMany(() => LoanPaymentEntity, (loanPayment) => loanPayment.loan)
  payments: LoanPaymentEntity[];

  @OneToMany(() => FineEntity, (fine) => fine.loan)
  fines: FineEntity[];

  @ManyToOne((type) => CustomerEntity, (customerEntity) => customerEntity.id)
  @JoinColumn({ name: "CUSTOMER_ID" })
  customer: CustomerEntity;

  @ManyToOne(
    (type) => AgentLocationEntity,
    (agentLocationEntity) => agentLocationEntity.id
  )
  @JoinColumn({ name: "AGENT_LOCATION_ID" })
  agentLocation: AgentLocationEntity;
}
