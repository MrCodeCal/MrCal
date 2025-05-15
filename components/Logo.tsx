import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function Logo({ size = 'medium', color = colors.primary }: LogoProps) {
  const fontSize = size === 'small' ? 24 : size === 'medium' ? 36 : 48;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize, color }]}>Mr Cal</Text>
      <View style={[styles.underline, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  underline: {
    height: 3,
    width: '70%',
    borderRadius: 2,
    marginTop: 2,
  },
});