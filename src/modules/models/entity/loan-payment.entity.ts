import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { LoanEntity } from "./loan.entity";
import { AgentLocationEntity } from "./agent.location.entity";

@Entity({ name: "loan_payment_trn_tbl" })
export class LoanPaymentEntity extends BaseEntity {
  @Column({ name: "AMOUNT", type: "float", default: null })
  amount: number;

  @Column({ name: "PAYMENT_MODE", type: "varchar", length: 20, default: null })
  paymentMode: string;

  @Column({ name: "RECEIVER_NAME", type: "varchar", length: 30, default: null })
  receiverName: string;

  @CreateDateColumn({
    name: "PAYMENT_DATE",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  paymentDate: Date;

  @ManyToOne((type) => LoanEntity, (loanEntity) => loanEntity.id)
  @JoinColumn({ name: "LOAN_ID" })
  loan: LoanEntity;

  @ManyToOne(
    (type) => AgentLocationEntity,
    (agentLocationEntity) => agentLocationEntity.id
  )
  @JoinColumn({ name: "AGENT_LOCATION_ID" })
  agentLocation: AgentLocationEntity;
}
