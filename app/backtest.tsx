import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Play, Plus, Trash2, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useBotStore } from '@/store/botStore';
import { useBacktestStore } from '@/store/backtestStore';
import { BacktestResultCard } from '@/components/BacktestResultCard';
import { backtestPeriods } from '@/constants/backtestPeriods';
import { Switch } from 'react-native';
import { TradingModeTabs } from '@/components/TradingModeTabs';
import { TradingMode } from '@/types/crypto';
import { useTheme } from '@/components/ThemeProvider';

export default function BacktestScreen() {
  const router = useRouter();
  const { strategies, activeTradingMode, setTradingMode } = useBotStore();
  const { results, runBacktest, deleteResult } = useBacktestStore();
  const { colors } = useTheme();
  
  const [selectedStrategyId, setSelectedStrategyId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState(backtestPeriods[1].id); // Default to 30 days
  const [initialBalance, setInitialBalance] = useState('10000');
  const [includeFees, setIncludeFees] = useState(true);
  const [feePercentage, setFeePercentage] = useState('0.1');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter strategies by trading mode
  const filteredStrategies = strategies.filter(
    strategy => !strategy.tradingMode || strategy.tradingMode === activeTradingMode
  );
  
  // Filter results by trading mode
  const filteredResults = results.filter(
    result => !result.tradingMode || result.tradingMode === activeTradingMode
  );
  
  // Set initial strategy when strategies are loaded
  useEffect(() => {
    if (filteredStrategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(filteredStrategies[0].id);
    }
  }, [filteredStrategies, selectedStrategyId]);
  
  const handleTradingModeChange = (mode: TradingMode) => {
    setTradingMode(mode);
    // Reset selected strategy when changing modes
    setSelectedStrategyId('');
  };
  
  const handleRunBacktest = async () => {
    if (!selectedStrategyId) {
      Alert.alert('Error', 'Please select a strategy');
      return;
    }
    
    setIsRunning(true);
    setError(null);
    
    try {
      await runBacktest({
        strategyId: selectedStrategyId,
        periodId: selectedPeriodId,
        initialBalance: parseFloat(initialBalance) || 10000,
        includeFees,
        feePercentage: parseFloat(feePercentage) || 0.1,
      });
      Alert.alert('Success', 'Backtest completed successfully');
    } catch (error) {
      console.error('Backtest error:', error);
      setError(error instanceof Error ? error.message : 'Failed to run backtest');
      Alert.alert('Error', 'Failed to run backtest. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleViewResult = (result: any) => {
    router.push(`/backtest/${result.id}`);
  };
  
  const handleDeleteResult = (id: string) => {
    deleteResult(id);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Backtest</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <TradingModeTabs 
            activeMode={activeTradingMode} 
            onChangeMode={handleTradingModeChange} 
          />
          
          <Text style={[styles.title, { color: colors.text }]}>
            Backtest {activeTradingMode.charAt(0).toUpperCase() + activeTradingMode.slice(1)} Strategies
          </Text>
          
          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Strategy</Text>
              {filteredStrategies.length > 0 ? (
                <View style={[styles.pickerContainer, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}>
                  <Picker
                    selectedValue={selectedStrategyId}
                    onValueChange={(value) => setSelectedStrategyId(value)}
                    style={[styles.picker, { color: colors.text }]}
                    dropdownIconColor={colors.text}
                  >
                    {filteredStrategies.map((strategy) => (
                      <Picker.Item
                        key={strategy.id}
                        label={strategy.name}
                        value={strategy.id}
                        color={colors.text}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <View style={[styles.noStrategiesContainer, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}>
                  <Text style={[styles.noStrategiesText, { color: colors.textSecondary }]}>
                    No {activeTradingMode} strategies available
                  </Text>
                  <TouchableOpacity
                    style={[styles.createStrategyButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/strategy/create')}
                  >
                    <Plus size={16} color={colors.text} />
                    <Text style={[styles.createStrategyText, { color: colors.text }]}>Create Strategy</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Time Period</Text>
              <View style={[styles.pickerContainer, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}>
                <Picker
                  selectedValue={selectedPeriodId}
                  onValueChange={(value) => setSelectedPeriodId(value)}
                  style={[styles.picker, { color: colors.text }]}
                  dropdownIconColor={colors.text}
                >
                  {backtestPeriods.map((period) => (
                    <Picker.Item
                      key={period.id}
                      label={period.name}
                      value={period.id}
                      color={colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Initial Balance</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}
                value={initialBalance}
                onChangeText={setInitialBalance}
                placeholder="10000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Include Trading Fees</Text>
                <Switch
                  value={includeFees}
                  onValueChange={setIncludeFees}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={includeFees ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>
              
              {includeFees && (
                <View style={styles.feeContainer}>
                  <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Fee Percentage</Text>
                  <TextInput
                    style={[styles.feeInput, { color: colors.text, backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}
                    value={feePercentage}
                    onChangeText={setFeePercentage}
                    placeholder="0.1"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.feePercentSymbol, { color: colors.textSecondary }]}>%</Text>
                </View>
              )}
            </View>
            
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.runButton, 
                { backgroundColor: colors.primary },
                isRunning && { backgroundColor: colors.secondary, opacity: 0.8 }
              ]}
              onPress={handleRunBacktest}
              disabled={isRunning || !selectedStrategyId}
            >
              <Play size={20} color={colors.text} />
              <Text style={[styles.runButtonText, { color: colors.text }]}>
                {isRunning ? 'Running Backtest...' : 'Run Backtest'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {filteredResults.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Backtest Results</Text>
              
              {filteredResults.map((result) => (
                <View key={result.id} style={styles.resultCardWrapper}>
                  <BacktestResultCard
                    result={result}
                    onPress={handleViewResult}
                  />
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}
                    onPress={() => handleDeleteResult(result.id)}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  feeLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  feeInput: {
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  feePercentSymbol: {
    fontSize: 14,
    marginLeft: 8,
  },
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultCardWrapper: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noStrategiesContainer: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  noStrategiesText: {
    marginBottom: 12,
  },
  createStrategyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createStrategyText: {
    marginLeft: 6,
  },
});