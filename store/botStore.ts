import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cryptos } from '@/constants/cryptos';
import { Strategy, Trade, Portfolio, TradingMode, OpenTrade } from '@/types/crypto';
import { useBacktestStore } from './backtestStore';

interface ExchangeSettings {
  exchange: string;
  apiKey: string;
  apiSecret: string;
  isConnected: boolean;
  lastConnected: number | null;
  balance?: number;
  openTrades?: OpenTrade[];
  lastSynced?: number | null;
  connectionError?: string | null;
  syncInProgress?: boolean;
}

interface BotState {
  strategies: Strategy[];
  portfolio: Portfolio;
  selectedCryptoId: string | null;
  isTrading: boolean;
  activeTradingMode: TradingMode;
  activeStrategyId: string | null;
  exchangeSettings: ExchangeSettings;
  
  // Actions
  setTradingMode: (mode: TradingMode) => void;
  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => void;
  toggleStrategy: (id: string) => void;
  removeStrategy: (id: string) => void;
  updateStrategy: (id: string, updates: Partial<Strategy>) => void;
  executeTrade: (trade: Omit<Trade, 'id' | 'timestamp'>) => void;
  closeTrade: (tradeId: string) => void;
  updateOpenTradesPnL: () => void;
  setSelectedCryptoId: (id: string | null) => void;
  toggleTrading: () => void;
  setActiveStrategy: (id: string | null) => void;
  updateExchangeSettings: (settings: Partial<ExchangeSettings>) => void;
  disconnectExchange: () => void;
  syncExchangeData: () => Promise<boolean>;
  findBestStrategy: () => Promise<string | null>;
  resetPortfolio: () => void;
  deletePortfolio: () => void;
}

const initialPortfolio: Portfolio = {
  spot: {
    balance: 10000, // Starting with $10,000
    assets: [],
    trades: [],
    openTrades: [],
    performance: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      allTime: 0,
    },
  },
  future: {
    balance: 10000, // Starting with $10,000
    assets: [],
    trades: [],
    openTrades: [],
    performance: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      allTime: 0,
    },
    leverage: 10, // Default leverage set to 10
  }
};

