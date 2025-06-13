import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from './userStore';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setRememberMe: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For demo purposes, we'll use the userStore to check credentials
          const { users } = useUserStore.getState();
          
          // Find user with matching username (case insensitive)
          const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase()
          );
          
          if (!user) {
            set({ isLoading: false, error: "Invalid username or password" });
            return false;
          }
          
          // Check if password matches (case sensitive)
          if (user.password !== password) {
            set({ isLoading: false, error: "Invalid username or password" });
            return false;
          }
          
          // Set the current user in userStore
          useUserStore.setState({ currentUser: user });
          
          // Set authenticated state
          set({ isAuthenticated: true, isLoading: false, error: null });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "An unknown error occurred" 
          });
          return false;
        }
      },
      
      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if username or email already exists
          const { users, addUser } = useUserStore.getState();
          
          if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            set({ isLoading: false, error: "Username already exists" });
            return false;
          }
          
          // Create new user
          const newUser = {
            username,
            password,
            role: 'user' as const,
            isActive: true,
            tradingEndTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
          };
          
          // Add user to userStore
          addUser(newUser);
          
          // Set the current user
          const { users: updatedUsers } = useUserStore.getState();
          const createdUser = updatedUsers.find(u => 
            u.username.toLowerCase() === username.toLowerCase()
          );
          
          if (createdUser) {
            useUserStore.setState({ currentUser: createdUser });
          }
          
          // Set authenticated state
          set({ isAuthenticated: true, isLoading: false, error: null });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "An unknown error occurred" 
          });
          return false;
        }
      },
      
      logout: () => {
        // Clear current user in userStore
        useUserStore.setState({ currentUser: null });
        
        // Set authenticated state to false
        set({ isAuthenticated: false });
      },
      
      clearError: () => set({ error: null }),
      
      setRememberMe: (value) => set({ rememberMe: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        // Only persist rememberMe and conditionally isAuthenticated
        const result: Partial<AuthState> = {
          rememberMe: state.rememberMe
        };
        
        // Only include isAuthenticated if rememberMe is true
        if (state.rememberMe) {
          result.isAuthenticated = state.isAuthenticated;
        }
        
        return result;
      },
    }
  )
);