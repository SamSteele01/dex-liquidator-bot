import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AaveUserReserveData {
  @PrimaryColumn()
  user: string; // address

  @PrimaryColumn()
  reserve: string; // address

  @Column()
  currentATokenBalance: string;

  @Column()
  currentBorrowBalance: string;

  @Column()
  principalBorrowBalance: string;

  @Column()
  borrowRateMode: string;

  @Column()
  borrowRate: string;

  @Column()
  liquidityRate: number;

  @Column()
  originationFee: number;

  @Column()
  variableBorrowIndex: string;

  @Column()
  lastUpdateTimestamp: number;

  @Column()
  usageAsCollateralEnabled: boolean;
}
