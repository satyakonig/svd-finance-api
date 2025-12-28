import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { LocationEntity } from "./location.entity";

@Entity({ name: "area_trn_tbl" })
export class AreaEntity extends BaseEntity {
  @Column({ name: "NAME", type: "varchar", length: 50, default: null })
  name: string;

  @ManyToOne((type) => LocationEntity, (locationEntity) => locationEntity.id)
  @JoinColumn({ name: "LOCATION_ID" })
  location: LocationEntity;
}
