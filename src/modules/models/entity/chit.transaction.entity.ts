import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AgentLocationEntity } from "./agent.location.entity";

@Entity({ name: "chit_transaction_trn_tbl" })
export class ChitTransactionEntity extends BaseEntity {
  @Column({
    name: "DESCRIPTION",
    type: "varchar",
    length: 100,
    default: null,
  })
  description: string;

  @Column({
    name: "TYPE",
    type: "varchar",
    length: 15,
    default: null,
  })
  type: string;

  @Column({ name: "DATE", type: "date", default: () => "CURRENT_DATE" })
  date: Date;

  @Column({ name: "AMOUNT", type: "float", default: null })
  amount: number;

  @ManyToOne(
    (type) => AgentLocationEntity,
    (agentLocationEntity) => agentLocationEntity.id
  )
  @JoinColumn({ name: "AGENT_LOCATION_ID" })
  agentLocation: AgentLocationEntity;
}
