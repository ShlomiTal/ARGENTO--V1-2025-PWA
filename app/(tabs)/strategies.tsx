import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useBotStore } from '@/store/botStore';
import { StrategyCard } from '@/components/StrategyCard';
import { TradingModeTabs } from '@/components/TradingModeTabs';
import { TradingMode } from '@/types/crypto';

export default function StrategiesScreen() {
  const router = useRouter();
  const { strategies, toggleStrategy, removeStrategy, activeTradingMode, setTradingMode } = useBotStore();
  
  // Filter strategies by trading mode
  const filteredStrategies = strategies.filter(
    strategy => !strategy.tradingMode || strategy.tradingMode === activeTradingMode
  );
  
  const navigateToCreateStrategy = () => {
    router.push('/strategy/create');
  };
  
  const handleEditStrategy = (strategyId: string) => {
    router.push(`/strategy/${strategyId}`);
  };
  
  const handleTradingModeChange = (mode: TradingMode) => {
    setTradingMode(mode);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TradingModeTabs 
          activeMode={activeTradingMode} 
          onChangeMode={handleTradingModeChange} 
        />
        
        <View style={styles.header}>
          <Text style={styles.title}>{activeTradingMode.charAt(0).toUpperCase() + activeTradingMode.slice(1)} Trading Strategies</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={navigateToCreateStrategy}
          >
            <Plus size={20} color={colors.text} />
            <Text style={styles.addButtonText}>New Strategy</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.strategiesList}>
          {filteredStrategies.length > 0 ? (
            filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onToggle={toggleStrategy}
                onEdit={() => handleEditStrategy(strategy.id)}
                onDelete={removeStrategy}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No {activeTradingMode.charAt(0).toUpperCase() + activeTradingMode.slice(1)} Strategies Yet</Text>
              <Text style={styles.emptyText}>
                Create your first {activeTradingMode} trading strategy to start automating your trades.
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={navigateToCreateStrategy}
              >
                <Text style={styles.emptyButtonText}>Create Strategy</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  strategiesList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 80,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});