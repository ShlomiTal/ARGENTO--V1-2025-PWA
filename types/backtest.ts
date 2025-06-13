import { Strategy, Trade, TradingMode } from './crypto';

export interface BacktestPeriod {
  id: string;
  name: string;
  days: number;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  finalBalance: number;
  trades: Trade[];
  performance: {
    totalReturn: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  equity: number[];
  tradingMode?: TradingMode;
}

export interface BacktestSettings {
  strategyId: string;
  periodId: string;
  initialBalance: number;
  includeFees: boolean;
  feePercentage: number;
}