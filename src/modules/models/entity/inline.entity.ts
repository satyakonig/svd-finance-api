import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { LocationEntity } from "./location.entity";

@Entity({ name: "inline_mst_tbl" })
export class InLineEntity extends BaseEntity {
  @CreateDateColumn({
    name: "DATE",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  date: Date;

  @Column({ name: "PREVINLINE", type: "float", default: null })
  prevInLine: number;

  @Column({ name: "COLLECTION", type: "float", default: null })
  collection: number;

  @Column({ name: "PAYMENT", type: "float", default: null })
  payment: number;

  @Column({
    name: "finalInLine",
    type: "float",
    default: null,
  })
  finalInLine: number;

  @ManyToOne((type) => LocationEntity, (locationEntity) => locationEntity.id)
  @JoinColumn({ name: "LOCATION_ID" })
  location: LocationEntity;
}
