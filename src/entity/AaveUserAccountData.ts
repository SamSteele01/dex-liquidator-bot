import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AaveUserAccountData {
  @PrimaryColumn()
  user: string; // address

  @Column()
  totalLiquidityETH: string;

  @Column()
  totalCollateralETH: string;

  @Column()
  totalBorrowsETH: string;

  @Column()
  totalFeesETH: string;

  @Column()
  availableBorrowsETH: string;

  @Column()
  currentLiquidationThreshold: string;

  @Column()
  ltv: string;

  @Column()
  healthFactor: string;
}
