import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { UserRole } from '@/constants/roles';

// Define the context type
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

// Create the context with default values
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

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Admin role constant (using string-based role from constants)
const ADMIN_ROLE: UserRole = 'admin';

// Auth provider component
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

  // Handle routing based on authentication state
  useEffect(() => {
    if (!segments || segments.length === 0) return;

    const firstSegment = segments[0];
    
    const inAuthGroup = firstSegment === "(tabs)" || 
                        firstSegment === "admin" || 
                        firstSegment === "crypto" || 
                        firstSegment === "strategy" || 
                        firstSegment === "backtest";

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && firstSegment !== 'privacy-policy') {
      // Redirect to home if authenticated and not in auth group
      router.replace('/');
    }

    // Admin route protection (using string-based role comparison)
    if (isAuthenticated && firstSegment === 'admin' && role !== ADMIN_ROLE) {
      router.replace('/');
    }
  }, [isAuthenticated, segments, router, role, currentUser]);

  // Auth context value
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