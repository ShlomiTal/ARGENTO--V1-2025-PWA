import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { cryptos } from '@/constants/cryptos';
import { PriceChart } from '@/components/PriceChart';
import { useBotStore } from '@/store/botStore';
import { TradingModeTabs } from '@/components/TradingModeTabs';
import { TradingMode } from '@/types/crypto';

export default function CryptoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const crypto = cryptos.find((c) => c.id === id);
  const { executeTrade, portfolio, activeTradingMode, setTradingMode } = useBotStore();
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState('5');
  
  if (!crypto) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Cryptocurrency not found</Text>
      </View>
    );
  }
  
  const isPositive = crypto.priceChangePercentage24h >= 0;
  const totalValue = parseFloat(amount) * crypto.currentPrice;
  
  const handleTradingModeChange = (mode: TradingMode) => {
    setTradingMode(mode);
  };
  
  const handleTrade = () => {
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    const portfolioData = portfolio[activeTradingMode];
    
    if (tradeType === 'buy') {
      let cost = totalValue;
      
      if (cost > portfolioData.balance) {
        Alert.alert('Insufficient Funds', 'You do not have enough balance for this trade');
        return;
      }
    } else {
      const asset = portfolioData.assets.find((a) => a.cryptoId === crypto.id);
      if (!asset || asset.amount < amountValue) {
        Alert.alert('Insufficient Assets', `You do not have enough ${crypto.symbol} for this trade`);
        return;
      }
    }
    
    const tradeDetails: any = {
      strategyId: 'manual',
      cryptoId: crypto.id,
      type: tradeType,
      price: crypto.currentPrice,
      amount: amountValue,
      tradingMode: activeTradingMode,
    };
    
    // Add leverage for futures
    if (activeTradingMode === 'future') {
      tradeDetails.leverage = parseFloat(leverage) || 5;
    }
    
    executeTrade(tradeDetails);
    
    Alert.alert(
      'Trade Executed',
      `Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${amountValue} ${crypto.symbol} at $${crypto.currentPrice}`
    );
    
    setAmount('');
  };
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: crypto.name }} />
      
      <View style={styles.content}>
        <TradingModeTabs 
          activeMode={activeTradingMode} 
          onChangeMode={handleTradingModeChange} 
        />
        
        <View style={styles.header}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${crypto.currentPrice.toLocaleString()}</Text>
            <View style={styles.changeContainer}>
              {isPositive ? (
                <ArrowUpRight size={20} color={colors.success} />
              ) : (
                <ArrowDownRight size={20} color={colors.danger} />
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
        
        <View style={styles.chartContainer}>
          <PriceChart 
            data={crypto.sparklineData} 
            height={250}
            showGrid={true}
          />
        </View>
        
        <View style={styles.tradeSection}>
          <Text style={styles.sectionTitle}>Trade {crypto.symbol}</Text>
          
          <View style={styles.tradeTypeContainer}>
            <TouchableOpacity
              style={[
                styles.tradeTypeButton,
                tradeType === 'buy' && styles.activeTradeTypeButton,
              ]}
              onPress={() => setTradeType('buy')}
            >
              <Text
                style={[
                  styles.tradeTypeText,
                  tradeType === 'buy' && styles.activeTradeTypeText,
                ]}
              >
                Buy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tradeTypeButton,
                tradeType === 'sell' && styles.activeTradeTypeButton,
              ]}
              onPress={() => setTradeType('sell')}
            >
              <Text
                style={[
                  styles.tradeTypeText,
                  tradeType === 'sell' && styles.activeTradeTypeText,
                ]}
              >
                Sell
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTradingMode === 'future' && (
            <View style={styles.leverageContainer}>
              <Text style={styles.leverageLabel}>Leverage</Text>
              <View style={styles.leverageInputContainer}>
                <TextInput
                  style={styles.leverageInput}
                  value={leverage}
                  onChangeText={setLeverage}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.leverageX}>x</Text>
              </View>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount ({crypto.symbol})</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder={`Enter ${crypto.symbol} amount`}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Price</Text>
              <Text style={styles.summaryValue}>${crypto.currentPrice.toLocaleString()}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>
                ${isNaN(totalValue) ? '0.00' : totalValue.toLocaleString()}
              </Text>
            </View>
            
            {activeTradingMode === 'future' && !isNaN(parseFloat(leverage)) && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Position Size</Text>
                <Text style={styles.summaryValue}>
                  ${isNaN(totalValue) ? '0.00' : (totalValue * parseFloat(leverage)).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.tradeButton,
              { backgroundColor: tradeType === 'buy' ? colors.success : colors.danger },
            ]}
            onPress={handleTrade}
          >
            <Text style={styles.tradeButtonText}>
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {crypto.symbol}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About {crypto.name}</Text>
          <Text style={styles.infoText}>
            {crypto.name} ({crypto.symbol}) is a cryptocurrency that uses blockchain technology.
            This is a simulated trading environment, and no real trades are being executed.
          </Text>
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
  content: {
    padding: 16,
  },
  header: {
    marginTop: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 12,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  change: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 2,
  },
  chartContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginVertical: 24,
  },
  tradeSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 4,
  },
  activeTradeTypeButton: {
    backgroundColor: colors.primary,
  },
  tradeTypeText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTradeTypeText: {
    color: colors.text,
  },
  leverageContainer: {
    marginBottom: 16,
  },
  leverageLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  leverageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  leverageInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  leverageX: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.textSecondary,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '500',
  },
  tradeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tradeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
});