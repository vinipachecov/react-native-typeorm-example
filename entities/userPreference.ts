import { Entity, PrimaryGeneratedColumn } from 'typeorm/browser';

@Entity({ name: 'user_preference' })
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
