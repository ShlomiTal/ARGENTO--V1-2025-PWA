import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, Bell, LogOut } from 'lucide-react-native';
import { useTheme } from './ThemeProvider';
import { useAppLogoStore } from '@/store/appLogoStore';
import { useAuth } from './AuthProvider';

interface HeaderBarProps {
  title?: string;
  logo?: string | null;
  showLogout?: boolean;
}

export function HeaderBar({ title, logo, showLogout = true }: HeaderBarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { appLogo } = useAppLogoStore();
  const { logout } = useAuth();
  
  // Use provided logo or fall back to the one in the store
  const displayLogo = logo || appLogo;
  
  const handleLogout = () => {
    logout();
    // Navigation is handled by AuthProvider
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        {displayLogo ? (
          <Image 
            source={{ uri: displayLogo }} 
            style={styles.logo}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.appName, { color: colors.primary }]}>Argento</Text>
        )}
      </View>
      
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}
          onPress={() => {}}
        >
          <Bell size={20} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}
          onPress={() => router.push('/settings')}
        >
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
        
        {showLogout && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});