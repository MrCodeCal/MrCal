import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, DailyLog } from '@/types';
import { getTodayDate } from '@/utils/calculations';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

interface FoodState {
  entries: FoodEntry[];
  dailyLogs: Record<string, DailyLog>;
  pinnedEntries: string[]; // Array of pinned entry IDs
  addEntry: (entry: Omit<FoodEntry, 'id' | 'date' | 'createdAt'>) => void;
  removeEntry: (id: string) => void;
  getTodayEntries: () => FoodEntry[];
  getTodayStats: () => { calories: number; protein: number; carbs: number; fats: number };
  togglePinEntry: (id: string) => void;
  isPinned: (id: string) => boolean;
  clearAllData: () => void;
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      dailyLogs: {},
      pinnedEntries: [],
      
      addEntry: (entryData) => {
        const today = getTodayDate();
        const newEntry: FoodEntry = {
          ...entryData,
          id: Date.now().toString(),
          date: today,
          createdAt: Date.now(),
        };
        
        // Check if user is on free plan and has reached the daily limit of 3 meals
        const { isPro } = useSubscriptionStore.getState();
        const todayEntries = get().entries.filter(entry => entry.date === today);
        
        if (!isPro && todayEntries.length >= 3) {
          // In a real app, you would show an alert or modal here
          console.warn("Free users are limited to 3 meals per day. Upgrade to Pro for unlimited tracking.");
          return;
        }
        
        set((state) => {
          const updatedEntries = [...state.entries, newEntry];
          
          // Update or create daily log
          const existingLog = state.dailyLogs[today] || {
            date: today,
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
            entries: [],
          };
          
          const updatedLog: DailyLog = {
            ...existingLog,
            totalCalories: existingLog.totalCalories + newEntry.calories,
            totalProtein: existingLog.totalProtein + newEntry.protein,
            totalCarbs: (existingLog.totalCarbs || 0) + (newEntry.carbs || 0),
            totalFats: (existingLog.totalFats || 0) + (newEntry.fats || 0),
            entries: [...existingLog.entries, newEntry],
          };
          
          return {
            entries: updatedEntries,
            dailyLogs: {
              ...state.dailyLogs,
              [today]: updatedLog,
            },
          };
        });
      },
      
      removeEntry: (id) => {
        set((state) => {
          const entryToRemove = state.entries.find(entry => entry.id === id);
          if (!entryToRemove) return state;
          
          const date = entryToRemove.date;
          const dailyLog = state.dailyLogs[date];
          
          if (!dailyLog) return state;
          
          const updatedLog: DailyLog = {
            ...dailyLog,
            totalCalories: dailyLog.totalCalories - entryToRemove.calories,
            totalProtein: dailyLog.totalProtein - entryToRemove.protein,
            totalCarbs: (dailyLog.totalCarbs || 0) - (entryToRemove.carbs || 0),
            totalFats: (dailyLog.totalFats || 0) - (entryToRemove.fats || 0),
            entries: dailyLog.entries.filter(entry => entry.id !== id),
          };
          
          return {
            entries: state.entries.filter(entry => entry.id !== id),
            dailyLogs: {
              ...state.dailyLogs,
              [date]: updatedLog,
            },
            // Also remove from pinned entries if it was pinned
            pinnedEntries: state.pinnedEntries.filter(pinnedId => pinnedId !== id)
          };
        });
      },
      
      getTodayEntries: () => {
        const today = getTodayDate();
        return get().entries.filter(entry => entry.date === today);
      },
      
      getTodayStats: () => {
        const today = getTodayDate();
        const dailyLog = get().dailyLogs[today];
        
        if (!dailyLog) {
          return { calories: 0, protein: 0, carbs: 0, fats: 0 };
        }
        
        return {
          calories: dailyLog.totalCalories,
          protein: dailyLog.totalProtein,
          carbs: dailyLog.totalCarbs || 0,
          fats: dailyLog.totalFats || 0,
        };
      },
      
      togglePinEntry: (id) => {
        // Check if user is on free plan and trying to pin
        const { isPro } = useSubscriptionStore.getState();
        const isPinned = get().pinnedEntries.includes(id);
        
        if (!isPro && !isPinned) {
          // In a real app, you would show an alert or modal here
          console.warn("Pinning meals is a Pro feature. Upgrade to Pro to pin your favorite meals.");
          return;
        }
        
        set((state) => {
          if (state.pinnedEntries.includes(id)) {
            return {
              pinnedEntries: state.pinnedEntries.filter(entryId => entryId !== id)
            };
          } else {
            return {
              pinnedEntries: [...state.pinnedEntries, id]
            };
          }
        });
      },
      
      isPinned: (id) => {
        return get().pinnedEntries.includes(id);
      },
      
      clearAllData: () => {
        set({ entries: [], dailyLogs: {}, pinnedEntries: [] });
      },
    }),
    {
      name: 'food-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);