import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const { isDarkMode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  
  // Convert isDarkMode to boolean if it's a string ('1' or '0')
  const darkMode = isDarkMode === '1';  // Ensure it's a boolean

  // Reset persisted state on app start for demo purposes
  useEffect(() => {
    // This is just for demo purposes to ensure a clean state
    // In a real app, you would not reset the state on every app start
    if (!isAuthenticated) {
      useUserStore.setState({
        currentUser: null,
        role: 'user',
        onboardingCompleted: false,
        tradingEndTime: null,
      });
    }
  }, [isAuthenticated]);
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen 
            name="privacy-policy" 
            options={{ 
              title: "Privacy Policy",
              headerBackTitle: "Back"
            }} 
          />
          <Stack.Screen 
            name="admin/users" 
            options={{ 
              title: "User Management",
              headerBackTitle: "Back"
            }} 
          />
          <Stack.Screen 
            name="crypto/[id]" 
            options={{ 
              title: "Crypto Details",
              headerBackTitle: "Back"
            }} 
          />
          <Stack.Screen 
            name="strategy/create" 
            options={{ 
              title: "Create Strategy",
              headerBackTitle: "Back"
            }} 
          />
          <Stack.Screen 
            name="strategy/[id]" 
            options={{ 
              title: "Strategy Details",
              headerBackTitle: "Back"
            }} 
          />
          <Stack.Screen 
            name="backtest/[id]" 
            options={{ 
              title: "Backtest Results",
              headerBackTitle: "Back"
            }} 
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
