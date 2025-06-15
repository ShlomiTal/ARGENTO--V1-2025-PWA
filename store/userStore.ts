import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/constants/roles';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  tradingEndTime: number | null;
  createdAt: Date;
}

interface UserState {
  currentUser: User | null;
  users: User[];
  role: UserRole;
  setRole: (role: UserRole) => void;
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
  tradingEndTime: number | null;
  startTradingPeriod: () => void;
  canTrade: () => boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
  extendUserTradingTime: (id: string, hours: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const adminUser: User = {
  id: 'admin-1',
  username: 'Admin',
  email: 'admin@example.com',
  password: '123456',
  role: 'admin',
  isActive: true,
  tradingEndTime: null,
  createdAt: new Date(),
};

const regularUser: User = {
  id: 'user-1',
  username: 'user',
  email: 'user@example.com',
  password: 'user123',
  role: 'user',
  isActive: true,
  tradingEndTime: null,
  createdAt: new Date(),
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [adminUser, regularUser],
      role: 'user',
      setRole: (role) => set({ role }),
      onboardingCompleted: false,
      completeOnboarding: () => set({ onboardingCompleted: true }),
      tradingEndTime: null,
      startTradingPeriod: () => {
        const { currentUser, role } = get();
        if (role === 'admin' || (currentUser && currentUser.role === 'admin')) return;
        const endTime = Date.now() + 24 * 60 * 60 * 1000;
        set({ tradingEndTime: endTime });
        if (currentUser) {
          set((state) => ({
            users: state.users.map(user =>
              user.id === currentUser.id ? { ...user, tradingEndTime: endTime } : user
            ),
            currentUser: { ...currentUser, tradingEndTime: endTime }
          }));
        }
      },
      canTrade: () => {
        const { tradingEndTime, currentUser, role } = get();
        if (role === 'admin' || (currentUser && currentUser.role === 'admin')) return true;
        if (currentUser && !currentUser.isActive) return false;
        const endTime = tradingEndTime || (currentUser ? currentUser.tradingEndTime : null);
        if (!endTime) return false;
        return Date.now() < endTime;
      },
      addUser: (userData) => set((state) => {
        const newUser: User = {
          ...userData,
          id: generateId(),
          createdAt: new Date(),
        };
        return { users: [...state.users, newUser] };
      }),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(user =>
          user.id === id ? { ...user, ...updates } : user
        ),
        currentUser: state.currentUser && state.currentUser.id === id
          ? { ...state.currentUser, ...updates }
          : state.currentUser
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(user => user.id !== id)
      })),
      toggleUserActive: (id) => set((state) => ({
        users: state.users.map(user =>
          user.id === id ? { ...user, isActive: !user.isActive } : user
        ),
        currentUser: state.currentUser && state.currentUser.id === id
          ? { ...state.currentUser, isActive: !state.currentUser.isActive }
          : state.currentUser
      })),
      extendUserTradingTime: (id, hours) => set((state) => {
        const user = state.users.find(u => u.id === id);
        if (!user) return state;
        const currentEndTime = user.tradingEndTime || Date.now();
        const newEndTime = currentEndTime + (hours * 60 * 60 * 1000);
        return {
          users: state.users.map(u =>
            u.id === id ? { ...u, tradingEndTime: newEndTime } : u
          ),
          currentUser: state.currentUser && state.currentUser.id === id
            ? { ...state.currentUser, tradingEndTime: newEndTime }
            : state.currentUser
        };
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);