import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SubscriptionState {
  isPro: boolean;
  subscriptionDate: string | null;
  setProStatus: (status: boolean) => void;
  cancelSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      isPro: false,
      subscriptionDate: null,
      
      setProStatus: (status) => set(() => {
        const date = status ? new Date().toISOString() : null;
        return {
          isPro: status,
          subscriptionDate: date,
        };
      }),
      
      cancelSubscription: () => set({
        isPro: false,
        subscriptionDate: null,
      }),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);