export const calculateDailyCalories = (
  age: number, 
  weight: number, 
  gender: 'male' | 'female' = 'male',
  unitSystem: 'metric' | 'imperial' = 'metric'
): number => {
  // Convert weight to kg if using imperial
  const weightInKg = unitSystem === 'imperial' ? weight * 0.453592 : weight;
  
  // Basic BMR calculation using Mifflin-St Jeor Equation
  // For men: BMR = 10W + 6.25H - 5A + 5
  // For women: BMR = 10W + 6.25H - 5A - 161
  // Where W is weight in kg, H is height in cm, A is age in years
  
  // Since we don't have height, we'll use a simplified approach
  // and assume average height based on weight
  const estimatedHeight = gender === 'male' ? 175 : 163; // cm
  
  const bmr = gender === 'male'
    ? 10 * weightInKg + 6.25 * estimatedHeight - 5 * age + 5
    : 10 * weightInKg + 6.25 * estimatedHeight - 5 * age - 161;
  
  // Multiply by activity factor (assuming moderate activity)
  return Math.round(bmr * 1.55);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(progress, 100); // Cap at 100%
};

export const convertWeight = (weight: number, fromUnit: 'metric' | 'imperial', toUnit: 'metric' | 'imperial'): number => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    // kg to lb
    return Math.round(weight * 2.20462 * 10) / 10;
  } else {
    // lb to kg
    return Math.round(weight * 0.453592 * 10) / 10;
  }
};

export const getWeightUnit = (unitSystem: 'metric' | 'imperial'): string => {
  return unitSystem === 'metric' ? 'kg' : 'lb';
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getLastNDays = (n: number): string[] => {
  const result: string[] = [];
  const today = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    result.push(formatDate(date));
  }
  
  return result;
};