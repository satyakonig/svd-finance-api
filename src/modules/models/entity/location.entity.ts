import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AreaEntity } from "./area.entity";

@Entity({ name: "location_mst_tbl" })
export class LocationEntity extends BaseEntity {
  @Column({ name: "NAME", type: "varchar", length: 50, default: null })
  name: string;

  @Column({ name: "RESERVE_FUND", type: "varchar", default: 0 })
  reserveFund: number;

  @OneToMany(() => AreaEntity, (area) => area.location)
  areaList: AreaEntity[];
}
