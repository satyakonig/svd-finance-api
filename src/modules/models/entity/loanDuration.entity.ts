import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { LocationEntity } from "./location.entity";

@Entity({ name: "loan_duration_mst_tbl" })
export class LoanDurationEntity extends BaseEntity {
  @Column({
    name: "DURATION_TYPE",
    type: "varchar",
    length: 10,
    default: null,
  })
  durationType: string;

  @Column({
    name: "DURATION_VALUE",
    type: "float",
    default: null,
  })
  durationValue: number;

  @Column({ name: "INTREST", type: "float", default: null })
  intrest: number;

  @ManyToOne((type) => LocationEntity, (locationEntity) => locationEntity.id)
  @JoinColumn({ name: "LOCATION_ID" })
  location: LocationEntity;
}
