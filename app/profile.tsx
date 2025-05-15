import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useUserStore } from '@/stores/userStore';
import { useFoodStore } from '@/stores/foodStore';
import { getWeightUnit } from '@/utils/calculations';

export default function UpdateWeightScreen() {
  const { user, updateWeight, updateTargetWeight, updateGoal } = useUserStore();
  
  const [currentWeight, setCurrentWeight] = useState(user?.weight.toString() || '');
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight.toString() || '');
  const [selectedGoal, setSelectedGoal] = useState<'bulking' | 'cutting' | 'maintaining'>(
    user?.goal || 'maintaining'
  );
  
  if (!user) {
    router.replace('/');
    return null;
  }
  
  const weightUnit = getWeightUnit(user.unitSystem);
  
  const handleUpdateWeight = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const newWeight = parseFloat(currentWeight);
    if (isNaN(newWeight) || newWeight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }
    
    updateWeight(newWeight);
    Alert.alert('Success', 'Your weight has been updated.');
  };
  
  const handleUpdateTargetWeight = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const newTargetWeight = parseFloat(targetWeight);
    if (isNaN(newTargetWeight) || newTargetWeight <= 0) {
      Alert.alert('Invalid Target Weight', 'Please enter a valid target weight.');
      return;
    }
    
    updateTargetWeight(newTargetWeight);
    Alert.alert('Success', 'Your target weight has been updated.');
  };
  
  const handleUpdateGoal = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    updateGoal(selectedGoal);
    Alert.alert('Success', 'Your fitness goal has been updated.');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Update Your Progress</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.weightInput}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              keyboardType="decimal-pad"
              placeholder={`Enter weight in ${weightUnit}`}
            />
            <Text style={styles.unitText}>{weightUnit}</Text>
          </View>
          <Button
            title="Update Weight"
            onPress={handleUpdateWeight}
            style={styles.updateButton}
          />
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Target Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.weightInput}
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="decimal-pad"
              placeholder={`Enter target weight in ${weightUnit}`}
            />
            <Text style={styles.unitText}>{weightUnit}</Text>
          </View>
          <Button
            title="Update Target"
            onPress={handleUpdateTargetWeight}
            style={styles.updateButton}
          />
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fitness Goal</Text>
          <View style={styles.goalButtons}>
            <Button
              title="Bulking"
              variant={selectedGoal === 'bulking' ? 'primary' : 'outline'}
              onPress={() => setSelectedGoal('bulking')}
              style={styles.goalButton}
            />
            <Button
              title="Maintaining"
              variant={selectedGoal === 'maintaining' ? 'primary' : 'outline'}
              onPress={() => setSelectedGoal('maintaining')}
              style={styles.goalButton}
            />
            <Button
              title="Cutting"
              variant={selectedGoal === 'cutting' ? 'primary' : 'outline'}
              onPress={() => setSelectedGoal('cutting')}
              style={styles.goalButton}
            />
          </View>
          <Button
            title="Update Goal"
            onPress={handleUpdateGoal}
            style={styles.updateButton}
          />
        </View>
        
        <Button
          title="Back to Profile"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weightInput: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 12,
    width: 30,
  },
  updateButton: {
    marginTop: 8,
  },
  goalButtons: {
    marginBottom: 16,
  },
  goalButton: {
    marginBottom: 8,
  },
  backButton: {
    marginTop: 16,
  },
});