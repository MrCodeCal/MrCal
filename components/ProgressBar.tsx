import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import { calculateProgress } from '@/utils/calculations';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  color?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ 
  current, 
  target, 
  label, 
  color = colors.progressFill,
  showPercentage = false 
}: ProgressBarProps) {
  const progress = calculateProgress(current, target);
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {current} / {target} {showPercentage && `(${Math.round(progress)}%)`}
        </Text>
      </View>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  values: {
    fontSize: 14,
    color: colors.lightText,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.progressBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});