import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity({ name: "phase_mst_tbl" })
export class PhaseEntity extends BaseEntity {
  @Column({ name: "NAME", type: "varchar", length: 10, default: null })
  name: string;
}
