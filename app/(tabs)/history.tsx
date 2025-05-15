import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { ChevronDown, ChevronUp, Crown } from 'lucide-react-native';
import { router } from 'expo-router';
import colors from '@/constants/colors';
import { useFoodStore } from '@/stores/foodStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import FoodEntryCard from '@/components/FoodEntryCard';
import Button from '@/components/Button';

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const dailyLogs = useFoodStore(state => state.dailyLogs);
  const togglePinEntry = useFoodStore(state => state.togglePinEntry);
  const isPinned = useFoodStore(state => state.isPinned);
  const isPro = useSubscriptionStore(state => state.isPro);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  
  const sortedDates = useMemo(() => {
    return Object.keys(dailyLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [dailyLogs]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };
  
  const handleTogglePin = (id: string) => {
    if (!isPro) {
      Alert.alert(
        "Pro Feature",
        "Pinning meals is a Pro feature. Upgrade to Pro to pin your favorite meals!",
        [
          { text: "Maybe Later", style: "cancel" },
          { 
            text: "Upgrade to Pro", 
            onPress: () => router.push('/(tabs)/pro'),
            style: "default"
          }
        ]
      );
      return;
    }
    
    togglePinEntry(id);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get all pinned entries across all dates
  const pinnedEntries = useMemo(() => {
    const allEntries = Object.values(dailyLogs).flatMap(log => log.entries);
    return allEntries.filter(entry => isPinned(entry.id));
  }, [dailyLogs, isPinned]);
  
  if (sortedDates.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No History Yet</Text>
          <Text style={styles.emptyStateText}>
            Your food tracking history will appear here once you start logging meals.
          </Text>
        </View>
      </View>
    );
  }
  
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
        {!isPro && (
          <Pressable 
            style={styles.proPromotionBanner}
            onPress={() => router.push('/(tabs)/pro')}
          >
            <View style={styles.proPromotionContent}>
              <Crown size={20} color={colors.accent} />
              <Text style={styles.proPromotionText}>
                Upgrade to Pro to pin your favorite meals for quick access!
              </Text>
            </View>
            <Text style={styles.proPromotionPrice}>$4.99/mo</Text>
          </Pressable>
        )}
        
        {isPro && pinnedEntries.length > 0 && (
          <View style={styles.pinnedSection}>
            <Text style={styles.pinnedTitle}>Pinned Meals</Text>
            {pinnedEntries.map(entry => (
              <FoodEntryCard 
                key={`pinned-${entry.id}`} 
                entry={entry} 
                isPinned={true}
                onTogglePin={handleTogglePin}
                showIngredients={true}
              />
            ))}
          </View>
        )}
        
        {sortedDates.map(date => {
          const log = dailyLogs[date];
          const isExpanded = expandedDates[date] ?? false;
          
          return (
            <View key={date} style={styles.dateSection}>
              <Pressable 
                style={styles.dateSummary}
                onPress={() => toggleDateExpansion(date)}
              >
                <View>
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                  <Text style={styles.dateStats}>
                    {log.totalCalories} cal · {log.totalProtein}g protein · {log.entries.length} items
                  </Text>
                </View>
                
                {isExpanded ? (
                  <ChevronUp size={20} color={colors.lightText} />
                ) : (
                  <ChevronDown size={20} color={colors.lightText} />
                )}
              </Pressable>
              
              {isExpanded && (
                <View style={styles.entriesContainer}>
                  {log.entries
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map(entry => (
                      <FoodEntryCard 
                        key={entry.id} 
                        entry={entry} 
                        isPinned={isPinned(entry.id)}
                        onTogglePin={handleTogglePin}
                        showIngredients={true}
                      />
                    ))}
                </View>
              )}
            </View>
          );
        })}
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
  proPromotionBanner: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  proPromotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  proPromotionText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  proPromotionPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
  },
  pinnedSection: {
    marginBottom: 24,
  },
  pinnedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dateSection: {
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dateStats: {
    fontSize: 14,
    color: colors.lightText,
    marginTop: 4,
  },
  entriesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
  },
});