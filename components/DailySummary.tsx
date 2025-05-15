import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import ProgressBar from './ProgressBar';
import { useUserStore } from '@/stores/userStore';
import { useFoodStore } from '@/stores/foodStore';
import { getWeightUnit } from '@/utils/calculations';

export default function DailySummary() {
  const user = useUserStore(state => state.user);
  
  // Use a stable reference to the getTodayStats function
  const getTodayStats = useFoodStore(state => state.getTodayStats);
  
  // Memoize the stats to prevent recalculation on every render
  const stats = useMemo(() => getTodayStats(), [getTodayStats]);
  
  if (!user) return null;
  
  // Estimate protein target (0.8g per kg of body weight or 0.36g per lb)
  const proteinTarget = user.targetProtein || (user.unitSystem === 'metric' 
    ? Math.round(user.weight * 0.8)
    : Math.round(user.weight * 0.36));
  
  // Get goal-specific text
  const getGoalText = () => {
    const weightUnit = getWeightUnit(user.unitSystem);
    
    switch (user.goal) {
      case 'bulking':
        return `Bulking: ${user.weight}${weightUnit} → ${user.targetWeight}${weightUnit}`;
      case 'cutting':
        return `Cutting: ${user.weight}${weightUnit} → ${user.targetWeight}${weightUnit}`;
      case 'maintaining':
        return `Maintaining: ${user.weight}${weightUnit}`;
      default:
        return '';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Summary</Text>
        <Text style={styles.goalText}>{getGoalText()}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.calories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.protein}g</Text>
          <Text style={styles.statLabel}>Protein</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar
          current={stats.calories}
          target={user.targetCalories}
          label="Calories"
          color={colors.primary}
        />
        
        <ProgressBar
          current={stats.protein}
          target={proteinTarget}
          label="Protein"
          color={colors.proteinColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  goalText: {
    fontSize: 12,
    color: colors.lightText,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.lightText,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
  progressContainer: {
    marginTop: 8,
  },
});