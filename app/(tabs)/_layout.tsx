import { Tabs } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { Home, BarChart2, Users, TrendingUp } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useAppLogoStore } from '@/store/appLogoStore';
import { useAuth } from '@/components/AuthProvider';

export default function TabLayout() {
  const { colors } = useTheme();
  const { currentUser, role } = useUserStore();
  const { appLogo } = useAppLogoStore();
  const { isAuthenticated } = useAuth();

  const isAdmin = role === 'admin' || (currentUser && currentUser.role === 'admin');

  const [tabBarIcons, setTabBarIcons] = useState({
    home: (props: { color: string, focused: boolean }) => (
      appLogo ? (
        <View style={{ 
          width: 24, 
          height: 24, 
          opacity: props.focused ? 1 : 0.5,
          borderRadius: props.focused ? 12 : 0,
          borderWidth: props.focused ? 1 : 0,
          borderColor: props.color,
          overflow: 'hidden'
        }}>
          <Image 
            source={{ uri: appLogo }} 
            style={{ width: 24, height: 24 }}
            resizeMode="cover"
          />
        </View>
      ) : (
        <Home size={24} color={props.color} />
      )
    ),
    strategies: (props: { color: string, focused: boolean }) => (
      <TrendingUp size={24} color={props.color} />
    ),
    statistics: (props: { color: string, focused: boolean }) => (
      <BarChart2 size={24} color={props.color} />
    ),
    users: (props: { color: string, focused: boolean }) => (
      <Users size={24} color={props.color} />
    ),
  });

  useEffect(() => {
    if (appLogo) {
      setTabBarIcons(prev => ({
        ...prev,
        home: (props: { color: string, focused: boolean }) => (
          <View style={{ 
            width: 24, 
            height: 24, 
            opacity: props.focused ? 1 : 0.5,
            borderRadius: props.focused ? 12 : 0,
            borderWidth: props.focused ? 1 : 0,
            borderColor: props.color,
            overflow: 'hidden'
          }}>
            <Image 
              source={{ uri: appLogo }} 
              style={{ width: 24, height: 24 }}
              resizeMode="cover"
            />
          </View>
        )
      }));
    } else {
      setTabBarIcons(prev => ({
        ...prev,
        home: (props: { color: string, focused: boolean }) => (
          <Home size={24} color={props.color} />
        )
      }));
    }
  }, [appLogo]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: (props) => tabBarIcons.home(props),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="strategies"
        options={{
          title: 'Strategies',
          tabBarIcon: (props) => tabBarIcons.strategies(props),
          headerShown: false,
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistics',
            tabBarIcon: (props) => tabBarIcons.statistics(props),
            headerShown: false,
          }}
        />
      )}
      {isAdmin && (
        <Tabs.Screen
          name="users"
          options={{
            title: 'Users',
            tabBarIcon: (props) => tabBarIcons.users(props),
            headerShown: false,
          }}
        />
      )}
    </Tabs>
  );
}