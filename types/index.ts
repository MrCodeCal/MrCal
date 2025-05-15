export interface User {
  username: string;
  password: string; // In a real app, this would be hashed
  name: string;
  age: number;
  weight: number;
  targetWeight: number;
  goal: 'bulking' | 'cutting' | 'maintaining';
  targetCalories: number;
  targetProtein?: number; // Optional explicit protein target
  unitSystem: 'metric' | 'imperial';
  weightLogs: WeightLog[];
}

export interface WeightLog {
  date: string;
  weight: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  ingredients?: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  date: string;
  imageUri?: string;
  createdAt: number;
}

export interface DailyLog {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs?: number;
  totalFats?: number;
  entries: FoodEntry[];
}