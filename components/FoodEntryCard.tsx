import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Trash2, Pin, PinOff, ChevronDown, ChevronUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import { FoodEntry } from '@/types';
import { useFoodStore } from '@/stores/foodStore';

interface FoodEntryCardProps {
  entry: FoodEntry;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  showIngredients?: boolean;
}

export default function FoodEntryCard({ 
  entry, 
  isPinned = false, 
  onTogglePin,
  showIngredients = false
}: FoodEntryCardProps) {
  const [expanded, setExpanded] = useState(showIngredients);
  const removeEntry = useFoodStore(state => state.removeEntry);
  
  const handleDelete = () => {
    removeEntry(entry.id);
  };
  
  const handleTogglePin = () => {
    if (onTogglePin) {
      onTogglePin(entry.id);
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.content}>
          {entry.imageUri && (
            <Image
              source={{ uri: entry.imageUri }}
              style={styles.image}
              contentFit="cover"
            />
          )}
          <View style={styles.details}>
            <Text style={styles.name}>{entry.name}</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.calories}>{entry.calories} cal</Text>
              <Text style={styles.protein}>{entry.protein}g protein</Text>
              {entry.carbs && <Text style={styles.carbs}>{entry.carbs}g carbs</Text>}
              {entry.fats && <Text style={styles.fats}>{entry.fats}g fats</Text>}
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          {entry.ingredients && (
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={toggleExpanded}
            >
              {expanded ? (
                <ChevronUp size={18} color={colors.lightText} />
              ) : (
                <ChevronDown size={18} color={colors.lightText} />
              )}
            </Pressable>
          )}
          
          {onTogglePin && (
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={handleTogglePin}
            >
              {isPinned ? (
                <PinOff size={18} color={colors.primary} />
              ) : (
                <Pin size={18} color={colors.lightText} />
              )}
            </Pressable>
          )}
          
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={handleDelete}
          >
            <Trash2 size={18} color={colors.error} />
          </Pressable>
        </View>
      </View>
      
      {expanded && entry.ingredients && (
        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsLabel}>Ingredients:</Text>
          <Text style={styles.ingredients}>{entry.ingredients}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  calories: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 12,
  },
  protein: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.proteinColor,
    marginRight: 12,
  },
  carbs: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.carbsColor,
    marginRight: 12,
  },
  fats: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.fatsColor,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  ingredientsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ingredientsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  ingredients: {
    fontSize: 14,
    color: colors.lightText,
    lineHeight: 20,
  },
});