export const useBotStore = create<BotState>()(
  persist(
    (set, get) => ({
      strategies: [],
      portfolio: initialPortfolio,
      selectedCryptoId: null,
      isTrading: false,
      activeTradingMode: 'spot',
      activeStrategyId: null,
      exchangeSettings: {
        exchange: 'binance',
        apiKey: '',
        apiSecret: '',
        isConnected: false,
        lastConnected: null,
        balance: null,
        openTrades: [],
        lastSynced: null,
        connectionError: null,
        syncInProgress: false,
      },
      
      setTradingMode: (mode) => set({ activeTradingMode: mode }),
      
      addStrategy: (strategy) => {
        console.log("Adding strategy:", strategy);
        
        // If the strategy is not meant to be persistent, don't add the persistent flag
        const strategyToAdd = {
          ...strategy,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
          tradingMode: strategy.tradingMode || get().activeTradingMode,
        };
        
        // Remove the persistent flag if it's false (to avoid storing it)
        if (strategy.persistent === false) {
          delete strategyToAdd.persistent;
        }
        
        set((state) => ({
          strategies: [
            ...state.strategies,
            strategyToAdd,
          ],
        }));
      },
      
      toggleStrategy: (id) => set((state) => ({
        strategies: state.strategies.map((strategy) =>
          strategy.id === id
            ? { ...strategy, active: !strategy.active }
            : strategy
        ),
      })),
      
      removeStrategy: (id) => set((state) => ({
        strategies: state.strategies.filter((strategy) => strategy.id !== id),
      })),
      
      updateStrategy: (id, updates) => set((state) => ({
        strategies: state.strategies.map((strategy) =>
          strategy.id === id ? { ...strategy, ...updates } : strategy
        ),
      })),
      
      executeTrade: (trade) => set((state) => {
        const newTrade = {
          ...trade,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          tradingMode: trade.tradingMode || state.activeTradingMode,
        };
        
        const crypto = cryptos.find((c) => c.id === trade.cryptoId);
        if (!crypto) return state;
        
        const tradingMode = newTrade.tradingMode;
        let portfolioCopy = { ...state.portfolio };
        
        if (trade.type === 'buy') {
          // Calculate cost based on trading mode
          let cost = trade.price * trade.amount;
          
          // Update balance
          portfolioCopy[tradingMode].balance -= cost;
          
          // Update assets
          const assetIndex = portfolioCopy[tradingMode].assets.findIndex(
            (asset) => asset.cryptoId === trade.cryptoId
          );
          
          if (assetIndex >= 0) {
            portfolioCopy[tradingMode].assets[assetIndex] = {
              ...portfolioCopy[tradingMode].assets[assetIndex],
              amount: portfolioCopy[tradingMode].assets[assetIndex].amount + trade.amount,
            };
          } else {
            portfolioCopy[tradingMode].assets.push({
              cryptoId: trade.cryptoId,
              amount: trade.amount,
            });
          }
          
          // Add to open trades
          const openTrade: OpenTrade = {
            ...newTrade,
            pnl: 0,
            currentPrice: crypto.currentPrice,
          };
          
          portfolioCopy[tradingMode].openTrades.push(openTrade);
        } else if (trade.type === 'sell') {
          // Calculate revenue
          let revenue = trade.price * trade.amount;
          
          // Update balance
          portfolioCopy[tradingMode].balance += revenue;
          
          // Update assets
          const assetIndex = portfolioCopy[tradingMode].assets.findIndex(
            (asset) => asset.cryptoId === trade.cryptoId
          );
          
          if (assetIndex >= 0) {
            const newAmount = portfolioCopy[tradingMode].assets[assetIndex].amount - trade.amount;
            if (newAmount <= 0) {
              portfolioCopy[tradingMode].assets = portfolioCopy[tradingMode].assets.filter((_, i) => i !== assetIndex);
            } else {
              portfolioCopy[tradingMode].assets[assetIndex] = {
                ...portfolioCopy[tradingMode].assets[assetIndex],
                amount: newAmount,
              };
            }
          }
        }
        
        // Add trade to history
        portfolioCopy[tradingMode].trades = [...portfolioCopy[tradingMode].trades, newTrade];
        
        return {
          portfolio: portfolioCopy
        };
      }),
      
      closeTrade: (tradeId) => set((state) => {
        const tradingMode = state.activeTradingMode;
        const portfolioCopy = { ...state.portfolio };
        
        // Find the open trade
        const openTradeIndex = portfolioCopy[tradingMode].openTrades.findIndex(
          (trade) => trade.id === tradeId
        );
        
        if (openTradeIndex === -1) return state;
        
        const openTrade = portfolioCopy[tradingMode].openTrades[openTradeIndex];
        const crypto = cryptos.find((c) => c.id === openTrade.cryptoId);
        
        if (!crypto) return state;
        
        // Create a sell trade to close the position
        const closeTrade: Trade = {
          id: Math.random().toString(36).substring(2, 9),
          strategyId: openTrade.strategyId,
          cryptoId: openTrade.cryptoId,
          type: 'sell',
          price: crypto.currentPrice,
          amount: openTrade.amount,
          timestamp: new Date(),
          tradingMode: openTrade.tradingMode,
          leverage: openTrade.leverage,
        };
        
        // Update balance with profit/loss
        portfolioCopy[tradingMode].balance += openTrade.pnl;
        
        // Update assets
        const assetIndex = portfolioCopy[tradingMode].assets.findIndex(
          (asset) => asset.cryptoId === openTrade.cryptoId
        );
        
        if (assetIndex >= 0) {
          const newAmount = portfolioCopy[tradingMode].assets[assetIndex].amount - openTrade.amount;
          if (newAmount <= 0) {
            portfolioCopy[tradingMode].assets = portfolioCopy[tradingMode].assets.filter((_, i) => i !== assetIndex);
          } else {
            portfolioCopy[tradingMode].assets[assetIndex] = {
              ...portfolioCopy[tradingMode].assets[assetIndex],
              amount: newAmount,
            };
          }
        }
        
        // Remove from open trades
        portfolioCopy[tradingMode].openTrades = portfolioCopy[tradingMode].openTrades.filter(
          (_, index) => index !== openTradeIndex
        );
        
        // Add to trade history
        portfolioCopy[tradingMode].trades.push(closeTrade);
        
        return {
          portfolio: portfolioCopy
        };
      }),
      
      updateOpenTradesPnL: () => set((state) => {
        const portfolioCopy = { ...state.portfolio };
        
        // Update spot open trades
        portfolioCopy.spot.openTrades = portfolioCopy.spot.openTrades.map(trade => {
          const crypto = cryptos.find(c => c.id === trade.cryptoId);
          if (!crypto) return trade;
          
          const currentPrice = crypto.currentPrice;
          let pnl = 0;
          
          if (trade.type === 'buy') {
            // For long positions: (current price - entry price) * amount
            pnl = (currentPrice - trade.price) * trade.amount;
          } else {
            // For short positions: (entry price - current price) * amount
            pnl = (trade.price - currentPrice) * trade.amount;
          }
          
          return {
            ...trade,
            pnl,
            currentPrice
          };
        });
        
        // Update future open trades
        portfolioCopy.future.openTrades = portfolioCopy.future.openTrades.map(trade => {
          const crypto = cryptos.find(c => c.id === trade.cryptoId);
          if (!crypto) return trade;
          
          const currentPrice = crypto.currentPrice;
          let pnl = 0;
          
          // Ensure leverage is a number by providing default value of 10 if undefined
          const leverageValue = typeof trade.leverage === 'number' ? trade.leverage : 
                               (typeof portfolioCopy.future.leverage === 'number' ? portfolioCopy.future.leverage : 10);
          
          if (trade.type === 'buy') {
            // For long positions with leverage: (current price - entry price) * amount * leverage
            pnl = (currentPrice - trade.price) * trade.amount * leverageValue;
          } else {
            // For short positions with leverage: (entry price - current price) * amount * leverage
            pnl = (trade.price - currentPrice) * trade.amount * leverageValue;
          }
          
          return {
            ...trade,
            pnl,
            currentPrice
          };
        });
        
        // Simulate some random performance changes
        const randomChange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };
        
        // Update performance metrics with some random changes to simulate live trading
        portfolioCopy.spot.performance = {
          daily: portfolioCopy.spot.performance.daily + randomChange(-0.5, 0.7),
          weekly: portfolioCopy.spot.performance.weekly + randomChange(-0.3, 0.5),
          monthly: portfolioCopy.spot.performance.monthly + randomChange(-0.2, 0.4),
          allTime: portfolioCopy.spot.performance.allTime + randomChange(-0.1, 0.3),
        };
        
        portfolioCopy.future.performance = {
          daily: portfolioCopy.future.performance.daily + randomChange(-0.8, 1.2),
          weekly: portfolioCopy.future.performance.weekly + randomChange(-0.5, 0.8),
          monthly: portfolioCopy.future.performance.monthly + randomChange(-0.3, 0.6),
          allTime: portfolioCopy.future.performance.allTime + randomChange(-0.2, 0.4),
        };
        
        return {
          portfolio: portfolioCopy
        };
      }),
      
      setSelectedCryptoId: (id) => set({ selectedCryptoId: id }),
      
      toggleTrading: () => set((state) => {
        // If turning on trading, find the best strategy first
        if (!state.isTrading) {
          // This will be handled by the component that calls toggleTrading
          return { isTrading: !state.isTrading };
        }
        
        // If turning off trading, just toggle the state
        return { isTrading: false, activeStrategyId: null };
      }),
      
      setActiveStrategy: (id) => set({ activeStrategyId: id }),
      
      updateExchangeSettings: (settings) => set((state) => {
        // If API key and secret are provided, mark as connected
        const isConnected = settings.apiKey && settings.apiSecret 
          ? true 
          : state.exchangeSettings.isConnected;
        
        return {
          exchangeSettings: {
            ...state.exchangeSettings,
            ...settings,
            isConnected,
            lastConnected: isConnected ? Date.now() : state.exchangeSettings.lastConnected,
            // Clear any previous connection errors when updating settings
            connectionError: settings.connectionError !== undefined ? settings.connectionError : null
          }
        };
      }),
      
      disconnectExchange: () => set((state) => ({
        exchangeSettings: {
          ...state.exchangeSettings,
          isConnected: false,
          balance: null,
          openTrades: [],
          lastSynced: null,
          connectionError: null
        }
      })),
      
      syncExchangeData: async () => {
        // Set sync in progress flag
        set(state => ({
          exchangeSettings: {
            ...state.exchangeSettings,
            syncInProgress: true
          }
        }));
        
        const { exchangeSettings } = get();
        
        // Check if we have valid API credentials
        if (!exchangeSettings.isConnected || !exchangeSettings.apiKey || !exchangeSettings.apiSecret) {
          set(state => ({
            exchangeSettings: {
              ...state.exchangeSettings,
              syncInProgress: false,
              connectionError: "No valid API credentials"
            }
          }));
          return false;
        }
        
        try {
          // Simulate API call to exchange
          // In a real app, this would be an actual API call to the exchange
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Generate mock data based on the exchange
          let mockBalance = 0;
          
          // Different balance ranges for different exchanges
          switch(exchangeSettings.exchange) {
            case 'mexc':
              mockBalance = Math.random() * 15000 + 8000; // Higher balance for MEXC
              break;
            case 'binance':
              mockBalance = Math.random() * 10000 + 5000;
              break;
            case 'okx':
              mockBalance = Math.random() * 12000 + 6000;
              break;
            case 'bybit':
              mockBalance = Math.random() * 8000 + 4000;
              break;
            default:
              mockBalance = Math.random() * 10000 + 5000;
          }
          
          // Generate some mock open trades
          const mockOpenTrades: OpenTrade[] = [];
          const tradeCount = Math.floor(Math.random() * 5) + 1;
          
          for (let i = 0; i < tradeCount; i++) {
            const randomCryptoIndex = Math.floor(Math.random() * cryptos.length);
            const crypto = cryptos[randomCryptoIndex];
            
            const isBuy = Math.random() > 0.5;
            const amount = Math.random() * 2 + 0.1;
            const entryPrice = crypto.currentPrice * (0.9 + Math.random() * 0.2);
            const pnl = isBuy 
              ? (crypto.currentPrice - entryPrice) * amount 
              : (entryPrice - crypto.currentPrice) * amount;
            
            mockOpenTrades.push({
              id: `exchange-${Math.random().toString(36).substring(2, 9)}`,
              strategyId: 'exchange',
              cryptoId: crypto.id,
              type: isBuy ? 'buy' : 'sell',
              price: entryPrice,
              amount,
              timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in the last week
              tradingMode: get().activeTradingMode,
              pnl,
              currentPrice: crypto.currentPrice,
              exchangeTradeId: `${exchangeSettings.exchange}-${Math.random().toString(36).substring(2, 9)}`
            });
          }
          
          // Update exchange settings with the new data
          set(state => ({
            exchangeSettings: {
              ...state.exchangeSettings,
              balance: mockBalance,
              openTrades: mockOpenTrades,
              lastSynced: Date.now(),
              syncInProgress: false,
              connectionError: null
            }
          }));
          
          return true;
        } catch (error) {
          console.error('Error syncing exchange data:', error);
          
          // Update state with error
          set(state => ({
            exchangeSettings: {
              ...state.exchangeSettings,
              syncInProgress: false,
              connectionError: error instanceof Error ? error.message : "Unknown error syncing data"
            }
          }));
          
          return false;
        }
      },
      
      resetPortfolio: () => set({ portfolio: initialPortfolio }),
      
      deletePortfolio: () => set((state) => {
        // Create a new portfolio with initial balances but clear all trades and assets
        const clearedPortfolio = {
          spot: {
            ...initialPortfolio.spot,
            balance: state.portfolio.spot.balance, // Keep current balance
            assets: [], // Clear assets
            trades: [], // Clear trade history
            openTrades: [], // Clear open trades
          },
          future: {
            ...initialPortfolio.future,
            balance: state.portfolio.future.balance, // Keep current balance
            assets: [], // Clear assets
            trades: [], // Clear trade history
            openTrades: [], // Clear open trades
          }
        };
        
        return { portfolio: clearedPortfolio };
      }),
      
      findBestStrategy: async () => {
        const { runBacktest } = useBacktestStore.getState();
        const { strategies, activeTradingMode } = get();
        
        // Filter active strategies for the current trading mode
        const activeStrategies = strategies.filter(
          (s) => s.active && (!s.tradingMode || s.tradingMode === activeTradingMode)
        );
        
        if (activeStrategies.length === 0) {
          return null;
        }
        
        try {
          // Run backtest for each strategy
          const results = await Promise.all(
            activeStrategies.map((strategy) =>
              runBacktest({
                strategyId: strategy.id,
                periodId: '30d', // Use 30 days as default
                initialBalance: 10000,
                includeFees: true,
                feePercentage: 0.1,
              }).then(result => ({
                strategyId: strategy.id,
                performance: result.performance.totalReturn
              }))
            )
          );
          
          // Find the strategy with the highest return
          if (results.length === 0) {
            return null;
          }
          
          // Fix the type issue by using a type assertion
          const bestResult = results.reduce((best, current) => 
            current.performance > best.performance ? current : best, 
            results[0] as {strategyId: string; performance: number}
          );
          
          return bestResult.strategyId;
        } catch (error) {
          console.error('Error finding best strategy:', error);
          return null;
        }
      }
    }),
    {
      name: 'crypto-bot-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist strategies that have the persistent flag
      partialize: (state) => ({
        ...state,
        strategies: state.strategies.filter(strategy => strategy.persistent !== false),
        exchangeSettings: state.exchangeSettings, // Make sure exchange settings are persisted
      }),
    }
  )
);