import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AaveUserAccountData {
  @PrimaryColumn()
  user: string; // address

  @Column()
  totalLiquidityETH: number;

  @Column()
  totalCollateralETH: number;

  @Column()
  totalBorrowsETH: number;

  @Column()
  totalFeesETH: number;

  @Column()
  availableBorrowsETH: number;

  @Column()
  currentLiquidationThreshold: number;

  @Column()
  ltv: number;

  @Column()
  healthFactor: number;

  @Column()
  lastBlockChecked: number;
}
