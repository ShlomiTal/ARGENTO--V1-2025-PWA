export type TradingMode = 'spot' | 'future';

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
  lastUpdated: string;
  priceHistory: number[];
}

export interface StrategyParameter {
  id: string;
  name: string;
  description: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface StrategyType {
  id: string;
  name: string;
  description: string;
  parameters: StrategyParameter[];
}

export interface Strategy {
  id: string;
  name: string;
  cryptoId: string;
  type: string;
  parameters: Record<string, any>;
  active: boolean;
  createdAt: Date;
  tradingMode?: TradingMode;
  persistent?: boolean;
}

export interface Trade {
  id: string;
  strategyId: string;
  cryptoId: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: Date;
  tradingMode: TradingMode;
  leverage?: number;
}

export interface OpenTrade extends Trade {
  pnl: number;
  currentPrice: number;
}

export interface Asset {
  cryptoId: string;
  amount: number;
}

export interface Performance {
  daily: number;
  weekly: number;
  monthly: number;
  allTime: number;
}

export interface PortfolioAccount {
  balance: number;
  assets: Asset[];
  trades: Trade[];
  openTrades: OpenTrade[];
  performance: Performance;
  leverage?: number;
}

export interface Portfolio {
  spot: PortfolioAccount;
  future: PortfolioAccount;
}