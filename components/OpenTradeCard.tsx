import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OpenTrade } from '@/types/crypto';
import { cryptos } from '@/constants/cryptos';
import { ArrowUp, ArrowDown, X } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface OpenTradeCardProps {
  trade: OpenTrade;
  onClose: (id: string) => void;
  isExchangeTrade?: boolean;
}

export const OpenTradeCard: React.FC<OpenTradeCardProps> = ({ trade, onClose, isExchangeTrade = false }) => {
  const { colors } = useTheme();
  const crypto = cryptos.find((c) => c.id === trade.cryptoId);
  
  if (!crypto) return null;
  
  const isProfitable = trade.pnl > 0;
  const pnlPercentage = (trade.pnl / (trade.price * trade.amount)) * 100;
  
  // Get exchange name from trade ID if it's an exchange trade
  const getExchangeName = () => {
    if (!isExchangeTrade || !trade.exchangeTradeId) return "EXCHANGE";
    
    // Extract exchange name from the trade ID (format: "exchange-randomId")
    const parts = trade.exchangeTradeId.split('-');
    if (parts.length > 0) {
      return parts[0].toUpperCase();
    }
    
    return "EXCHANGE";
  };
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderLeftColor: trade.type === 'buy' ? colors.success : colors.danger,
          borderLeftWidth: 3,
        },
        isExchangeTrade && { borderColor: colors.primary, borderWidth: 1, borderLeftWidth: 3 }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.cryptoInfo}>
          <Text style={[styles.cryptoSymbol, { color: colors.text }]}>{crypto.symbol}</Text>
          <View 
            style={[
              styles.typeTag, 
              { 
                backgroundColor: trade.type === 'buy' 
                  ? 'rgba(46, 213, 115, 0.1)' 
                  : 'rgba(255, 71, 87, 0.1)' 
              }
            ]}
          >
            <Text 
              style={[
                styles.typeText, 
                { 
                  color: trade.type === 'buy' ? colors.success : colors.danger 
                }
              ]}
            >
              {trade.type === 'buy' ? 'LONG' : 'SHORT'}
            </Text>
          </View>
          
          {isExchangeTrade && (
            <View style={[styles.exchangeTag, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
              <Text style={[styles.exchangeText, { color: colors.primary }]}>{getExchangeName()}</Text>
            </View>
          )}
          
          {trade.leverage && trade.leverage > 1 && (
            <View style={[styles.leverageTag, { backgroundColor: 'rgba(253, 203, 110, 0.1)' }]}>
              <Text style={[styles.leverageText, { color: '#fdcb6e' }]}>{trade.leverage}x</Text>
            </View>
          )}
        </View>
        
        {!isExchangeTrade && (
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}
            onPress={() => onClose(trade.id)}
          >
            <X size={16} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Entry Price</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>${trade.price.toFixed(2)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Current Price</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>${trade.currentPrice.toFixed(2)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{trade.amount.toFixed(4)} {crypto.symbol}</Text>
        </View>
      </View>
      
      <View style={styles.pnlContainer}>
        <View style={styles.pnlInfo}>
          <Text style={[styles.pnlLabel, { color: colors.textSecondary }]}>P&L</Text>
          <View style={styles.pnlValueContainer}>
            {isProfitable ? (
              <ArrowUp size={14} color={colors.success} />
            ) : (
              <ArrowDown size={14} color={colors.danger} />
            )}
            <Text 
              style={[
                styles.pnlValue, 
                { color: isProfitable ? colors.success : colors.danger }
              ]}
            >
              {isProfitable ? '+' : ''}${trade.pnl.toFixed(2)} ({isProfitable ? '+' : ''}{pnlPercentage.toFixed(2)}%)
            </Text>
          </View>
        </View>
        
        {!isExchangeTrade && (
          <TouchableOpacity 
            style={[styles.closePositionButton, { backgroundColor: colors.primary }]}
            onPress={() => onClose(trade.id)}
          >
            <Text style={styles.closePositionText}>Close Position</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  exchangeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  exchangeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  leverageTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leverageText: {
    fontSize: 10,
    fontWeight: '500',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  pnlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 12,
  },
  pnlInfo: {
    flex: 1,
  },
  pnlLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  pnlValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  closePositionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  closePositionText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
});