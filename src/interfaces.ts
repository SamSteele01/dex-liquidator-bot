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
