import { BFEntity } from "../entity/bf.entity";
import { AgentLocationDto } from "./agent.location.dto";
import { BaseDto } from "./base.dto";

export class BFDto extends BaseDto {
  bfDate: string;
  previousBf: number;
  collectionTotal: number;
  paymentTotal: number;
  spentTotal: number;
  interestTotal: number;
  finesTotal: number;
  bf: number;
  addedAmount: number;
  transferedAmount: number;
  chitInstallment: number;
  chitWithdraw: number;
  finalBf: number;
  bfType: string;
  transferedTo: string;
  addedFrom: string;
  agentLocation: AgentLocationDto;

  public static fromEntity(bfEntity: BFEntity): BFDto {
    if (!bfEntity) return null;
    const { ...bfObject } = bfEntity;
    const dto: BFDto = {
      ...bfObject,
    };
    return dto;
  }

  public static toEntity(bfDto: BFDto): BFEntity {
    if (!bfDto) return null;
    const { ...bfObject } = bfDto;
    const entity: BFEntity = {
      ...bfObject,
    };
    return entity;
  }
}
