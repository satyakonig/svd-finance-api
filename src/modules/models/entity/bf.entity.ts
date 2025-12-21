import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AgentLocationEntity } from "./agent.location.entity";

@Entity({ name: "bf_mst_tbl" })
export class BFEntity extends BaseEntity {
  @Column({ name: "BF_DATE", type: "varchar", length: 10, default: null })
  bfDate: string;

  @Column({
    name: "PREVIOUS_BF",
    type: "int",
    default: null,
  })
  previousBf: number;

  @Column({
    name: "COLLECTION_TOTAL",
    type: "int",
    default: null,
  })
  collectionTotal: number;

  @Column({
    name: "FINES_TOTAL",
    type: "int",
    default: null,
  })
  finesTotal: number;

  @Column({
    name: "PAYMENT_TOTAL",
    type: "int",
    default: null,
  })
  paymentTotal: number;

  @Column({
    name: "SPENT_TOTAL",
    type: "int",
    default: null,
  })
  spentTotal: number;

  @Column({
    name: "INTEREST_TOTAL",
    type: "int",
    default: null,
  })
  interestTotal: number;

  @Column({
    name: "BF",
    type: "int",
    default: null,
  })
  bf: number;

  @Column({
    name: "FINAL_BF",
    type: "int",
    default: null,
  })
  finalBf: number;

  @Column({
    name: "ADDED_AMOUNT",
    type: "int",
    default: null,
  })
  addedAmount: number;

  @Column({
    name: "TRANSFERED_AMOUNT",
    type: "int",
    default: null,
  })
  transferedAmount: number;

  @Column({
    name: "CHIT_INSTALLMENT",
    type: "int",
    default: null,
  })
  chitInstallment: number;

  @Column({
    name: "CHIT_WITHDRAW",
    type: "int",
    default: null,
  })
  chitWithdraw: number;

  @Column({
    name: "BF_TYPE",
    type: "varchar",
    length: 50,
    default: null,
  })
  bfType: string;

  @Column({
    name: "ADDED_FROM",
    type: "varchar",
    length: 50,
    default: null,
  })
  addedFrom: string;

  @Column({
    name: "TRANSFERED_TO",
    type: "varchar",
    length: 50,
    default: null,
  })
  transferedTo: string;

  @ManyToOne(
    (type) => AgentLocationEntity,
    (agentLocationEntity) => agentLocationEntity.id
  )
  @JoinColumn({ name: "AGENT_LOCATION_ID" })
  agentLocation: AgentLocationEntity;
}
