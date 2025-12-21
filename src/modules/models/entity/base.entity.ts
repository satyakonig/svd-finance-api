import { STATUS } from '../../../util/constants';
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({
    name: 'STATUS',
    type: 'varchar',
    length: 20,
    default: STATUS.ACTIVE,
    nullable: true,
  })
  status: string;

  @CreateDateColumn({
    name: 'CREATED_ON',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  createdOn: Date;
}
