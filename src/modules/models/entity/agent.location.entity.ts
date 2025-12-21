import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { LocationEntity } from "./location.entity";
import { AgentEntity } from "./agent.entity";
import { DayEntity } from "./day.entity";
import { PhaseEntity } from "./phase.entity";

@Entity({ name: "agent_location_trn_tbl" })
export class AgentLocationEntity extends BaseEntity {
  @Column({
    name: "SUPPORT_PERSONS",
    type: "varchar",
    length: 50,
    default: null,
  })
  supportPerson: string;

  @ManyToOne((type) => DayEntity, (dayEntity) => dayEntity.id)
  @JoinColumn({ name: "DAY_ID" })
  day: DayEntity;

  @ManyToOne((type) => LocationEntity, (locationEntity) => locationEntity.id)
  @JoinColumn({ name: "LOCATION_ID" })
  location: LocationEntity;

  @ManyToOne((type) => PhaseEntity, (phaseEntity) => phaseEntity.id)
  @JoinColumn({ name: "PHASE_ID" })
  phase: PhaseEntity;

  @ManyToOne((type) => AgentEntity, (agentEntity) => agentEntity.id)
  @JoinColumn({ name: "AGENT_ID" })
  agent: AgentEntity;
}
