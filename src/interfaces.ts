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

export interface StandardizedLoan {
  exchange: string;
  contractAddress: string;
  borrowerAddress: string;
  borrowedAsset: string;
  collateralAsset: string;
}

/* ListenToRelevantTokenPrices */
export interface TokensConfig {
  [key: string]: TokenConfig;
}

interface TokenConfig {}

export interface MessageEvents {
  error: (error: Error) => void;
  message: (message: PriceMessage) => void;
}

interface PriceMessage {
  token: string;
  price: string;
}
