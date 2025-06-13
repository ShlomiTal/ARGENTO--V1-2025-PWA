import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { cryptos } from '@/constants/cryptos';
import { strategyTypes } from '@/constants/strategies';
import { useBotStore } from '@/store/botStore';
import { TradingMode } from '@/types/crypto';
import { useTheme } from '@/components/ThemeProvider';
import { HeaderBar } from '@/components/HeaderBar';

export default function CreateStrategyScreen() {
  const router = useRouter();
  const { addStrategy, activeTradingMode } = useBotStore();
  const { colors } = useTheme();
  
  const [name, setName] = useState('');
  const [cryptoId, setCryptoId] = useState(cryptos[0].id);
  const [strategyType, setStrategyType] = useState(strategyTypes[0].id);
  const [tradingMode, setTradingMode] = useState<TradingMode>(activeTradingMode);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [leverage, setLeverage] = useState('5');
  const [useAllCryptos, setUseAllCryptos] = useState(false);
  const [saveStrategy, setSaveStrategy] = useState(true);
  
  const selectedStrategy = strategyTypes.find((s) => s.id === strategyType);
  
  const handleParameterChange = (paramId: string, value: string) => {
    setParameters({
      ...parameters,
      [paramId]: parseFloat(value),
    });
  };
  
  const handleCreateStrategy = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a strategy name');
      return;
    }
    
    // Set default parameters if not provided
    const finalParameters: Record<string, any> = {};
    selectedStrategy?.parameters.forEach((param) => {
      finalParameters[param.id] = parameters[param.id] !== undefined 
        ? parameters[param.id] 
        : param.default;
    });
    
    // Add leverage parameter for futures
    if (tradingMode === 'future') {
      finalParameters.leverage = parseFloat(leverage) || 5;
    }
    
    // Add useAllCryptos flag
    finalParameters.useAllCryptos = useAllCryptos;
    
    if (useAllCryptos) {
      // Create a strategy for each crypto
      const strategies = cryptos.map(crypto => ({
        name: `${name} - ${crypto.symbol}`,
        cryptoId: crypto.id,
        type: strategyType,
        parameters: finalParameters,
        active: true,
        tradingMode,
        persistent: saveStrategy,
      }));
      
      strategies.forEach(strategy => {
        addStrategy(strategy);
      });
      
      Alert.alert('Success', `Created ${strategies.length} strategies for all cryptocurrencies`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      // Create a single strategy
      const newStrategy = {
        name: name.trim(),
        cryptoId,
        type: strategyType,
        parameters: finalParameters,
        active: true,
        tradingMode,
        persistent: saveStrategy,
      };
      
      console.log("Creating strategy:", newStrategy);
      addStrategy(newStrategy);
      
      Alert.alert('Success', 'Strategy created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Create Trading Strategy</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Strategy Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter strategy name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Trading Mode</Text>
            <View style={styles.tradingModeContainer}>
              <TouchableOpacity
                style={[
                  styles.tradingModeButton,
                  { backgroundColor: colors.card },
                  tradingMode === 'spot' && [styles.activeTradingModeButton, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setTradingMode('spot')}
              >
                <Text
                  style={[
                    styles.tradingModeText,
                    { color: colors.textSecondary },
                    tradingMode === 'spot' && [styles.activeTradingModeText, { color: colors.text }],
                  ]}
                >
                  Spot
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tradingModeButton,
                  { backgroundColor: colors.card },
                  tradingMode === 'future' && [styles.activeTradingModeButton, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setTradingMode('future')}
              >
                <Text
                  style={[
                    styles.tradingModeText,
                    { color: colors.textSecondary },
                    tradingMode === 'future' && [styles.activeTradingModeText, { color: colors.text }],
                  ]}
                >
                  Future
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {tradingMode === 'future' && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Leverage (x)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={leverage}
                onChangeText={setLeverage}
                placeholder="5"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          )}
          
          <View style={[styles.switchContainer, { backgroundColor: colors.card }]}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Apply to all cryptocurrencies</Text>
              <Switch
                value={useAllCryptos}
                onValueChange={setUseAllCryptos}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={useAllCryptos ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
            
            <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
              This will create separate strategies for each cryptocurrency using the same parameters
            </Text>
          </View>
          
          {!useAllCryptos && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Cryptocurrency</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
                <Picker
                  selectedValue={cryptoId}
                  onValueChange={(value) => setCryptoId(value)}
                  style={[styles.picker, { color: colors.text }]}
                  dropdownIconColor={colors.text}
                >
                  {cryptos.map((crypto) => (
                    <Picker.Item
                      key={crypto.id}
                      label={`${crypto.name} (${crypto.symbol})`}
                      value={crypto.id}
                      color={colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Strategy Type</Text>
            <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
              <Picker
                selectedValue={strategyType}
                onValueChange={(value) => setStrategyType(value)}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.text}
              >
                {strategyTypes.map((strategy) => (
                  <Picker.Item
                    key={strategy.id}
                    label={strategy.name}
                    value={strategy.id}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>
          
          {selectedStrategy && (
            <View style={[styles.parametersContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.parametersTitle, { color: colors.text }]}>Strategy Parameters</Text>
              <Text style={[styles.parametersDescription, { color: colors.textSecondary }]}>
                {selectedStrategy.description}
              </Text>
              
              {selectedStrategy.parameters.map((param) => (
                <View key={param.id} style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>{param.name}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: 'rgba(128, 128, 128, 0.1)', color: colors.text }]}
                    value={
                      parameters[param.id] !== undefined
                        ? parameters[param.id].toString()
                        : param.default.toString()
                    }
                    onChangeText={(value) => handleParameterChange(param.id, value)}
                    placeholder={param.default.toString()}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              ))}
            </View>
          )}
          
          <View style={[styles.switchContainer, { backgroundColor: colors.card }]}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Save strategy permanently</Text>
              <Switch
                value={saveStrategy}
                onValueChange={setSaveStrategy}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={saveStrategy ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
            
            <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
              When enabled, this strategy will be saved and available after you restart the app
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateStrategy}
          >
            <Text style={[styles.createButtonText, { color: colors.text }]}>Create Strategy</Text>
          </TouchableOpacity>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  tradingModeContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tradingModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTradingModeButton: {
  },
  tradingModeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTradingModeText: {
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: 'transparent',
  },
  parametersContainer: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  parametersTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  parametersDescription: {
    marginBottom: 16,
  },
  createButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 14,
  },
});