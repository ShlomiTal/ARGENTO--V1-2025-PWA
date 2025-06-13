import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import { Trade } from '@/types/crypto';
import { cryptos } from '@/constants/cryptos';
import { useTheme } from '@/components/ThemeProvider';

interface TradeHistoryItemProps {
  trade: Trade;
}

export const TradeHistoryItem: React.FC<TradeHistoryItemProps> = ({ trade }) => {
  const crypto = cryptos.find((c) => c.id === trade.cryptoId);
  if (!crypto) return null;
  
  const { colors } = useTheme();
  const isBuy = trade.type === 'buy';
  const date = new Date(trade.timestamp);
  
  return (
    <View style={[styles.container, { borderBottomColor: 'rgba(128, 128, 128, 0.2)' }]}>
      <View style={styles.iconContainer}>
        {isBuy ? (
          <ArrowDownCircle size={24} color={colors.success} />
        ) : (
          <ArrowUpCircle size={24} color={colors.danger} />
        )}
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isBuy ? 'Bought' : 'Sold'} {crypto.symbol}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
        {trade.tradingMode === 'future' && trade.leverage && (
          <View style={[styles.leverageTag, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}>
            <Text style={[styles.leverageText, { color: colors.primary }]}>{trade.leverage}x</Text>
          </View>
        )}
      </View>
      
      <View style={styles.values}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {trade.amount.toFixed(6)} {crypto.symbol}
        </Text>
        <Text style={[styles.price, { color: colors.textSecondary }]}>
          ${(trade.price * trade.amount).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  details: {
    flex: 1,
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  leverageTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leverageText: {
    fontSize: 10,
    fontWeight: '500',
  },
  values: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
  },
  price: {
    fontSize: 12,
    marginTop: 2,
  },
});