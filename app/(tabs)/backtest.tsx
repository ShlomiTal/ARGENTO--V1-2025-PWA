import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Play, Plus, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useBotStore } from '@/store/botStore';
import { useBacktestStore } from '@/store/backtestStore';
import { BacktestResultCard } from '@/components/BacktestResultCard';
import { backtestPeriods } from '@/constants/backtestPeriods';
import { Switch } from 'react-native';
import { TradingModeTabs } from '@/components/TradingModeTabs';
import { TradingMode } from '@/types/crypto';

export default function BacktestScreen() {
  const router = useRouter();
  const { strategies, activeTradingMode, setTradingMode } = useBotStore();
  const { results, runBacktest, deleteResult } = useBacktestStore();
  
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TradingModeTabs 
          activeMode={activeTradingMode} 
          onChangeMode={handleTradingModeChange} 
        />
        
        <Text style={styles.title}>Backtest {activeTradingMode.charAt(0).toUpperCase() + activeTradingMode.slice(1)} Strategies</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Strategy</Text>
            {filteredStrategies.length > 0 ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedStrategyId}
                  onValueChange={(value) => setSelectedStrategyId(value)}
                  style={styles.picker}
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
              <View style={styles.noStrategiesContainer}>
                <Text style={styles.noStrategiesText}>No {activeTradingMode} strategies available</Text>
                <TouchableOpacity
                  style={styles.createStrategyButton}
                  onPress={() => router.push('/strategy/create')}
                >
                  <Plus size={16} color={colors.text} />
                  <Text style={styles.createStrategyText}>Create Strategy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Time Period</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedPeriodId}
                onValueChange={(value) => setSelectedPeriodId(value)}
                style={styles.picker}
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
            <Text style={styles.label}>Initial Balance</Text>
            <TextInput
              style={styles.input}
              value={initialBalance}
              onChangeText={setInitialBalance}
              placeholder="10000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Include Trading Fees</Text>
              <Switch
                value={includeFees}
                onValueChange={setIncludeFees}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={includeFees ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
            
            {includeFees && (
              <View style={styles.feeContainer}>
                <Text style={styles.feeLabel}>Fee Percentage</Text>
                <TextInput
                  style={styles.feeInput}
                  value={feePercentage}
                  onChangeText={setFeePercentage}
                  placeholder="0.1"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
                <Text style={styles.feePercentSymbol}>%</Text>
              </View>
            )}
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.runButton, isRunning && styles.runningButton]}
            onPress={handleRunBacktest}
            disabled={isRunning || !selectedStrategyId}
          >
            <Play size={20} color={colors.text} />
            <Text style={styles.runButtonText}>
              {isRunning ? 'Running Backtest...' : 'Run Backtest'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {filteredResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Backtest Results</Text>
            
            {filteredResults.map((result) => (
              <View key={result.id} style={styles.resultCardWrapper}>
                <BacktestResultCard
                  result={result}
                  onPress={handleViewResult}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: colors.text,
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
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 12,
  },
  feeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },
  feePercentSymbol: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  runningButton: {
    backgroundColor: colors.secondary,
    opacity: 0.8,
  },
  runButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
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
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noStrategiesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  noStrategiesText: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  createStrategyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createStrategyText: {
    color: colors.text,
    marginLeft: 6,
  },
});