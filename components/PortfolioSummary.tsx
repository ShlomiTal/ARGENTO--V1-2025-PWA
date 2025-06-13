import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Portfolio, TradingMode } from '@/types/crypto';
import { cryptos } from '@/constants/cryptos';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  tradingMode: TradingMode;
  exchangeBalance?: number | null;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  portfolio, 
  tradingMode,
  exchangeBalance 
}) => {
  const portfolioData = portfolio[tradingMode];
  const { colors } = useTheme();
  
  // Calculate total portfolio value (cash + assets)
  const assetsValue = portfolioData.assets.reduce((total, asset) => {
    const crypto = cryptos.find((c) => c.id === asset.cryptoId);
    if (!crypto) return total;
    return total + crypto.currentPrice * asset.amount;
  }, 0);
  
  // Include exchange balance if available
  const totalValue = portfolioData.balance + assetsValue + (exchangeBalance || 0);
  
  // Performance indicators
  const performanceData = [
    { label: 'Daily', value: portfolioData.performance.daily },
    { label: 'Weekly', value: portfolioData.performance.weekly },
    { label: 'Monthly', value: portfolioData.performance.monthly },
    { label: 'All Time', value: portfolioData.performance.allTime },
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Total Portfolio Value</Text>
        <Text style={[styles.balanceValue, { color: colors.text }]}>${totalValue.toLocaleString()}</Text>
        
        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Cash</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ${portfolioData.balance.toLocaleString()}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Assets</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ${assetsValue.toLocaleString()}
            </Text>
          </View>
          {exchangeBalance !== null && exchangeBalance !== undefined && (
            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Exchange</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                ${exchangeBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}
              </Text>
            </View>
          )}
        </View>
        
        {tradingMode === 'future' && (
          <View style={[styles.leverageContainer, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
            <Text style={[styles.leverageLabel, { color: colors.textSecondary }]}>Leverage</Text>
            <Text style={[styles.leverageValue, { color: colors.primary }]}>{portfolio.future.leverage}x</Text>
          </View>
        )}
      </View>
      
      <View style={[styles.performanceContainer, { borderTopColor: 'rgba(128, 128, 128, 0.2)' }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
        <View style={styles.performanceGrid}>
          {performanceData.map((item) => (
            <View key={item.label} style={styles.performanceItem}>
              <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <View style={styles.performanceValueContainer}>
                {item.value >= 0 ? (
                  <TrendingUp size={14} color={colors.success} />
                ) : (
                  <TrendingDown size={14} color={colors.danger} />
                )}
                <Text
                  style={[
                    styles.performanceValue,
                    {
                      color: item.value >= 0 ? colors.success : colors.danger,
                    },
                  ]}
                >
                  {item.value >= 0 ? '+' : ''}
                  {item.value.toFixed(2)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 8,
  },
  breakdown: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  breakdownItem: {
    flex: 1,
    minWidth: '30%',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  leverageContainer: {
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leverageLabel: {
    fontSize: 14,
  },
  leverageValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  performanceContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  performanceItem: {
    width: '50%',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  performanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});