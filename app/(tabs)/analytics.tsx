import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { useUserStore } from '@/stores/userStore';
import { useFoodStore } from '@/stores/foodStore';
import colors from '@/constants/colors';
import { getLastNDays, formatDateForDisplay, getWeightUnit } from '@/utils/calculations';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40; // Accounting for padding

export default function AnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useUserStore(state => state.user);
  const dailyLogs = useFoodStore(state => state.dailyLogs);
  
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('7days');
  const [nutritionTimeRange, setNutritionTimeRange] = useState<'7days' | '14days' | '30days'>('7days');
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  if (!user) return null;
  
  const weightUnit = getWeightUnit(user.unitSystem);
  
  // Get dates for the selected time range
  const getDatesForRange = () => {
    switch (timeRange) {
      case '7days':
        return getLastNDays(7);
      case '30days':
        return getLastNDays(30);
      case '90days':
        return getLastNDays(90);
      case 'all':
        return user.weightLogs.map(log => log.date).sort();
      default:
        return getLastNDays(7);
    }
  };
  
  // Get nutrition dates for the selected time range
  const getNutritionDatesForRange = () => {
    switch (nutritionTimeRange) {
      case '7days':
        return getLastNDays(7);
      case '14days':
        return getLastNDays(14);
      case '30days':
        return getLastNDays(30);
      default:
        return getLastNDays(7);
    }
  };
  
  // Filter weight logs based on selected time range
  const filteredWeightLogs = useMemo(() => {
    const dates = getDatesForRange();
    const dateSet = new Set(dates);
    
    return user.weightLogs
      .filter(log => dateSet.has(log.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [user.weightLogs, timeRange]);
  
  // Calculate weight progress
  const weightProgress = useMemo(() => {
    if (filteredWeightLogs.length < 2) return 0;
    
    const firstWeight = filteredWeightLogs[0].weight;
    const lastWeight = filteredWeightLogs[filteredWeightLogs.length - 1].weight;
    
    // For cutting, losing weight is progress
    if (user.goal === 'cutting') {
      return ((firstWeight - lastWeight) / (firstWeight - user.targetWeight)) * 100;
    }
    // For bulking, gaining weight is progress
    else if (user.goal === 'bulking') {
      return ((lastWeight - firstWeight) / (user.targetWeight - firstWeight)) * 100;
    }
    // For maintaining, being close to target is progress
    else {
      const deviation = Math.abs(lastWeight - user.targetWeight);
      const maxDeviation = Math.abs(firstWeight - user.targetWeight);
      return ((maxDeviation - deviation) / maxDeviation) * 100;
    }
  }, [filteredWeightLogs, user.goal, user.targetWeight]);
  
  // Get nutrition data for the selected time range
  const nutritionData = useMemo(() => {
    const dates = getNutritionDatesForRange();
    
    return dates.map(date => {
      const log = dailyLogs[date];
      return {
        date,
        calories: log?.totalCalories || 0,
        protein: log?.totalProtein || 0,
        carbs: log?.totalCarbs || 0,
        fats: log?.totalFats || 0,
      };
    });
  }, [dailyLogs, nutritionTimeRange]);
  
  // Calculate nutrition averages
  const nutritionAverages = useMemo(() => {
    if (nutritionData.length === 0) return { calories: 0, protein: 0 };
    
    const totalCalories = nutritionData.reduce((sum, day) => sum + day.calories, 0);
    const totalProtein = nutritionData.reduce((sum, day) => sum + day.protein, 0);
    
    return {
      calories: Math.round(totalCalories / nutritionData.length),
      protein: Math.round(totalProtein / nutritionData.length),
    };
  }, [nutritionData]);
  
  // Find max values for scaling charts
  const maxCalories = useMemo(() => {
    return Math.max(
      user.targetCalories,
      ...nutritionData.map(day => day.calories),
      1000 // Minimum scale
    );
  }, [nutritionData, user.targetCalories]);
  
  const maxWeight = useMemo(() => {
    if (filteredWeightLogs.length === 0) return user.weight + 10;
    return Math.max(...filteredWeightLogs.map(log => log.weight), user.weight, user.targetWeight) + 5;
  }, [filteredWeightLogs, user.weight, user.targetWeight]);
  
  const minWeight = useMemo(() => {
    if (filteredWeightLogs.length === 0) return Math.max(0, user.weight - 10);
    return Math.max(0, Math.min(...filteredWeightLogs.map(log => log.weight), user.weight, user.targetWeight) - 5);
  }, [filteredWeightLogs, user.weight, user.targetWeight]);
  
  // Calculate chart dimensions
  const chartHeight = 200;
  const barWidth = Math.min(30, (chartWidth / nutritionData.length) - 10);
  
  // Calculate weight chart dimensions
  const weightChartHeight = 200;
  const pointRadius = 6;
  const weightRange = maxWeight - minWeight;
  
  // Helper function to get Y position for weight
  const getWeightY = (weight: number) => {
    return weightChartHeight - ((weight - minWeight) / weightRange) * weightChartHeight;
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Progress</Text>
          
          <View style={styles.timeRangeSelector}>
            <TouchableOpacity
              style={[styles.timeRangeButton, timeRange === '7days' && styles.activeTimeRange]}
              onPress={() => setTimeRange('7days')}
            >
              <Text style={[styles.timeRangeText, timeRange === '7days' && styles.activeTimeRangeText]}>
                7 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeRangeButton, timeRange === '30days' && styles.activeTimeRange]}
              onPress={() => setTimeRange('30days')}
            >
              <Text style={[styles.timeRangeText, timeRange === '30days' && styles.activeTimeRangeText]}>
                30 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeRangeButton, timeRange === '90days' && styles.activeTimeRange]}
              onPress={() => setTimeRange('90days')}
            >
              <Text style={[styles.timeRangeText, timeRange === '90days' && styles.activeTimeRangeText]}>
                90 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeRangeButton, timeRange === 'all' && styles.activeTimeRange]}
              onPress={() => setTimeRange('all')}
            >
              <Text style={[styles.timeRangeText, timeRange === 'all' && styles.activeTimeRangeText]}>
                All Time
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.goalProgressContainer}>
            <View style={styles.goalProgressHeader}>
              <Text style={styles.goalProgressTitle}>Goal Progress</Text>
              <Text style={styles.goalProgressPercent}>{Math.round(Math.max(0, Math.min(100, weightProgress)))}%</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(100, weightProgress))}%` }]} />
            </View>
            
            <View style={styles.weightGoalText}>
              <Text style={styles.currentWeightText}>
                Current: {user.weight}{weightUnit}
              </Text>
              <Text style={styles.targetWeightText}>
                Target: {user.targetWeight}{weightUnit}
              </Text>
            </View>
          </View>
          
          {filteredWeightLogs.length > 1 ? (
            <View style={styles.weightChartContainer}>
              <View style={styles.weightChart}>
                {/* Y-axis labels */}
                <View style={styles.weightYAxis}>
                  <Text style={styles.weightYLabel}>{maxWeight}{weightUnit}</Text>
                  <Text style={styles.weightYLabel}>{Math.round((maxWeight + minWeight) / 2)}{weightUnit}</Text>
                  <Text style={styles.weightYLabel}>{minWeight}{weightUnit}</Text>
                </View>
                
                {/* Chart area */}
                <View style={styles.weightChartArea}>
                  {/* Target weight line */}
                  <View 
                    style={[
                      styles.targetWeightLine, 
                      { top: getWeightY(user.targetWeight) }
                    ]} 
                  />
                  
                  {/* Weight points and lines */}
                  {filteredWeightLogs.map((log, index) => {
                    const x = (index / (filteredWeightLogs.length - 1)) * (chartWidth - 40);
                    const y = getWeightY(log.weight);
                    
                    // Draw line to next point
                    const nextLine = index < filteredWeightLogs.length - 1 ? (
                      <View
                        key={`line-${log.date}`}
                        style={[
                          styles.weightLine,
                          {
                            left: x + pointRadius,
                            top: y + pointRadius / 2,
                            width: (chartWidth - 40) / (filteredWeightLogs.length - 1),
                            transform: [
                              { 
                                rotate: `${Math.atan2(
                                  getWeightY(filteredWeightLogs[index + 1].weight) - y,
                                  (chartWidth - 40) / (filteredWeightLogs.length - 1)
                                ) * (180 / Math.PI)}deg` 
                              }
                            ]
                          }
                        ]}
                      />
                    ) : null;
                    
                    return (
                      <React.Fragment key={log.date}>
                        {nextLine}
                        <View
                          style={[
                            styles.weightPoint,
                            { left: x, top: y }
                          ]}
                        />
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
              
              {/* X-axis labels */}
              <View style={styles.weightXAxis}>
                {filteredWeightLogs.length > 7 
                  ? [0, Math.floor(filteredWeightLogs.length / 2), filteredWeightLogs.length - 1].map(index => (
                      <Text key={index} style={styles.weightXLabel}>
                        {formatDateForDisplay(filteredWeightLogs[index].date)}
                      </Text>
                    ))
                  : filteredWeightLogs.map((log, index) => (
                      <Text key={index} style={styles.weightXLabel}>
                        {formatDateForDisplay(log.date)}
                      </Text>
                    ))
                }
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Not enough weight data to show chart.
                Log your weight regularly to track progress.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Trends</Text>
          
          <View style={styles.timeRangeSelector}>
            <TouchableOpacity
              style={[styles.timeRangeButton, nutritionTimeRange === '7days' && styles.activeTimeRange]}
              onPress={() => setNutritionTimeRange('7days')}
            >
              <Text style={[styles.timeRangeText, nutritionTimeRange === '7days' && styles.activeTimeRangeText]}>
                7 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeRangeButton, nutritionTimeRange === '14days' && styles.activeTimeRange]}
              onPress={() => setNutritionTimeRange('14days')}
            >
              <Text style={[styles.timeRangeText, nutritionTimeRange === '14days' && styles.activeTimeRangeText]}>
                14 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeRangeButton, nutritionTimeRange === '30days' && styles.activeTimeRange]}
              onPress={() => setNutritionTimeRange('30days')}
            >
              <Text style={[styles.timeRangeText, nutritionTimeRange === '30days' && styles.activeTimeRangeText]}>
                30 Days
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.nutritionSummary}>
            <View style={styles.nutritionSummaryItem}>
              <Text style={styles.nutritionSummaryValue}>
                {nutritionData.reduce((sum, day) => sum + day.calories, 0)}
              </Text>
              <Text style={styles.nutritionSummaryLabel}>Total Calories</Text>
            </View>
            
            <View style={styles.nutritionSummaryItem}>
              <Text style={styles.nutritionSummaryValue}>
                {nutritionAverages.calories}
              </Text>
              <Text style={styles.nutritionSummaryLabel}>Daily Avg.</Text>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartYLabel}>{maxCalories}</Text>
              <Text style={styles.chartYLabel}>{Math.round(maxCalories / 2)}</Text>
              <Text style={styles.chartYLabel}>0</Text>
            </View>
            
            <View style={styles.chart}>
              {/* Target calorie line */}
              <View 
                style={[
                  styles.targetCalorieLine, 
                  { 
                    top: chartHeight - (user.targetCalories / maxCalories) * chartHeight,
                    width: chartWidth - 30
                  }
                ]} 
              />
              
              {/* Bars */}
              <View style={styles.barsContainer}>
                {nutritionData.map((day, index) => {
                  const barHeight = (day.calories / maxCalories) * chartHeight;
                  const barSpacing = (chartWidth - 30) / nutritionData.length;
                  const barLeft = index * barSpacing + (barSpacing - barWidth) / 2;
                  
                  return (
                    <View 
                      key={day.date} 
                      style={[
                        styles.barColumn,
                        { left: barLeft, width: barWidth }
                      ]}
                    >
                      <View 
                        style={[
                          styles.bar, 
                          { 
                            height: barHeight,
                            backgroundColor: day.calories > user.targetCalories 
                              ? colors.error 
                              : colors.primary
                          }
                        ]} 
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
          
          <View style={styles.chartXAxis}>
            {nutritionData.length > 7 
              ? [0, Math.floor(nutritionData.length / 2), nutritionData.length - 1].map(index => (
                  <Text key={index} style={styles.chartXLabel}>
                    {formatDateForDisplay(nutritionData[index].date)}
                  </Text>
                ))
              : nutritionData.map((day, index) => (
                  <Text key={index} style={styles.chartXLabel}>
                    {formatDateForDisplay(day.date).split(',')[0]}
                  </Text>
                ))
            }
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Calories</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Over Target</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: colors.text }]} />
              <Text style={styles.legendText}>Target ({user.targetCalories} cal)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTimeRange: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 12,
    color: colors.lightText,
    fontWeight: '500',
  },
  activeTimeRangeText: {
    color: colors.background,
  },
  goalProgressContainer: {
    marginBottom: 20,
  },
  goalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  goalProgressPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.progressBackground,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  weightGoalText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentWeightText: {
    fontSize: 14,
    color: colors.text,
  },
  targetWeightText: {
    fontSize: 14,
    color: colors.lightText,
  },
  weightChartContainer: {
    marginTop: 20,
  },
  weightChart: {
    height: 200,
    flexDirection: 'row',
  },
  weightYAxis: {
    width: 40,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  weightYLabel: {
    fontSize: 12,
    color: colors.lightText,
  },
  weightChartArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  targetWeightLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.text,
    opacity: 0.5,
    borderStyle: 'dashed',
  },
  weightPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginLeft: -6,
    marginTop: -6,
  },
  weightLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  weightXAxis: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
  },
  weightXLabel: {
    fontSize: 12,
    color: colors.lightText,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 20,
  },
  nutritionSummary: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nutritionSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionSummaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  nutritionSummaryLabel: {
    fontSize: 14,
    color: colors.lightText,
    marginTop: 4,
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
  },
  chartYAxis: {
    width: 30,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  chartYLabel: {
    fontSize: 10,
    color: colors.lightText,
  },
  chart: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  targetCalorieLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.text,
    opacity: 0.5,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    position: 'relative',
  },
  barColumn: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  chartXAxis: {
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30,
  },
  chartXLabel: {
    fontSize: 10,
    color: colors.lightText,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLine: {
    width: 12,
    height: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.lightText,
  },
});