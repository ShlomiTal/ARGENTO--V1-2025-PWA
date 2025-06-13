import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface AppLogoState {
  appLogo: string | null;
  setAppLogo: (logo: string | null) => void;
  clearAppLogo: () => void;
}

export const useAppLogoStore = create<AppLogoState>()(
  persist(
    (set) => ({
      appLogo: null,
      setAppLogo: (logo) => {
        // Validate the logo URL before storing it
        if (logo) {
          // For web, we might need to validate the URL differently
          if (Platform.OS === 'web') {
            // Create an image element to test if the URL is valid
            const img = new Image();
            img.src = logo;
            
            // Set up error handling
            img.onerror = () => {
              console.error('Invalid logo URL for web:', logo);
              // Don't update the store with an invalid URL
            };
            
            // Set up success handling
            img.onload = () => {
              // URL is valid, update the store
              set({ appLogo: logo });
            };
          } else {
            // For native platforms, we can store the URI directly
            // We'll validate it when we try to load it
            set({ appLogo: logo });
          }
        } else {
          // If logo is null, clear it
          set({ appLogo: null });
        }
      },
      clearAppLogo: () => set({ appLogo: null }),
    }),
    {
      name: 'app-logo-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Make sure we're only persisting the appLogo field
      partialize: (state) => ({ appLogo: state.appLogo }),
    }
  )
);