import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WeightLog } from '@/types';
import { calculateDailyCalories } from '@/utils/calculations';
import { getTodayDate } from '@/utils/calculations';

interface UserState {
  user: User | null;
  isOnboarded: boolean;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  completeOnboarding: () => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  resetUser: () => void;
  updateWeight: (weight: number) => void;
  updateTargetWeight: (weight: number) => void;
  updateGoal: (goal: 'bulking' | 'cutting' | 'maintaining') => void;
  updateTargetCalories: (calories: number) => void;
  updateTargetProtein: (protein: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboarded: false,
      isLoggedIn: false,
      
      setUser: (user) => set({ user, isLoggedIn: true }),
      
      completeOnboarding: () => set({ isOnboarded: true }),
      
      login: (username, password) => {
        const { user } = get();
        if (user && user.username === username && user.password === password) {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },
      
      logout: () => set({ isLoggedIn: false }),
      
      resetUser: () => set({ user: null, isOnboarded: false, isLoggedIn: false }),
      
      updateWeight: (weight) => {
        const { user } = get();
        if (!user) return;
        
        const today = getTodayDate();
        const newWeightLog: WeightLog = { date: today, weight };
        
        // Check if we already have a log for today
        const existingLogIndex = user.weightLogs.findIndex(log => log.date === today);
        
        let updatedWeightLogs = [...user.weightLogs];
        if (existingLogIndex >= 0) {
          // Update existing log
          updatedWeightLogs[existingLogIndex] = newWeightLog;
        } else {
          // Add new log
          updatedWeightLogs.push(newWeightLog);
        }
        
        set({
          user: {
            ...user,
            weight,
            weightLogs: updatedWeightLogs,
          }
        });
      },
      
      updateTargetWeight: (targetWeight) => {
        const { user } = get();
        if (!user) return;
        
        set({
          user: {
            ...user,
            targetWeight,
          }
        });
      },
      
      updateGoal: (goal) => {
        const { user } = get();
        if (!user) return;
        
        // Recalculate target calories based on new goal
        let targetCalories = calculateDailyCalories(user.age, user.weight, 'male', user.unitSystem);
        
        if (goal === 'bulking') {
          targetCalories += 500; // Surplus for bulking
        } else if (goal === 'cutting') {
          targetCalories -= 500; // Deficit for cutting
        }
        
        set({
          user: {
            ...user,
            goal,
            targetCalories,
          }
        });
      },
      
      updateTargetCalories: (targetCalories) => {
        const { user } = get();
        if (!user) return;
        
        set({
          user: {
            ...user,
            targetCalories,
          }
        });
      },
      
      updateTargetProtein: (targetProtein) => {
        const { user } = get();
        if (!user) return;
        
        set({
          user: {
            ...user,
            targetProtein,
          }
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const createUser = (
  username: string,
  password: string,
  name: string, 
  age: number, 
  weight: number, 
  targetWeight: number,
  goal: 'bulking' | 'cutting' | 'maintaining',
  unitSystem: 'metric' | 'imperial',
  gender: 'male' | 'female' = 'male'
): User => {
  // Calculate base calories
  let targetCalories = calculateDailyCalories(age, weight, gender, unitSystem);
  
  // Adjust calories based on goal
  if (goal === 'bulking') {
    targetCalories += 500; // Surplus for bulking
  } else if (goal === 'cutting') {
    targetCalories -= 500; // Deficit for cutting
  }
  // Maintaining stays at base calories
  
  // Calculate protein target
  const targetProtein = unitSystem === 'metric' 
    ? Math.round(weight * 0.8)  // 0.8g per kg
    : Math.round(weight * 0.36); // 0.36g per lb
  
  // Create initial weight log
  const today = getTodayDate();
  const initialWeightLog: WeightLog = { date: today, weight };
  
  return {
    username,
    password,
    name,
    age,
    weight,
    targetWeight,
    goal,
    targetCalories,
    targetProtein,
    unitSystem,
    weightLogs: [initialWeightLog],
  };
};