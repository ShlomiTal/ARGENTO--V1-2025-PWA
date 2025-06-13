import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView, TextInput, Modal, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Moon, DollarSign, Shield, Headphones, RefreshCw, Key, User, ExternalLink, Users, Clock, Image as ImageIcon, Trash2, BarChart2, Power } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { roles } from '@/constants/roles';
import { useBotStore } from '@/store/botStore';
import { useUserStore } from '@/store/userStore';
import { useTheme } from '@/components/ThemeProvider';
import { HeaderBar } from '@/components/HeaderBar';
import { useAppLogoStore } from '@/store/appLogoStore';

// Define types for our settings items
interface BaseSettingItem {
  icon: React.ReactNode;
  title: string;
  type: 'toggle' | 'button' | 'link';
  description?: string;
}

interface ToggleSettingItem extends BaseSettingItem {
  type: 'toggle';
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface ButtonSettingItem extends BaseSettingItem {
  type: 'button';
  onPress: () => void;
}

interface LinkSettingItem extends BaseSettingItem {
  type: 'link';
  onPress: () => void;
}

type SettingItem = ToggleSettingItem | ButtonSettingItem | LinkSettingItem;

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoTrade, setAutoTrade] = useState(false);
  const { portfolio, exchangeSettings, updateExchangeSettings, resetPortfolio, deletePortfolio, disconnectExchange, syncExchangeData } = useBotStore();
  const { role, setRole, currentUser, users, toggleUserActive, extendUserTradingTime, canTrade } = useUserStore();
  
  const [selectedExchange, setSelectedExchange] = useState(exchangeSettings.exchange || 'binance');
  const [apiKey, setApiKey] = useState(exchangeSettings.apiKey || "");
  const [apiSecret, setApiSecret] = useState(exchangeSettings.apiSecret || "");
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [connectionStatusText, setConnectionStatusText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { appLogo, setAppLogo } = useAppLogoStore();
  
  const exchanges = [
    { label: 'Binance', value: 'binance' },
    { label: 'MEXC', value: 'mexc' },
    { label: 'OKX', value: 'okx' },
    { label: 'Bybit', value: 'bybit' },
  ];
  
  // Initialize API fields from stored settings
  useEffect(() => {
    setApiKey(exchangeSettings.apiKey || "");
    setApiSecret(exchangeSettings.apiSecret || "");
    setSelectedExchange(exchangeSettings.exchange || 'binance');
  }, [exchangeSettings]);
  
  // Monitor exchange sync status
  useEffect(() => {
    if (exchangeSettings.syncInProgress) {
      setIsSyncing(true);
    } else {
      setIsSyncing(false);
    }
  }, [exchangeSettings.syncInProgress]);
  
  // Format the last connection time
  const formatLastConnected = () => {
    if (!exchangeSettings.lastConnected) return "Never connected";
    
    const date = new Date(exchangeSettings.lastConnected);
    return date.toLocaleString();
  };
  
  // Format the last synced time
  const formatLastSynced = () => {
    if (!exchangeSettings.lastSynced) return "Never synced";
    
    const date = new Date(exchangeSettings.lastSynced);
    return date.toLocaleString();
  };
  
  const saveExchangeSettings = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      Alert.alert('Error', 'API Key and Secret are required');
      return;
    }
    
    // Simulate API connection test
    setConnectionStatusText(`Connecting to ${selectedExchange.toUpperCase()}...`);
    setShowConnectionStatus(true);
    
    try {
      // Update exchange settings first
      updateExchangeSettings({
        exchange: selectedExchange,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
        isConnected: true,
        lastConnected: Date.now()
      });
      
      // Try to sync data from the exchange
      setIsSyncing(true);
      const syncSuccess = await syncExchangeData();
      
      if (syncSuccess) {
        setConnectionSuccess(true);
        setConnectionStatusText(`Successfully connected to ${selectedExchange.toUpperCase()} and synced account data.`);
      } else {
        // Connection was successful but sync failed
        setConnectionSuccess(true);
        setConnectionStatusText(`Connected to ${selectedExchange.toUpperCase()} but failed to sync account data. You can try syncing manually later.`);
      }
    } catch (error) {
      console.error("Error connecting to exchange:", error);
      setConnectionSuccess(false);
      setConnectionStatusText("Failed to connect. Please check your credentials and try again.");
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleSyncExchange = async () => {
    if (!exchangeSettings.isConnected) {
      Alert.alert("Not Connected", "Please connect to an exchange first.");
      return;
    }
    
    setIsSyncing(true);
    setConnectionStatusText(`Syncing data from ${exchangeSettings.exchange.toUpperCase()}...`);
    setShowConnectionStatus(true);
    
    try {
      const success = await syncExchangeData();
      
      if (success) {
        setConnectionSuccess(true);
        setConnectionStatusText(`Successfully synced data from ${exchangeSettings.exchange.toUpperCase()}.`);
      } else {
        setConnectionSuccess(false);
        setConnectionStatusText(`Failed to sync data from ${exchangeSettings.exchange.toUpperCase()}. ${exchangeSettings.connectionError || "Please check your connection and try again."}`);
      }
    } catch (error) {
      console.error("Error syncing exchange data:", error);
      setConnectionSuccess(false);
      setConnectionStatusText("An error occurred while syncing data.");
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleDisconnectExchange = () => {
    Alert.alert(
      "Disconnect Exchange",
      `Are you sure you want to disconnect from ${exchangeSettings.exchange.toUpperCase()}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            disconnectExchange();
            Alert.alert("Disconnected", `You have been disconnected from ${exchangeSettings.exchange.toUpperCase()}.`);
          }
        }
      ]
    );
  };
  
  const handleResetPortfolio = () => {
    Alert.alert(
      "Reset Portfolio",
      "Are you sure you want to reset your portfolio? This will clear all your assets and trades, and reset your balance to $10,000.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetPortfolio();
            Alert.alert("Portfolio Reset", "Your portfolio has been reset to the initial state.");
          }
        }
      ]
    );
  };
  
  const handleDeletePortfolio = () => {
    setShowDeleteConfirmation(true);
  };
  
  const confirmDeletePortfolio = () => {
    deletePortfolio();
    setShowDeleteConfirmation(false);
    Alert.alert("Portfolio Deleted", "Your portfolio history has been cleared while maintaining your current balance.");
  };
  
  const openPrivacyPolicy = () => {
    router.push('/privacy-policy');
  };
  
  const openHelpSupport = () => {
    Alert.alert(
      "Help & Support",
      "For assistance with using the app, please contact our support team at support@cryptobot.com",
      [{ text: "OK" }]
    );
  };
  
  const openUserManagement = () => {
    setShowUserManagement(true);
  };
  
  const openBacktest = () => {
    router.push('/backtest');
  };
  
  const handleToggleUserActive = (userId: string) => {
    toggleUserActive(userId);
  };
  
  const handleExtendUserTime = (userId: string) => {
    Alert.alert(
      "Extend Trading Time",
      "How many hours would you like to add?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "24 Hours",
          onPress: () => extendUserTradingTime(userId, 24)
        },
        {
          text: "48 Hours",
          onPress: () => extendUserTradingTime(userId, 48)
        },
        {
          text: "7 Days",
          onPress: () => extendUserTradingTime(userId, 168)
        }
      ]
    );
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAppLogo(result.assets[0].uri);
        Alert.alert("Success", "App logo updated successfully. The new logo will be used throughout the app.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to update app logo. Please try again.");
    }
  };
  
  const settingsSections: SettingSection[] = [
    {
      title: "App Settings",
      items: [
        {
          icon: <Bell size={22} color={colors.text} />,
          title: "Notifications",
          type: "toggle",
          value: notifications,
          onValueChange: setNotifications,
          description: "Receive alerts for trades and price movements",
        },
        {
          icon: <Moon size={22} color={colors.text} />,
          title: "Dark Mode",
          type: "toggle",
          value: isDarkMode,
          onValueChange: toggleTheme,
          description: "Use dark theme throughout the app",
        },
        {
          icon: <ImageIcon size={22} color={colors.text} />,
          title: "Change App Logo",
          type: "button",
          description: "Customize the app logo",
          onPress: pickImage,
        },
      ],
    },
    {
      title: "Trading Settings",
      items: [
        {
          icon: <DollarSign size={22} color={colors.text} />,
          title: "Auto Trading",
          description: "Allow strategies to execute trades automatically",
          type: "toggle",
          value: autoTrade,
          onValueChange: setAutoTrade,
        },
        {
          icon: <BarChart2 size={22} color={colors.text} />,
          title: "Backtest",
          description: "Test your strategies against historical data",
          type: "button",
          onPress: openBacktest,
        },
        {
          icon: <RefreshCw size={22} color={colors.text} />,
          title: "Reset Portfolio",
          description: "Reset your portfolio to the initial state",
          type: "button",
          onPress: handleResetPortfolio,
        },
        {
          icon: <Trash2 size={22} color={colors.text} />,
          title: "Delete Portfolio History",
          description: "Clear all trades and assets but keep your balance",
          type: "button",
          onPress: handleDeletePortfolio,
        },
      ],
    },
  ];
  
  // Add admin-only section
  if (role === 'admin' || (currentUser && currentUser.role === 'admin')) {
    settingsSections.push({
      title: "Admin Controls",
      items: [
        {
          icon: <Users size={22} color={colors.text} />,
          title: "User Management",
          description: "Manage user accounts and permissions",
          type: "button",
          onPress: openUserManagement,
        },
      ],
    });
  }
  
  settingsSections.push({
    title: "About",
    items: [
      {
        icon: <Shield size={22} color={colors.text} />,
        title: "Privacy Policy",
        type: "link",
        description: "Read our privacy policy",
        onPress: openPrivacyPolicy,
      },
      {
        icon: <Headphones size={22} color={colors.text} />,
        title: "Help & Support",
        type: "link",
        description: "Get help with using the app",
        onPress: openHelpSupport,
      },
    ],
  });
  
  // Safely get the balance with a fallback to 0
  const spotBalance = portfolio?.spot?.balance || 0;
  
  // Format trading time remaining
  const formatTimeRemaining = (endTime: number | null) => {
    if (!endTime) return "No active subscription";
    
    const now = Date.now();
    if (now > endTime) return "Expired";
    
    const timeLeft = endTime - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar logo={appLogo} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>
        
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>
            ${spotBalance.toLocaleString()}
          </Text>
          
          {role === 'user' && (
            <View style={styles.subscriptionInfo}>
              <Clock size={16} color="#FFFFFF" />
              <Text style={styles.subscriptionText}>
                {formatTimeRemaining(currentUser?.tradingEndTime || null)}
              </Text>
            </View>
          )}
        </View>
        
        {appLogo && (
          <View style={styles.logoPreviewContainer}>
            <Text style={[styles.logoPreviewTitle, { color: colors.text }]}>Current App Logo</Text>
            <Image source={{ uri: appLogo }} style={styles.logoPreview} />
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>User Role</Text>
          <View style={[styles.roleContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>Current role: {currentUser?.role || role}</Text>
            
            <View style={styles.roleDescription}>
              <User size={20} color={colors.primary} />
              <Text style={[styles.roleDescriptionText, { color: colors.textSecondary }]}>
                {roles.find(r => r.id === (currentUser?.role || role))?.description}
              </Text>
            </View>
            
            <Text style={[styles.featuresTitle, { color: colors.text }]}>Features:</Text>
            <View style={styles.featuresList}>
              {roles.find(r => r.id === (currentUser?.role || role))?.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Exchange API</Text>
          <View style={[styles.exchangeContainer, { backgroundColor: colors.card }]}>
            {exchangeSettings.isConnected && (
              <View style={styles.connectionStatusContainer}>
                <View style={[styles.connectionStatusIndicator, { backgroundColor: colors.success }]} />
                <Text style={[styles.connectionStatusText, { color: colors.success }]}>
                  Connected to {selectedExchange.charAt(0).toUpperCase() + selectedExchange.slice(1)}
                </Text>
                <Text style={[styles.connectionTimestamp, { color: colors.textSecondary }]}>
                  Last connected: {formatLastConnected()}
                </Text>
                {exchangeSettings.lastSynced && (
                  <Text style={[styles.connectionTimestamp, { color: colors.textSecondary }]}>
                    Last synced: {formatLastSynced()}
                  </Text>
                )}
                {exchangeSettings.balance !== undefined && exchangeSettings.balance !== null && (
                  <Text style={[styles.connectionBalance, { color: colors.text }]}>
                    Exchange Balance: ${exchangeSettings.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </Text>
                )}
                <View style={styles.connectionButtons}>
                  <TouchableOpacity 
                    style={[styles.syncButton, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}
                    onPress={handleSyncExchange}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <RefreshCw size={16} color={colors.primary} />
                        <Text style={[styles.syncButtonText, { color: colors.primary }]}>Sync Data</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.disconnectButton, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}
                    onPress={handleDisconnectExchange}
                  >
                    <Power size={16} color={colors.danger} />
                    <Text style={[styles.disconnectButtonText, { color: colors.danger }]}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {!exchangeSettings.isConnected && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Exchange</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedExchange}
                    onValueChange={(value) => setSelectedExchange(value)}
                    style={[styles.picker, { color: colors.text }]}
                    dropdownIconColor={colors.text}
                    enabled={!exchangeSettings.isConnected}
                  >
                    {exchanges.map((exchange) => (
                      <Picker.Item
                        key={exchange.value}
                        label={exchange.label}
                        value={exchange.value}
                        color={colors.text}
                      />
                    ))}
                  </Picker>
                </View>
                
                <Text style={[styles.label, { color: colors.text }]}>API Key</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: colors.text, 
                      backgroundColor: 'rgba(128, 128, 128, 0.1)',
                      opacity: exchangeSettings.isConnected ? 0.7 : 1
                    }
                  ]}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Enter your API key"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={false}
                  editable={!exchangeSettings.isConnected}
                />
                
                <Text style={[styles.label, { color: colors.text }]}>API Secret</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: colors.text, 
                      backgroundColor: 'rgba(128, 128, 128, 0.1)',
                      opacity: exchangeSettings.isConnected ? 0.7 : 1
                    }
                  ]}
                  value={apiSecret}
                  onChangeText={setApiSecret}
                  placeholder="Enter your API secret"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={true}
                  editable={!exchangeSettings.isConnected}
                />
                
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={saveExchangeSettings}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Connect to {selectedExchange.charAt(0).toUpperCase() + selectedExchange.slice(1)}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
            
            <View style={styles.apiInfoContainer}>
              <Text style={[styles.apiInfoText, { color: colors.textSecondary }]}>
                Connect your exchange API to enable live trading. Your API keys are stored securely on your device.
              </Text>
              <TouchableOpacity style={styles.apiLearnMore}>
                <Text style={[styles.apiLearnMoreText, { color: colors.primary }]}>Learn more</Text>
                <ExternalLink size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item, itemIndex) => (
                <View 
                  key={itemIndex} 
                  style={[
                    styles.settingItem,
                    { borderBottomColor: 'rgba(128, 128, 128, 0.2)' },
                    itemIndex === section.items.length - 1 && styles.lastItem,
                  ]}
                >
                  <View style={styles.settingInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}>{item.icon}</View>
                    <View>
                      <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                      {item.description && (
                        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                  
                  {item.type === 'toggle' && (
                    <Switch
                      value={(item as ToggleSettingItem).value}
                      onValueChange={(item as ToggleSettingItem).onValueChange}
                      trackColor={{ false: '#767577', true: colors.primary }}
                      thumbColor={(item as ToggleSettingItem).value ? '#f4f3f4' : '#f4f3f4'}
                    />
                  )}
                  
                  {item.type === 'button' && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        { 
                          backgroundColor: item.title.includes('Delete') || item.title === 'Reset Portfolio' 
                            ? colors.danger 
                            : colors.primary 
                        }
                      ]}
                      onPress={(item as ButtonSettingItem).onPress}
                    >
                      <Text style={styles.actionButtonText}>
                        {item.title.includes('Delete') ? 'Delete' : 
                         item.title === 'Reset Portfolio' ? 'Reset' : 'Open'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {item.type === 'link' && (
                    <TouchableOpacity onPress={(item as LinkSettingItem).onPress}>
                      <Text style={[styles.linkText, { color: colors.textSecondary }]}>{'>'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Crypto Trading Bot v1.0.0</Text>
        </View>
        
        {/* User Management Modal */}
        <Modal
          visible={showUserManagement}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowUserManagement(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>User Management</Text>
              
              <ScrollView style={styles.userList}>
                {users.map(user => (
                  <View key={user.id} style={[styles.userItem, { borderBottomColor: 'rgba(128, 128, 128, 0.2)' }]}>
                    <View style={styles.userInfo}>
                      <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
                      <View style={[
                        styles.roleTag, 
                        { 
                          backgroundColor: user.role === 'admin' 
                            ? 'rgba(108, 92, 231, 0.2)' 
                            : 'rgba(0, 184, 148, 0.2)' 
                        }
                      ]}>
                        <Text style={[
                          styles.roleTagText, 
                          { 
                            color: user.role === 'admin' 
                              ? colors.primary 
                              : colors.success 
                          }
                        ]}>
                          {user.role}
                        </Text>
                      </View>
                      <Text style={[styles.userStatus, { color: colors.textSecondary }]}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Text>
                      {user.role === 'user' && user.tradingEndTime && (
                        <Text style={[styles.userTime, { color: colors.textSecondary }]}>
                          {formatTimeRemaining(user.tradingEndTime)}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.userActions}>
                      {user.role === 'user' && (
                        <>
                          <TouchableOpacity 
                            style={[
                              styles.userActionButton, 
                              { 
                                backgroundColor: user.isActive 
                                  ? 'rgba(255, 107, 107, 0.2)' 
                                  : 'rgba(0, 184, 148, 0.2)' 
                              }
                            ]}
                            onPress={() => handleToggleUserActive(user.id)}
                          >
                            <Text style={[
                              styles.userActionText, 
                              { 
                                color: user.isActive 
                                  ? colors.danger 
                                  : colors.success 
                              }
                            ]}>
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.userActionButton, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}
                            onPress={() => handleExtendUserTime(user.id)}
                          >
                            <Text style={[styles.userActionText, { color: colors.primary }]}>
                              Extend Time
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
              
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowUserManagement(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Delete Portfolio Confirmation Modal */}
        <Modal
          visible={showDeleteConfirmation}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDeleteConfirmation(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, padding: 20 }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Portfolio History</Text>
              
              <Text style={[styles.confirmationText, { color: colors.text }]}>
                Are you sure you want to delete your portfolio history? This will:
              </Text>
              
              <View style={styles.confirmationList}>
                <View style={styles.confirmationItem}>
                  <View style={[styles.confirmationBullet, { backgroundColor: colors.danger }]} />
                  <Text style={[styles.confirmationItemText, { color: colors.text }]}>
                    Clear all your trade history
                  </Text>
                </View>
                <View style={styles.confirmationItem}>
                  <View style={[styles.confirmationBullet, { backgroundColor: colors.danger }]} />
                  <Text style={[styles.confirmationItemText, { color: colors.text }]}>
                    Remove all your assets
                  </Text>
                </View>
                <View style={styles.confirmationItem}>
                  <View style={[styles.confirmationBullet, { backgroundColor: colors.success }]} />
                  <Text style={[styles.confirmationItemText, { color: colors.text }]}>
                    Keep your current balance
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.confirmationWarning, { color: colors.danger }]}>
                This action cannot be undone!
              </Text>
              
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[styles.confirmationButton, { backgroundColor: 'rgba(128, 128, 128, 0.2)' }]}
                  onPress={() => setShowDeleteConfirmation(false)}
                >
                  <Text style={[styles.confirmationButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.confirmationButton, { backgroundColor: colors.danger }]}
                  onPress={confirmDeletePortfolio}
                >
                  <Text style={[styles.confirmationButtonText, { color: '#FFFFFF' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* API Connection Status Modal */}
        <Modal
          visible={showConnectionStatus}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowConnectionStatus(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.statusModalContent, { 
              backgroundColor: colors.card,
              borderLeftWidth: 4,
              borderLeftColor: isSyncing 
                ? colors.primary 
                : connectionSuccess 
                  ? colors.success 
                  : colors.danger
            }]}>
              <Text style={[styles.statusTitle, { 
                color: isSyncing 
                  ? colors.primary 
                  : connectionSuccess 
                    ? colors.success 
                    : colors.danger 
              }]}>
                {isSyncing 
                  ? 'Connecting...' 
                  : connectionSuccess 
                    ? 'Connection Successful' 
                    : 'Connection Failed'}
              </Text>
              
              <Text style={[styles.statusMessage, { color: colors.text }]}>
                {connectionStatusText}
              </Text>
              
              {!isSyncing && (
                <TouchableOpacity
                  style={[styles.statusButton, { 
                    backgroundColor: connectionSuccess ? colors.success : colors.danger 
                  }]}
                  onPress={() => setShowConnectionStatus(false)}
                >
                  <Text style={styles.statusButtonText}>
                    {connectionSuccess ? 'Continue' : 'Try Again'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
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
  balanceCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  subscriptionText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 12,
  },
  logoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPreviewTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  sectionContent: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: '90%',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 18,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  exchangeContainer: {
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
  },
  connectionStatusContainer: {
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'column',
  },
  connectionStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    position: 'absolute',
    top: 14,
    left: 12,
  },
  connectionStatusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20,
  },
  connectionTimestamp: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 20,
  },
  connectionBalance: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 20,
  },
  connectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  roleContainer: {
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  roleDescription: {
    flexDirection: 'row',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  roleDescriptionText: {
    marginLeft: 12,
    flex: 1,
  },
  featuresTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  featuresList: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  featureText: {
  },
  apiInfoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
  },
  apiInfoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  apiLearnMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  apiLearnMoreText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  userList: {
    marginBottom: 20,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  userInfo: {
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  userStatus: {
    fontSize: 12,
  },
  userTime: {
    fontSize: 12,
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  userActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalCloseButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationList: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  confirmationItemText: {
    fontSize: 15,
  },
  confirmationWarning: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmationButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  confirmationButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  statusModalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  statusButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});