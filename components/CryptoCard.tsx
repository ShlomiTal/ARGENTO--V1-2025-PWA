import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Crypto } from '@/types/crypto';
import { colors } from '@/constants/colors';
import { PriceChart } from './PriceChart';

interface CryptoCardProps {
  crypto: Crypto;
  onPress: (crypto: Crypto) => void;
  compact?: boolean;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ 
  crypto, 
  onPress,
  compact = false
}) => {
  const isPositive = crypto.priceChangePercentage24h >= 0;
  
  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.compactContainer]} 
      onPress={() => onPress(crypto)}
    >
      <View style={styles.header}>
        <View style={styles.cryptoInfo}>
          <Image source={{ uri: crypto.image }} style={styles.image} />
          <View>
            <Text style={styles.name}>{crypto.name}</Text>
            <Text style={styles.symbol}>{crypto.symbol}</Text>
          </View>
        </View>
        
        <View style={styles.priceInfo}>
          <Text style={styles.price}>${crypto.currentPrice.toLocaleString()}</Text>
          <View style={styles.changeContainer}>
            {isPositive ? (
              <ArrowUpRight size={16} color={colors.success} />
            ) : (
              <ArrowDownRight size={16} color={colors.danger} />
            )}
            <Text
              style={[
                styles.change,
                { color: isPositive ? colors.success : colors.danger },
              ]}
            >
              {Math.abs(crypto.priceChangePercentage24h).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
      
      {!compact && (
        <View style={styles.chartContainer}>
          <PriceChart 
            data={crypto.sparklineData} 
            height={80} 
            showGrid={false}
            color={isPositive ? colors.chart.green : colors.chart.red}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  compactContainer: {
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  symbol: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 14,
    marginLeft: 2,
  },
  chartContainer: {
    marginTop: 12,
  },
});