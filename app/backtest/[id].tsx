import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useBacktestStore } from '@/store/backtestStore';
import { useBotStore } from '@/store/botStore';
import { EquityChart } from '@/components/EquityChart';
import { TradeHistoryItem } from '@/components/TradeHistoryItem';

export default function BacktestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getResultById } = useBacktestStore();
  const { strategies } = useBotStore();
  
  const result = getResultById(id as string);
  
  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Backtest result not found</Text>
      </View>
    );
  }
  
  const strategy = strategies.find(s => s.id === result.strategyId);
  const isPositive = result.performance.totalReturn >= 0;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  const metrics = [
    {
      icon: <TrendingUp size={20} color={isPositive ? colors.success : colors.danger} />,
      label: 'Total Return',
      value: `${result.performance.totalReturn.toFixed(2)}%`,
      color: isPositive ? colors.success : colors.danger,
    },
    {
      icon: <BarChart2 size={20} color={colors.primary} />,
      label: 'Win Rate',
      value: `${result.performance.winRate.toFixed(1)}%`,
      color: colors.text,
    },
    {
      icon: <DollarSign size={20} color={colors.secondary} />,
      label: 'Profit Factor',
      value: result.performance.profitFactor.toFixed(2),
      color: colors.text,
    },
    {
      icon: <TrendingDown size={20} color={colors.danger} />,
      label: 'Max Drawdown',
      value: `${result.performance.maxDrawdown.toFixed(1)}%`,
      color: colors.danger,
    },
  ];
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Backtest Results',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>{strategy?.name || 'Custom Strategy'}</Text>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={styles.date}>
            {formatDate(result.startDate)} - {formatDate(result.endDate)}
          </Text>
        </View>
        
        {result.tradingMode && (
          <View style={styles.tradingModeTag}>
            <Text style={styles.tradingModeText}>
              {result.tradingMode.charAt(0).toUpperCase() + result.tradingMode.slice(1)} Trading
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.summaryCard}>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Initial Balance</Text>
            <Text style={styles.balanceValue}>${result.initialBalance.toLocaleString()}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Final Balance</Text>
            <Text style={styles.balanceValue}>${result.finalBalance.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.returnContainer}>
          <Text style={styles.returnLabel}>Total Return</Text>
          <Text
            style={[
              styles.returnValue,
              { color: isPositive ? colors.success : colors.danger },
            ]}
          >
            {isPositive ? '+' : ''}
            {result.performance.totalReturn.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equity Curve</Text>
        <View style={styles.chartCard}>
          <EquityChart data={result.equity} height={200} showGrid={true} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsCard}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <View style={styles.metricIcon}>{metric.icon}</View>
              <View>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: metric.color }]}>
                  {metric.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trade History</Text>
        <View style={styles.tradesCard}>
          {result.trades.length > 0 ? (
            result.trades.map((trade) => (
              <TradeHistoryItem key={trade.id} trade={trade} />
            ))
          ) : (
            <Text style={styles.noTradesText}>No trades executed</Text>
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
  header: {
    padding: 16,
    position: 'relative',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  tradingModeTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tradingModeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceItem: {},
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  returnContainer: {
    alignItems: 'center',
  },
  returnLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  returnValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
  },
  metricsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  tradesCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
  },
  noTradesText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
});