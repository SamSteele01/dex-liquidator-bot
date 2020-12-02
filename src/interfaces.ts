/* AAVE */
export interface BorrowEvent {
  _reserve: string; // address of borrowed token
  _user: string; // address
  _amount: number;
  // _borrowRateMode: number;
  // _borrowRate
  // _originationFee
  // _borrowBalanceIncrease
  _referral: number;
  _timestamp: number;
}

export interface UserAccountData {
  totalLiquidityETH: number;
  totalCollateralETH: number;
  totalBorrowsETH: number;
  totalFeesETH: number;
  availableBorrowsETH: number;
  currentLiquidationThreshold: number;
  ltv: number;
  healthFactor: number;
}

export interface UserReserveData {
  currentATokenBalance: string;
  currentBorrowBalance: string;
  principalBorrowBalance: string;
  borrowRateMode: string;
  borrowRate: string;
  liquidityRate: number;
  originationFee: number;
  variableBorrowIndex: string;
  lastUpdateTimestamp: number;
  usageAsCollateralEnabled: boolean;
}

export interface UserReservePair {
  user: string;
  reserve: string;
}

/* TokenPriceListener */
export interface TokensConfig {
  [key: string]: TokenConfig;
}

interface TokenConfig {}

export interface PriceOracle {
  exchange: string;
  address: string;
}

export interface MessageEvents {
  error: (error: Error) => void;
  message: (message: PriceMessage) => void;
}

interface PriceMessage {
  token: string;
  price: string;
}
