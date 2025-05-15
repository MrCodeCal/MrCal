import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { useUserStore } from '@/stores/userStore';
import { useFoodStore } from '@/stores/foodStore';
import { getWeightUnit } from '@/utils/calculations';
import Input from '@/components/Input';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Crown } from 'lucide-react-native';

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user, resetUser, logout, updateTargetCalories, updateTargetProtein } = useUserStore();
  const clearAllData = useFoodStore(state => state.clearAllData);
  const isPro = useSubscriptionStore(state => state.isPro);
  
  const [editMode, setEditMode] = useState(false);
  const [targetCalories, setTargetCalories] = useState(
    user ? user.targetCalories.toString() : ''
  );
  const [targetProtein, setTargetProtein] = useState(
    user?.targetProtein?.toString() || 
    (user?.weight && user?.unitSystem === 'metric' 
      ? Math.round(user.weight * 0.8).toString()
      : user?.weight ? Math.round(user.weight * 0.36).toString() : '') || ''
  );
  
  if (!user) return null;
  
  const weightUnit = getWeightUnit(user.unitSystem);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleUpdateProgress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/profile');
  };
  
  const handleResetData = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      "Reset All Data",
      "This will clear all your food entries. Your profile information will be kept. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            clearAllData();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        }
      ]
    );
  };
  
  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    logout();
    router.replace('/login');
  };
  
  const handleDeleteAccount = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            resetUser();
            clearAllData();
            router.replace('/');
          }
        }
      ]
    );
  };
  
  const toggleEditMode = () => {
    if (editMode) {
      // Save changes
      const newCalories = parseInt(targetCalories, 10);
      const newProtein = parseInt(targetProtein, 10);
      
      if (!isNaN(newCalories) && newCalories > 0) {
        updateTargetCalories(newCalories);
      }
      
      if (!isNaN(newProtein) && newProtein > 0) {
        updateTargetProtein(newProtein);
      }
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    
    setEditMode(!editMode);
  };
  
  // Get goal text
  const getGoalText = () => {
    switch (user.goal) {
      case 'bulking':
        return "Bulking (Calorie Surplus)";
      case 'cutting':
        return "Cutting (Calorie Deficit)";
      case 'maintaining':
        return "Maintaining Weight";
      default:
        return '';
    }
  };
  
  // Calculate protein target if not explicitly set
  const calculatedProteinTarget = user.targetProtein || 
    (user.unitSystem === 'metric' 
      ? Math.round(user.weight * 0.8)
      : Math.round(user.weight * 0.36));
  
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
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userUsername}>@{user.username}</Text>
          
          {isPro && (
            <View style={styles.proTag}>
              <Crown size={16} color={colors.background} />
              <Text style={styles.proTagText}>PRO</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Button
              title={editMode ? "Save" : "Edit"}
              onPress={toggleEditMode}
              variant="outline"
              size="small"
            />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{user.age} years</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Weight</Text>
            <Text style={styles.infoValue}>{user.weight} {weightUnit}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target Weight</Text>
            <Text style={styles.infoValue}>{user.targetWeight} {weightUnit}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Goal</Text>
            <Text style={styles.infoValue}>{getGoalText()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Daily Calorie Target</Text>
            {editMode ? (
              <Input
                value={targetCalories}
                onChangeText={setTargetCalories}
                keyboardType="number-pad"
                containerStyle={styles.editInput}
              />
            ) : (
              <Text style={styles.infoValue}>{user.targetCalories} calories</Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Daily Protein Target</Text>
            {editMode ? (
              <Input
                value={targetProtein}
                onChangeText={setTargetProtein}
                keyboardType="number-pad"
                containerStyle={styles.editInput}
              />
            ) : (
              <Text style={styles.infoValue}>{calculatedProteinTarget}g protein</Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unit System</Text>
            <Text style={styles.infoValue}>{user.unitSystem === 'metric' ? 'Metric (kg)' : 'Imperial (lb)'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subscription</Text>
            <Text style={[styles.infoValue, isPro ? styles.proValue : {}]}>
              {isPro ? "Pro" : "Free"}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Update Progress"
            onPress={handleUpdateProgress}
            style={styles.actionButton}
          />
          
          {!isPro && (
            <Button
              title="Upgrade to Pro"
              onPress={() => router.push('/(tabs)/pro')}
              style={[styles.actionButton, styles.upgradeButton]}
            />
          )}
          
          <Button
            title="Reset Food Data"
            onPress={handleResetData}
            variant="outline"
            style={styles.actionButton}
          />
          
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            style={styles.actionButton}
          />
          
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="outline"
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
          />
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
  profileHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  userUsername: {
    fontSize: 16,
    color: colors.lightText,
    marginTop: 4,
  },
  proTag: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  proTagText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.lightText,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  proValue: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  editInput: {
    flex: 1,
    marginBottom: 0,
    maxWidth: 120,
    alignSelf: 'flex-end',
  },
  actionsContainer: {
    gap: 16,
  },
  actionButton: {
    width: '100%',
  },
  upgradeButton: {
    backgroundColor: colors.accent,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
  },
});