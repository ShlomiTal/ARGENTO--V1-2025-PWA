import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { UserRole } from '@/constants/roles';

type AuthContextType = {
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  setRememberMe: (value: boolean) => void;
  rememberMe: boolean;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => {},
  isAuthenticated: false,
  isLoading: false,
  error: null,
  clearError: () => {},
  setRememberMe: () => {},
  rememberMe: false,
});

export const useAuth = () => useContext(AuthContext);

const ADMIN_ROLE: UserRole = 'admin';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();

  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    register, 
    logout, 
    clearError,
    setRememberMe,
    rememberMe
  } = useAuthStore();

  const { currentUser, role } = useUserStore();

  useEffect(() => {
    if (!segments || segments.length === 0) return;

    const firstSegment = segments[0];

    const inAuthGroup = firstSegment === "(tabs)" || 
                        firstSegment === "admin" || 
                        firstSegment === "crypto" || 
                        firstSegment === "strategy" || 
                        firstSegment === "backtest";

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && firstSegment !== 'privacy-policy') {
      router.replace('/');
    }

    if (isAuthenticated && firstSegment === 'admin' && String(role) !== ADMIN_ROLE) {
      router.replace('/');
    }
  }, [isAuthenticated, segments, router, role, currentUser]);

  const authContextValue: AuthContextType = {
    signIn: login,
    signUp: register,
    signOut: logout,
    isAuthenticated,
    isLoading,
    error,
    clearError,
    setRememberMe,
    rememberMe
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}