import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity({ name: "day_mst_tbl" })
export class DayEntity extends BaseEntity {
  @Column({ name: "NAME", type: "varchar", length: 10, default: null })
  name: string;
}
