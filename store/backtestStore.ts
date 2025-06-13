import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BacktestResult, BacktestSettings } from '@/types/backtest';
import { cryptos } from '@/constants/cryptos';
import { strategyTypes } from '@/constants/strategies';
import { backtestPeriods } from '@/constants/backtestPeriods';
import { Trade, Strategy } from '@/types/crypto';

interface BacktestState {
  results: BacktestResult[];
  runBacktest: (settings: BacktestSettings) => Promise<BacktestResult>;
  getResultById: (id: string) => BacktestResult | undefined;
  deleteResult: (id: string) => void;
}

export const useBacktestStore = create<BacktestState>()(
  persist(
    (set, get) => ({
      results: [],
      
      runBacktest: async (settings: BacktestSettings) => {
        // In a real app, this would call an API or use a backtesting engine
        // For this demo, we'll simulate a backtest with random results
        
        // Find the strategy from the store, not from strategyTypes
        // This is important because the strategy ID comes from the user's created strategies
        const { strategies } = require('@/store/botStore').useBotStore.getState();
        const strategy = strategies.find((s: Strategy) => s.id === settings.strategyId);
        
        const period = backtestPeriods.find(p => p.id === settings.periodId);
        
        if (!strategy) {
          throw new Error(`Strategy with ID ${settings.strategyId} not found`);
        }
        
        if (!period) {
          throw new Error(`Period with ID ${settings.periodId} not found`);
        }
        
        // Create end date as now, and start date as now - period days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period.days);
        
        // Generate random performance metrics
        const totalReturn = Math.random() * 40 - 10; // -10% to +30%
        const winRate = 30 + Math.random() * 40; // 30% to 70%
        const profitFactor = 0.8 + Math.random() * 1.7; // 0.8 to 2.5
        const maxDrawdown = -(5 + Math.random() * 15); // -5% to -20%
        
        // Generate random trades
        const numTrades = 5 + Math.floor(Math.random() * 20); // 5 to 25 trades
        const trades: Trade[] = [];
        
        let currentBalance = settings.initialBalance;
        const equity = [currentBalance];
        
        for (let i = 0; i < numTrades; i++) {
          const tradeDate = new Date(startDate);
          tradeDate.setDate(startDate.getDate() + Math.floor(Math.random() * period.days));
          
          const cryptoId = strategy.cryptoId;
          const crypto = cryptos.find(c => c.id === cryptoId);
          
          if (!crypto) continue;
          
          const isBuy = i % 2 === 0;
          const price = crypto.currentPrice * (0.9 + Math.random() * 0.2); // +/- 10% of current price
          const amount = (settings.initialBalance * 0.1) / price; // Use about 10% of initial balance
          
          // Calculate profit/loss for this trade
          const profitLoss = isBuy ? 0 : (amount * price * (Math.random() * 0.2 - 0.1)); // -10% to +10%
          currentBalance += profitLoss;
          
          trades.push({
            id: `trade-${Date.now()}-${i}`,
            strategyId: settings.strategyId,
            cryptoId,
            type: isBuy ? 'buy' : 'sell',
            price,
            amount,
            timestamp: tradeDate,
            tradingMode: strategy.tradingMode || 'spot',
          });
          
          equity.push(currentBalance);
        }
        
        // Calculate final balance based on total return
        const finalBalance = settings.initialBalance * (1 + totalReturn / 100);
        
        const result: BacktestResult = {
          id: `backtest-${Date.now()}`,
          strategyId: settings.strategyId,
          startDate,
          endDate,
          initialBalance: settings.initialBalance,
          finalBalance,
          trades,
          performance: {
            totalReturn,
            winRate,
            profitFactor,
            maxDrawdown,
          },
          equity: equity,
          tradingMode: strategy.tradingMode || 'spot',
        };
        
        set((state) => ({
          results: [...state.results, result]
        }));
        
        return result;
      },
      
      getResultById: (id: string) => {
        return get().results.find(result => result.id === id);
      },
      
      deleteResult: (id: string) => {
        set(state => ({
          results: state.results.filter(result => result.id !== id)
        }));
      },
    }),
    {
      name: 'backtest-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);