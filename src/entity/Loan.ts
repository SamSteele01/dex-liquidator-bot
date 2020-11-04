import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exchange: string;

  @Column()
  borrowerAddress: string;

  @Column()
  collateralToken: string;

  @Column()
  borrowedToken: string;

  @Column()
  collateralAmount: number;

  @Column()
  borrowedAmount: boolean;
}
