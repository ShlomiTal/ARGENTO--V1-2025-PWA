import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { useBotStore } from '@/store/botStore';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { TradeHistoryItem } from '@/components/TradeHistoryItem';
import { cryptos } from '@/constants/cryptos';
import { TradingModeTabs } from '@/components/TradingModeTabs';
import { TradingMode } from '@/types/crypto';

export default function PortfolioScreen() {
  const { portfolio, activeTradingMode, setTradingMode } = useBotStore();
  
  const handleTradingModeChange = (mode: TradingMode) => {
    setTradingMode(mode);
  };
  
  const portfolioData = portfolio[activeTradingMode];
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TradingModeTabs 
          activeMode={activeTradingMode} 
          onChangeMode={handleTradingModeChange} 
        />
        
        <PortfolioSummary portfolio={portfolio} tradingMode={activeTradingMode} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Assets</Text>
          
          {portfolioData.assets.length > 0 ? (
            <View style={styles.assetsList}>
              {portfolioData.assets.map((asset) => {
                const crypto = cryptos.find((c) => c.id === asset.cryptoId);
                if (!crypto) return null;
                
                const value = crypto.currentPrice * asset.amount;
                
                return (
                  <View key={asset.cryptoId} style={styles.assetItem}>
                    <View style={styles.assetInfo}>
                      <Text style={styles.assetSymbol}>{crypto.symbol}</Text>
                      <Text style={styles.assetName}>{crypto.name}</Text>
                    </View>
                    
                    <View style={styles.assetValues}>
                      <Text style={styles.assetAmount}>
                        {asset.amount.toFixed(6)} {crypto.symbol}
                      </Text>
                      <Text style={styles.assetValue}>
                        ${value.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                You don't have any {activeTradingMode} assets yet. Start trading to build your portfolio.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          
          {portfolioData.trades.length > 0 ? (
            <View style={styles.tradesList}>
              {portfolioData.trades
                .slice()
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10)
                .map((trade) => (
                  <TradeHistoryItem key={trade.id} trade={trade} />
                ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No {activeTradingMode} trades yet. Create a strategy to start trading.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  assetsList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  assetInfo: {
    flex: 1,
  },
  assetSymbol: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  assetName: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  assetValue: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  tradesList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});