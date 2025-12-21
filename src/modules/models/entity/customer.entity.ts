import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AreaEntity } from "./area.entity";

@Entity({ name: "customer_mst_tbl" })
export class CustomerEntity extends BaseEntity {
  @Column({ name: "NAME", type: "varchar", length: 50, default: null })
  name: string;

  @Column({ name: "MOBILE_NO", type: "varchar", length: 10, default: null })
  mobileNo: string;

  @Column({ name: "GENDER", type: "varchar", length: 6, default: null })
  gender: string;

  @ManyToOne((type) => AreaEntity, (areaEntity) => areaEntity.id)
  @JoinColumn({ name: "AREA_ID" })
  area: AreaEntity;
}
