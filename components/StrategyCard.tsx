import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Strategy } from '@/types/crypto';
import { cryptos } from '@/constants/cryptos';
import { strategyTypes } from '@/constants/strategies';
import { colors } from '@/constants/colors';
import { Settings, Trash2 } from 'lucide-react-native';

interface StrategyCardProps {
  strategy: Strategy;
  onToggle: (id: string) => void;
  onEdit: (strategy: Strategy) => void;
  onDelete: (id: string) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const crypto = cryptos.find((c) => c.id === strategy.cryptoId);
  const strategyType = strategyTypes.find((t) => t.id === strategy.type);
  
  if (!crypto || !strategyType) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{strategy.name}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{crypto.symbol}</Text>
            </View>
            <View style={[styles.badge, styles.typeBadge]}>
              <Text style={styles.badgeText}>{strategyType.name}</Text>
            </View>
            {strategy.tradingMode && (
              <View style={[styles.badge, styles.modeBadge]}>
                <Text style={styles.badgeText}>{strategy.tradingMode}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Switch
          value={strategy.active}
          onValueChange={() => onToggle(strategy.id)}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={strategy.active ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
      
      <Text style={styles.description}>{strategyType.description}</Text>
      
      <View style={styles.parameters}>
        {strategyType.parameters.map((param) => (
          <View key={param.id} style={styles.parameter}>
            <Text style={styles.paramName}>{param.name}:</Text>
            <Text style={styles.paramValue}>
              {strategy.parameters[param.id] || param.default}
            </Text>
          </View>
        ))}
        
        {strategy.tradingMode === 'future' && strategy.parameters.leverage && (
          <View style={styles.parameter}>
            <Text style={styles.paramName}>Leverage:</Text>
            <Text style={styles.paramValue}>{strategy.parameters.leverage}x</Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onEdit(strategy)}
        >
          <Settings size={18} color={colors.text} />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(strategy.id)}
        >
          <Trash2 size={18} color={colors.danger} />
          <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: colors.secondary,
  },
  modeBadge: {
    backgroundColor: '#FF6B6B',
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  parameters: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  parameter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paramName: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  paramValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: colors.text,
    marginLeft: 6,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  deleteText: {
    color: colors.danger,
  },
});