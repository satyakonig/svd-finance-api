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

@Entity({ name: "rebate_trn_tbl" })
export class RebateEntity extends BaseEntity {
  @Column({ name: "AMOUNT", type: "float", default: null })
  amount: number;

  @CreateDateColumn({
    name: "REBATE_DATE",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  date: Date;

  @ManyToOne((type) => LoanEntity, (loanEntity) => loanEntity.id)
  @JoinColumn({ name: "LOAN_ID" })
  loan: LoanEntity;

  @ManyToOne(
    (type) => AgentLocationEntity,
    (agentLocationEntity) => agentLocationEntity.id,
  )
  @JoinColumn({ name: "AGENT_LOCATION_ID" })
  agentLocation: AgentLocationEntity;
}
