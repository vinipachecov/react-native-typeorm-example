import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm/browser';

import { IUser } from '../interfaces/IUser';
import { UserPreference } from './userPreference';

@Entity({ name: 'user' })
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  eauthId!: string;

  @OneToOne(() => UserPreference)
  @JoinColumn()
  userPreference!: UserPreference;
}
