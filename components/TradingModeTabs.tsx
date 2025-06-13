import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TradingMode } from '@/types/crypto';
import { useTheme } from '@/components/ThemeProvider';

interface TradingModeTabsProps {
  activeMode: TradingMode;
  onChangeMode: (mode: TradingMode) => void;
}

export const TradingModeTabs: React.FC<TradingModeTabsProps> = ({
  activeMode,
  onChangeMode,
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeMode === 'spot' && [styles.activeTab, { backgroundColor: colors.primary }],
        ]}
        onPress={() => onChangeMode('spot')}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.textSecondary },
            activeMode === 'spot' && { color: colors.text },
          ]}
        >
          Spot
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeMode === 'future' && [styles.activeTab, { backgroundColor: colors.primary }],
        ]}
        onPress={() => onChangeMode('future')}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.textSecondary },
            activeMode === 'future' && { color: colors.text },
          ]}
        >
          Future
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
  },
  tabText: {
    fontWeight: '600',
    fontSize: 16,
  },
});