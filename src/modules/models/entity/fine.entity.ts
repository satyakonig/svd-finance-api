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

@Entity({ name: "fine_trn_tbl" })
export class FineEntity extends BaseEntity {
  @Column({ name: "AMOUNT", type: "float", default: null })
  amount: number;

  @Column({ name: "PAYMENT_MODE", type: "varchar", length: 20, default: null })
  paymentMode: string;

  @CreateDateColumn({
    name: "FINE_DATE",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  fineDate: Date;

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
