import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AreaEntity } from "./area.entity";

@Entity({ name: "location_mst_tbl" })
export class LocationEntity extends BaseEntity {
  @Column({ name: "NAME", type: "varchar", length: 50, default: null })
  name: string;

  @OneToMany(() => AreaEntity, (area) => area.location)
  areaList: AreaEntity[];
}
