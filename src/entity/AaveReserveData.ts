import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AaveReserveData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exchange: string;

  @Column()
  contractAddress: string;

  @Column()
  borrowerAddress: string;

  @Column()
  collateralToken: string;

  @Column()
  borrowedToken: string;

  @Column()
  collateralAmount: number;

  @Column()
  borrowedAmount: number;
}
