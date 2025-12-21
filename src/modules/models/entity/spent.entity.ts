import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AgentLocationEntity } from "./agent.location.entity";

@Entity({ name: "spent_mst_tbl" })
export class SpentEntity extends BaseEntity {
  @Column({
    name: "EXPENSE_DESCRIPTION",
    type: "varchar",
    length: 50,
    default: null,
  })
  expenseDescription: string;

  @Column({ name: "PAYMENT_DATE", type: "date", default: () => "CURRENT_DATE" })
  paymentDate: Date;

  @Column({ name: "AMOUNT", type: "float", default: null })
  amount: number;

  @ManyToOne(
    (type) => AgentLocationEntity,
    (agentLocationEntity) => agentLocationEntity.id
  )
  @JoinColumn({ name: "AGENT_LOCATION_ID" })
  agentLocation: AgentLocationEntity;
}
