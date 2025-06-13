import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownRight, Calendar, TrendingUp } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { BacktestResult } from '@/types/backtest';
import { useBotStore } from '@/store/botStore';

interface BacktestResultCardProps {
  result: BacktestResult;
  onPress: (result: BacktestResult) => void;
}

export const BacktestResultCard: React.FC<BacktestResultCardProps> = ({ 
  result,
  onPress
}) => {
  const { strategies } = useBotStore();
  const strategy = strategies.find(s => s.id === result.strategyId);
  const isPositive = result.performance.totalReturn >= 0;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(result)}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{strategy?.name || 'Custom Strategy'}</Text>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.date}>
              {formatDate(result.startDate)} - {formatDate(result.endDate)}
            </Text>
          </View>
        </View>
        
        <View style={styles.returnContainer}>
          {isPositive ? (
            <ArrowUpRight size={18} color={colors.success} />
          ) : (
            <ArrowDownRight size={18} color={colors.danger} />
          )}
          <Text
            style={[
              styles.returnText,
              { color: isPositive ? colors.success : colors.danger },
            ]}
          >
            {result.performance.totalReturn.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Initial</Text>
          <Text style={styles.metricValue}>${result.initialBalance.toLocaleString()}</Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Final</Text>
          <Text style={styles.metricValue}>${result.finalBalance.toLocaleString()}</Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Win Rate</Text>
          <Text style={styles.metricValue}>{result.performance.winRate.toFixed(1)}%</Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Drawdown</Text>
          <Text style={styles.metricValue}>{result.performance.maxDrawdown.toFixed(1)}%</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TrendingUp size={16} color={colors.textSecondary} />
        <Text style={styles.tradesText}>
          {result.trades.length} trades executed
        </Text>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  returnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  returnText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  metricValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradesText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 6,
  },
});