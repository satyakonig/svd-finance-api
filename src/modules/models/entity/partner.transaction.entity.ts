import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { LocationEntity } from "./location.entity";

@Entity({ name: "partner_transaction_trn_tbl" })
export class PartnerTransactionEntity extends BaseEntity {
  @Column({
    name: "NAME",
    type: "varchar",
    length: 100,
    default: null,
  })
  name: string;

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

  @ManyToOne((type) => LocationEntity, (locationEntity) => locationEntity.id)
  @JoinColumn({ name: "LOCATION_ID" })
  location: LocationEntity;
}
