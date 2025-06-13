import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Play, Pause, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useBotStore } from '@/store/botStore';
import { useUserStore } from '@/store/userStore';
import { cryptos } from '@/constants/cryptos';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { TradingModeTabs } from '@/components/TradingModeTabs';
import { TradingMode } from '@/types/crypto';
import { LoadingAnimationModal } from '@/components/LoadingAnimationModal';
import { OpenTradeCard } from '@/components/OpenTradeCard';
import { TradeHistoryItem } from '@/components/TradeHistoryItem';
import { useTheme } from '@/components/ThemeProvider';
import { HeaderBar } from '@/components/HeaderBar';
import { useAppLogoStore } from '@/store/appLogoStore';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Running backtests on all active strategies...');
  const [isSyncingExchange, setSyncingExchange] = useState(false);
  const { colors } = useTheme();
  const { appLogo } = useAppLogoStore();
  
  const { 
    portfolio, 
    strategies, 
    isTrading, 
    toggleTrading, 
    activeTradingMode, 
    setTradingMode,
    activeStrategyId,
    setActiveStrategy,
    findBestStrategy,
    updateOpenTradesPnL,
    closeTrade,
    exchangeSettings,
    syncExchangeData
  } = useBotStore();
  
  const { role, currentUser, canTrade, startTradingPeriod } = useUserStore();
  
  const activeStrategies = strategies.filter(
    strategy => strategy.active && (!strategy.tradingMode || strategy.tradingMode === activeTradingMode)
  );
  
  // Update PnL for open trades every 5 seconds
  useEffect(() => {
    updateOpenTradesPnL();
    
    const interval = setInterval(() => {
      updateOpenTradesPnL();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Sync exchange data on first load if connected
  useEffect(() => {
    if (exchangeSettings.isConnected && (!exchangeSettings.lastSynced || Date.now() - exchangeSettings.lastSynced > 300000)) {
      handleSyncExchange();
    }
  }, []);
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    updateOpenTradesPnL();
    
    // If connected to exchange, sync data
    if (exchangeSettings.isConnected) {
      await handleSyncExchange(false);
    }
    
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [exchangeSettings.isConnected]);
  
  const handleSyncExchange = async (showLoadingState = true) => {
    if (showLoadingState) {
      setSyncingExchange(true);
    }
    
    try {
      const success = await syncExchangeData();
      
      if (!success && showLoadingState) {
        Alert.alert(
          "Sync Failed",
          `Failed to sync data with ${exchangeSettings.exchange.toUpperCase()}. ${exchangeSettings.connectionError || "Please check your API credentials."}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error syncing with exchange:", error);
      if (showLoadingState) {
        Alert.alert(
          "Sync Error",
          "An error occurred while syncing with the exchange.",
          [{ text: "OK" }]
        );
      }
    } finally {
      if (showLoadingState) {
        setSyncingExchange(false);
      }
    }
  };
  
  const navigateToCryptoDetails = (cryptoId: string) => {
    router.push(`/crypto/${cryptoId}`);
  };
  
  const navigateToCreateStrategy = () => {
    router.push('/strategy/create');
  };
  
  const handleTradingModeChange = (mode: TradingMode) => {
    setTradingMode(mode);
  };
  
  const handleToggleTrading = async () => {
    if (isProcessing) return;
    
    // Check if user can trade (for regular users)
    if (!isTrading && role === 'user' && !canTrade()) {
      Alert.alert(
        "Trading Limit Reached",
        "Your 24-hour trading period has expired. Please upgrade your account to continue trading.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (!isTrading) {
      setIsProcessing(true);
      
      // Start the trading period for regular users
      if (role === 'user') {
        startTradingPeriod();
      }
      
      // If starting trading, find the best strategy first
      if (activeStrategies.length === 0) {
        Alert.alert(
          "No Active Strategies",
          "You need at least one active strategy to start trading.",
          [{ text: "OK" }]
        );
        setIsProcessing(false);
        return;
      }
      
      Alert.alert(
        "Start Trading",
        "Do you want to automatically select the best performing strategy based on backtesting?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsProcessing(false)
          },
          {
            text: "Yes, Find Best Strategy",
            onPress: async () => {
              try {
                // Show loading animation
                setLoadingVisible(true);
                setLoadingMessage("Running backtests on all active strategies...");
                
                // Find the best strategy
                const bestStrategyId = await findBestStrategy();
                
                // Update loading message
                setLoadingMessage("Analyzing results and selecting optimal strategy...");
                
                // Add a small delay to show the second message
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Hide loading animation
                setLoadingVisible(false);
                
                if (bestStrategyId) {
                  const bestStrategy = strategies.find(s => s.id === bestStrategyId);
                  setActiveStrategy(bestStrategyId);
                  toggleTrading();
                  
                  Alert.alert(
                    "Trading Started",
                    `Now trading with strategy: ${bestStrategy?.name}`,
                    [{ text: "OK" }]
                  );
                } else {
                  Alert.alert(
                    "No Suitable Strategy",
                    "Could not find a profitable strategy. Please create or modify your strategies.",
                    [{ text: "OK" }]
                  );
                }
                setIsProcessing(false);
              } catch (error) {
                console.error("Error finding best strategy:", error);
                setLoadingVisible(false);
                Alert.alert(
                  "Error",
                  "Failed to find the best strategy. Please try again.",
                  [{ text: "OK" }]
                );
                setIsProcessing(false);
              }
            }
          },
          {
            text: "No, Use All Strategies",
            onPress: () => {
              // Show a quick animation before starting trading
              setLoadingVisible(true);
              setLoadingMessage("Initializing trading system...");
              
              // Add a small delay for the animation
              setTimeout(() => {
                setLoadingVisible(false);
                toggleTrading();
                
                Alert.alert(
                  "Trading Started",
                  "Trading has been started with all active strategies.",
                  [{ text: "OK" }]
                );
                
                setIsProcessing(false);
              }, 1500);
            }
          }
        ]
      );
    } else {
      // If stopping trading, just toggle the state
      toggleTrading();
    }
  };
  
  const handleCloseTrade = (tradeId: string) => {
    Alert.alert(
      "Close Position",
      "Are you sure you want to close this position?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Close Position",
          onPress: () => closeTrade(tradeId)
        }
      ]
    );
  };
  
  // Get open trades from portfolio and exchange if connected
  const getOpenTrades = () => {
    const portfolioTrades = portfolio && portfolio[activeTradingMode] ? portfolio[activeTradingMode].openTrades : [];
    
    // If connected to exchange and we have exchange trades, include them
    const exchangeTrades = exchangeSettings.isConnected && exchangeSettings.openTrades 
      ? exchangeSettings.openTrades.filter(trade => trade.tradingMode === activeTradingMode)
      : [];
    
    return [...portfolioTrades, ...exchangeTrades];
  };
  
  const openTrades = getOpenTrades();
  
  const recentTrades = portfolio && portfolio[activeTradingMode] ? 
    portfolio[activeTradingMode].trades
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5) 
    : [];
  
  // Check if user is a regular user with expired trading time
  const isTradingExpired = role === 'user' && !canTrade();
  
  // Format time since last sync
  const formatLastSynced = () => {
    if (!exchangeSettings.lastSynced) return "Never";
    
    const now = Date.now();
    const diff = now - exchangeSettings.lastSynced;
    
    if (diff < 60000) {
      return "Just now";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else {
      return `${Math.floor(diff / 86400000)} days ago`;
    }
  };
  
  // Format exchange name for display
  const formatExchangeName = () => {
    const name = exchangeSettings.exchange;
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar logo={appLogo} />
      
      <LoadingAnimationModal 
        visible={loadingVisible} 
        message={loadingMessage} 
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <TradingModeTabs 
          activeMode={activeTradingMode} 
          onChangeMode={handleTradingModeChange} 
        />
        
        {/* Exchange Connection Status */}
        {exchangeSettings.isConnected && (
          <View style={[styles.exchangeStatusContainer, { backgroundColor: colors.card }]}>
            <View style={styles.exchangeStatusHeader}>
              <View style={styles.exchangeInfo}>
                <View style={[styles.connectionDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.exchangeName, { color: colors.text }]}>
                  {formatExchangeName()} Connected
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.syncButton, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}
                onPress={() => handleSyncExchange()}
                disabled={isSyncingExchange || exchangeSettings.syncInProgress}
              >
                {isSyncingExchange || exchangeSettings.syncInProgress ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <RefreshCw size={14} color={colors.primary} />
                    <Text style={[styles.syncButtonText, { color: colors.primary }]}>Sync</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.exchangeDetails}>
              <View style={styles.exchangeDetailItem}>
                <Text style={[styles.exchangeDetailLabel, { color: colors.textSecondary }]}>Balance:</Text>
                <Text style={[styles.exchangeDetailValue, { color: colors.text }]}>
                  ${exchangeSettings.balance ? exchangeSettings.balance.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}
                </Text>
              </View>
              <View style={styles.exchangeDetailItem}>
                <Text style={[styles.exchangeDetailLabel, { color: colors.textSecondary }]}>Last synced:</Text>
                <Text style={[styles.exchangeDetailValue, { color: colors.text }]}>{formatLastSynced()}</Text>
              </View>
            </View>
          </View>
        )}
        
        <PortfolioSummary 
          portfolio={portfolio} 
          tradingMode={activeTradingMode} 
          exchangeBalance={exchangeSettings.isConnected ? exchangeSettings.balance : null}
        />
        
        {isTradingExpired && (
          <View style={[styles.expiredBanner, { backgroundColor: colors.danger }]}>
            <Text style={styles.expiredText}>
              Your 24-hour trading period has expired. Please upgrade your account to continue trading.
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.startTradingButton, 
            isTrading ? { backgroundColor: colors.danger } : { backgroundColor: colors.success },
            isProcessing ? { backgroundColor: colors.secondary, opacity: 0.8 } : null,
            isTradingExpired ? { backgroundColor: 'rgba(128, 128, 128, 0.5)', opacity: 0.8 } : null
          ]}
          onPress={handleToggleTrading}
          disabled={isProcessing || isTradingExpired}
        >
          {isTrading ? (
            <Pause size={20} color={colors.text} />
          ) : (
            <Play size={20} color={colors.text} />
          )}
          <Text style={[styles.startTradingText, { color: colors.text }]}>
            {isProcessing ? 'Processing...' : isTrading ? 'Stop Trading' : 'Start Trading'}
          </Text>
        </TouchableOpacity>
        
        {isTrading && activeStrategyId && (
          <View style={[styles.activeStrategyBanner, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}>
            <Text style={[styles.activeStrategyText, { color: colors.primary }]}>
              Trading with: {strategies.find(s => s.id === activeStrategyId)?.name || 'Selected Strategy'}
            </Text>
          </View>
        )}
        
        {openTrades.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Open Positions</Text>
            
            {openTrades.map((trade) => (
              <OpenTradeCard 
                key={trade.id} 
                trade={trade} 
                onClose={handleCloseTrade} 
                isExchangeTrade={!!trade.exchangeTradeId}
              />
            ))}
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Strategies</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={navigateToCreateStrategy}
            >
              <Plus size={16} color={colors.text} />
              <Text style={[styles.addButtonText, { color: colors.text }]}>New</Text>
            </TouchableOpacity>
          </View>
          
          {activeStrategies.length > 0 ? (
            <View style={styles.strategiesContainer}>
              {activeStrategies.map((strategy) => {
                const crypto = cryptos.find(c => c.id === strategy.cryptoId);
                if (!crypto) return null;
                
                return (
                  <TouchableOpacity 
                    key={strategy.id}
                    style={[
                      styles.strategyItem,
                      { backgroundColor: colors.card, borderLeftColor: colors.primary },
                      activeStrategyId === strategy.id && { 
                        borderColor: colors.success,
                        borderWidth: 1,
                        borderLeftWidth: 3,
                        borderLeftColor: colors.success,
                      }
                    ]}
                    onPress={() => router.push(`/strategy/${strategy.id}`)}
                  >
                    <Text style={[styles.strategyName, { color: colors.text }]}>{strategy.name}</Text>
                    <Text style={[styles.strategyCrypto, { color: colors.textSecondary }]}>{crypto.symbol}</Text>
                    {strategy.tradingMode && (
                      <View style={[styles.tradingModeTag, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}>
                        <Text style={[styles.tradingModeText, { color: colors.primary }]}>
                          {strategy.tradingMode}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No active strategies for {activeTradingMode} trading. Create one to start trading!
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Trades</Text>
          
          {recentTrades.length > 0 ? (
            <View style={[styles.tradesContainer, { backgroundColor: colors.card }]}>
              {recentTrades.map((trade) => (
                <TradeHistoryItem key={trade.id} trade={trade} />
              ))}
              
              {recentTrades.length > 0 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/strategies')}
                >
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Trades</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No trades yet. Start trading to see your trade history!
              </Text>
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  exchangeStatusContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  exchangeStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exchangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  exchangeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  exchangeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exchangeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exchangeDetailLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  exchangeDetailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  startTradingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  startTradingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeStrategyBanner: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  activeStrategyText: {
    fontWeight: '600',
  },
  expiredBanner: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  expiredText: {
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  strategiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  strategyItem: {
    borderRadius: 8,
    padding: 12,
    margin: 4,
    width: '48%',
    borderLeftWidth: 3,
  },
  strategyName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  strategyCrypto: {
    fontSize: 12,
  },
  tradingModeTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradingModeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
  },
  tradesContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewAllButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  viewAllText: {
    fontWeight: '600',
  },
});