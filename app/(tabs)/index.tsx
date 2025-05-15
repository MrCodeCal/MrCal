import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { PlusCircle, Camera, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import colors from '@/constants/colors';
import { useUserStore } from '@/stores/userStore';
import { useFoodStore } from '@/stores/foodStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import DailySummary from '@/components/DailySummary';
import FoodEntryCard from '@/components/FoodEntryCard';
import Button from '@/components/Button';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const user = useUserStore(state => state.user);
  const getTodayEntries = useFoodStore(state => state.getTodayEntries);
  const togglePinEntry = useFoodStore(state => state.togglePinEntry);
  const isPinned = useFoodStore(state => state.isPinned);
  const isPro = useSubscriptionStore(state => state.isPro);
  
  // Memoize the entries to prevent recalculation on every render
  const todayEntries = useMemo(() => getTodayEntries(), [getTodayEntries]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleAddManually = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Check if free user has reached daily limit of 3 meals
    if (!isPro && todayEntries.length >= 3) {
      Alert.alert(
        "Daily Limit Reached",
        "Free users can only add 3 meals per day. Upgrade to Pro for unlimited tracking!",
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
    
    router.push('/add-manual');
  };
  
  const handleScanFood = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Check if free user has reached daily limit of 3 meals
    if (!isPro && todayEntries.length >= 3) {
      Alert.alert(
        "Daily Limit Reached",
        "Free users can only add 3 meals per day. Upgrade to Pro for unlimited tracking!",
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
    
    router.push('/scan-food');
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
  
  if (!user) return null;
  
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
        <Text style={styles.greeting}>Hello, {user.name}!</Text>
        
        <DailySummary />
        
        {!isPro && (
          <Pressable 
            style={styles.proPromotionBanner}
            onPress={() => router.push('/(tabs)/pro')}
          >
            <View style={styles.proPromotionContent}>
              <Crown size={20} color={colors.accent} />
              <Text style={styles.proPromotionText}>
                Upgrade to Pro for unlimited meal tracking and more!
              </Text>
            </View>
            <Text style={styles.proPromotionPrice}>$4.99/mo</Text>
          </Pressable>
        )}
        
        <View style={styles.actionsContainer}>
          <Button
            title="Add Manually"
            onPress={handleAddManually}
            icon={<PlusCircle size={20} color={colors.background} />}
            style={styles.actionButton}
          />
          
          <Button
            title="Scan Food"
            onPress={handleScanFood}
            variant="outline"
            icon={<Camera size={20} color={colors.primary} />}
            style={styles.actionButton}
          />
        </View>
        
        <View style={styles.entriesContainer}>
          <Text style={styles.sectionTitle}>Today's Entries</Text>
          
          {todayEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No food entries yet today. Add your first meal!
              </Text>
            </View>
          ) : (
            todayEntries
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(entry => (
                <FoodEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  isPinned={isPinned(entry.id)}
                  onTogglePin={handleTogglePin}
                />
              ))
          )}
          
          {!isPro && todayEntries.length >= 3 && (
            <View style={styles.limitReachedContainer}>
              <Text style={styles.limitReachedText}>
                You've reached the daily limit of 3 meals for free users.
              </Text>
              <Button
                title="Upgrade to Pro"
                onPress={() => router.push('/(tabs)/pro')}
                size="small"
                style={styles.upgradeButton}
              />
            </View>
          )}
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  entriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: colors.lightText,
    textAlign: 'center',
    fontSize: 16,
  },
  limitReachedContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  limitReachedText: {
    color: colors.lightText,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  upgradeButton: {
    width: '100%',
  },
});