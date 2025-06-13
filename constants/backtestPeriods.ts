import { BacktestPeriod } from '@/types/backtest';

export const backtestPeriods: BacktestPeriod[] = [
  {
    id: '7d',
    name: '7 Days',
    days: 7
  },
  {
    id: '30d',
    name: '30 Days',
    days: 30
  },
  {
    id: '90d',
    name: '90 Days',
    days: 90
  },
  {
    id: '180d',
    name: '6 Months',
    days: 180
  },
  {
    id: '365d',
    name: '1 Year',
    days: 365
  }
];