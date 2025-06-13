import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart2, TrendingUp, Clock, DollarSign, Calendar } from 'lucide-react-native';
import { useBotStore } from '@/store/botStore';
import { useUserStore } from '@/store/userStore';
import { useTheme } from '@/components/ThemeProvider';
import { HeaderBar } from '@/components/HeaderBar';
import { EquityChart } from '@/components/EquityChart';

// Define time periods for statistics
type TimePeriod = '1d' | '7d' | '30d' | 'all';

export default function StatisticsScreen() {
  const { portfolio, strategies } = useBotStore();
  const { users } = useUserStore();
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7d');
  
  // Calculate statistics
  const activeUsers = users.filter(user => user.isActive).length;
  const totalUsers = users.length;
  const activeStrategies = strategies.filter(strategy => strategy.active).length;
  const totalStrategies = strategies.length;
  
  // Calculate best performing strategy
  const getBestStrategy = () => {
    if (strategies.length === 0) return null;
    
    // In a real app, you would calculate this based on actual performance data
    // For now, we'll just return a random strategy
    const randomIndex = Math.floor(Math.random() * strategies.length);
    return strategies[randomIndex];
  };
  
  const bestStrategy = getBestStrategy();
  
  // Calculate trading statistics
  const spotTrades = portfolio.spot.trades.length;
  const futureTrades = portfolio.future.trades.length;
  const totalTrades = spotTrades + futureTrades;
  
  // Calculate profit statistics (simulated)
  const getPerformanceData = () => {
    switch (selectedPeriod) {
      case '1d':
        return {
          totalProfit: 245.32,
          percentChange: 2.45,
          bestDay: 'Today',
          worstDay: 'Today',
          avgTradeProfit: 12.27,
        };
      case '7d':
        return {
          totalProfit: 1245.87,
          percentChange: 12.46,
          bestDay: 'Wednesday',
          worstDay: 'Monday',
          avgTradeProfit: 15.38,
        };
      case '30d':
        return {
          totalProfit: 3782.54,
          percentChange: 37.83,
          bestDay: 'Last Friday',
          worstDay: '2 Weeks Ago',
          avgTradeProfit: 18.91,
        };
      case 'all':
        return {
          totalProfit: 8934.21,
          percentChange: 89.34,
          bestDay: '3 Weeks Ago',
          worstDay: 'First Day',
          avgTradeProfit: 22.34,
        };
    }
  };
  
  const performanceData = getPerformanceData();
  
  // Generate mock data for the equity chart
  const generateEquityData = () => {
    const dataPoints = selectedPeriod === '1d' ? 24 : 
                      selectedPeriod === '7d' ? 7 : 
                      selectedPeriod === '30d' ? 30 : 60;
    
    let data = [];
    let value = 10000; // Starting value
    
    for (let i = 0; i < dataPoints; i++) {
      // Add some randomness to the data
      const change = (Math.random() * 500) - 200;
      value += change;
      value = Math.max(value, 8000); // Ensure we don't go below 8000
      
      data.push(value);
    }
    
    return data;
  };
  
  const equityData = generateEquityData();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Statistics</Text>
        </View>
        
        <View style={styles.periodSelector}>
          {(['1d', '7d', '30d', 'all'] as TimePeriod[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && [styles.selectedPeriodButton, { backgroundColor: colors.primary }]
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: colors.textSecondary },
                  selectedPeriod === period && [styles.selectedPeriodText, { color: colors.text }]
                ]}
              >
                {period === 'all' ? 'All Time' : period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View style={styles.summaryHeader}>
            <TrendingUp size={24} color="#FFFFFF" />
            <Text style={styles.summaryTitle}>Performance Summary</Text>
          </View>
          
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Profit</Text>
              <Text style={styles.summaryValue}>${performanceData.totalProfit.toLocaleString()}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Percent Change</Text>
              <Text style={styles.summaryValue}>+{performanceData.percentChange}%</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Equity Curve</Text>
          <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
            <EquityChart data={equityData} />
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statsIconContainer, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}>
              <BarChart2 size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statsValue, { color: colors.text }]}>{totalTrades}</Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Total Trades</Text>
          </View>
          
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statsIconContainer, { backgroundColor: 'rgba(0, 184, 148, 0.2)' }]}>
              <DollarSign size={24} color={colors.success} />
            </View>
            <Text style={[styles.statsValue, { color: colors.text }]}>${performanceData.avgTradeProfit.toFixed(2)}</Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Avg. Profit/Trade</Text>
          </View>
          
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statsIconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
              <Calendar size={24} color={colors.danger} />
            </View>
            <Text style={[styles.statsValue, { color: colors.text }]}>{performanceData.bestDay}</Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Best Trading Day</Text>
          </View>
          
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statsIconContainer, { backgroundColor: 'rgba(255, 159, 67, 0.2)' }]}>
              <Clock size={24} color="#FF9F43" />
            </View>
            <Text style={[styles.statsValue, { color: colors.text }]}>{performanceData.worstDay}</Text>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Worst Trading Day</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>User Statistics</Text>
          <View style={[styles.userStatsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.userStatItem}>
              <Text style={[styles.userStatValue, { color: colors.text }]}>{activeUsers}</Text>
              <Text style={[styles.userStatLabel, { color: colors.textSecondary }]}>Active Users</Text>
            </View>
            
            <View style={[styles.userStatDivider, { backgroundColor: 'rgba(128, 128, 128, 0.2)' }]} />
            
            <View style={styles.userStatItem}>
              <Text style={[styles.userStatValue, { color: colors.text }]}>{totalUsers}</Text>
              <Text style={[styles.userStatLabel, { color: colors.textSecondary }]}>Total Users</Text>
            </View>
            
            <View style={[styles.userStatDivider, { backgroundColor: 'rgba(128, 128, 128, 0.2)' }]} />
            
            <View style={styles.userStatItem}>
              <Text style={[styles.userStatValue, { color: colors.text }]}>{activeUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%</Text>
              <Text style={[styles.userStatLabel, { color: colors.textSecondary }]}>Active Rate</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Strategy Statistics</Text>
          <View style={[styles.strategyStatsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.strategyStatRow}>
              <View style={styles.strategyStatItem}>
                <Text style={[styles.strategyStatLabel, { color: colors.textSecondary }]}>Active Strategies</Text>
                <Text style={[styles.strategyStatValue, { color: colors.text }]}>{activeStrategies}</Text>
              </View>
              
              <View style={styles.strategyStatItem}>
                <Text style={[styles.strategyStatLabel, { color: colors.textSecondary }]}>Total Strategies</Text>
                <Text style={[styles.strategyStatValue, { color: colors.text }]}>{totalStrategies}</Text>
              </View>
            </View>
            
            <View style={[styles.strategyDivider, { backgroundColor: 'rgba(128, 128, 128, 0.2)' }]} />
            
            <View style={styles.bestStrategyContainer}>
              <Text style={[styles.bestStrategyLabel, { color: colors.textSecondary }]}>Best Performing Strategy</Text>
              {bestStrategy ? (
                <View style={styles.bestStrategy}>
                  <Text style={[styles.bestStrategyName, { color: colors.text }]}>{bestStrategy.name}</Text>
                  <View style={[styles.bestStrategyTag, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}>
                    <Text style={[styles.bestStrategyTagText, { color: colors.primary }]}>
                      {bestStrategy.tradingMode || 'spot'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.noStrategyText, { color: colors.textSecondary }]}>No strategies available</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    borderRadius: 8,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPeriodText: {
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  chartContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    height: 200,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 24,
  },
  statsCard: {
    width: '46%',
    margin: 4,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  userStatsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStatLabel: {
    fontSize: 12,
  },
  userStatDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  strategyStatsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  strategyStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strategyStatItem: {
    flex: 1,
  },
  strategyStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  strategyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  strategyDivider: {
    height: 1,
    marginVertical: 16,
  },
  bestStrategyContainer: {
  },
  bestStrategyLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  bestStrategy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bestStrategyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bestStrategyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bestStrategyTagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  noStrategyText: {
    fontStyle: 'italic',
  },
});