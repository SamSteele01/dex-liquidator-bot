import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AaveUserReserveData {
  @PrimaryColumn()
  user: string; // address

  @PrimaryColumn()
  reserve: string; // address

  @Column()
  currentATokenBalance: string | undefined;

  @Column()
  currentBorrowBalance: string | undefined;

  @Column()
  principalBorrowBalance: string | undefined;

  @Column()
  borrowRateMode: string | undefined;

  @Column()
  borrowRate: string | undefined;

  @Column()
  liquidityRate: number | undefined;

  @Column()
  originationFee: number | undefined;

  @Column()
  variableBorrowIndex: string | undefined;

  @Column()
  lastUpdateTimestamp: number | undefined;

  @Column()
  usageAsCollateralEnabled: boolean | undefined;

  @Column()
  lastBlockChecked: number | undefined;
}
