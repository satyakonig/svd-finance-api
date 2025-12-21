import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { AgentLocationEntity } from "./agent.location.entity";

@Entity({ name: "agent_mst_tbl" })
export class AgentEntity extends BaseEntity {
  @Column({ name: "NAME", type: "varchar", length: 50, default: null })
  name: string;

  @Column({ name: "MOBILE_NUM", type: "varchar", length: 10, default: null })
  mobileNo: string;

  @Column({ name: "GENDER", type: "varchar", length: 10, default: null })
  gender: string;

  @Column({ name: "USER_NAME", type: "varchar", length: 20, default: null })
  username: string;

  @Column({ name: "USER_PSWD", type: "varchar", length: 20, default: null })
  password: string;

  @Column({ name: "ROLE_NAME", type: "varchar", length: 10, default: null })
  role: string;

  @Column({ name: "ADMIN_CONTROL", type: "boolean", default: null })
  adminControl: boolean;

  @OneToMany(() => AgentLocationEntity, (agentLocation) => agentLocation.agent)
  agentLocation: AgentLocationEntity[];
}
