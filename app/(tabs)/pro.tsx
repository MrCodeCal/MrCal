import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, RefreshControl, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Crown, Check, X, ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import { useFoodStore } from '@/stores/foodStore';
import Input from '@/components/Input';

// Mock data for pre-generated meals
const DAILY_MEAL_SUGGESTIONS = {
  breakfast: {
    name: "Greek Yogurt Protein Bowl",
    calories: 380,
    protein: 28,
    carbs: 42,
    fats: 12,
    ingredients: "1 cup Greek yogurt (0% fat), 1 scoop vanilla protein powder, 1/2 cup mixed berries, 1 tbsp honey, 2 tbsp granola, 1 tbsp chia seeds",
    instructions: "1. Mix Greek yogurt with protein powder in a bowl until smooth.\n2. Top with berries, granola, and chia seeds.\n3. Drizzle with honey and serve immediately."
  },
  lunch: {
    name: "Mediterranean Chicken Wrap",
    calories: 450,
    protein: 35,
    carbs: 38,
    fats: 18,
    ingredients: "4 oz grilled chicken breast, 1 whole wheat tortilla, 2 tbsp hummus, 1/4 cup diced cucumber, 1/4 cup diced tomatoes, 2 tbsp feta cheese, 1 cup mixed greens, 1 tbsp olive oil, 1 tsp lemon juice",
    instructions: "1. Spread hummus on the tortilla.\n2. Layer with mixed greens, grilled chicken, cucumber, tomatoes, and feta cheese.\n3. Drizzle with olive oil and lemon juice.\n4. Roll up tightly and cut in half before serving."
  },
  dinner: {
    name: "Baked Salmon with Quinoa and Roasted Vegetables",
    calories: 520,
    protein: 42,
    carbs: 35,
    fats: 22,
    ingredients: "5 oz salmon fillet, 1/2 cup cooked quinoa, 1 cup mixed vegetables (broccoli, bell peppers, zucchini), 1 tbsp olive oil, 1 clove garlic (minced), 1 tsp dried herbs, 1/2 lemon, salt and pepper to taste",
    instructions: "1. Preheat oven to 400°F (200°C).\n2. Place salmon on a baking sheet, season with salt, pepper, and a squeeze of lemon.\n3. Toss vegetables with olive oil, garlic, herbs, salt, and pepper.\n4. Spread vegetables on another baking sheet.\n5. Bake salmon for 12-15 minutes and vegetables for 20-25 minutes.\n6. Serve salmon over cooked quinoa with roasted vegetables on the side."
  }
};

export default function ProScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { isPro, subscriptionDate, setProStatus, cancelSubscription } = useSubscriptionStore();
  const [mealPrompt, setMealPrompt] = useState('');
  const [generatedMeals, setGeneratedMeals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState(true);
  const [expandedMealDetails, setExpandedMealDetails] = useState<Record<string, boolean>>({});
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleSubscribe = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Subscribe to Pro",
      "Would you like to subscribe to Mr Cal Pro for $4.99/month?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Subscribe",
          onPress: () => {
            // In a real app, this would trigger payment processing
            setProStatus(true);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert("Success", "You are now a Pro member! Enjoy all premium features.");
          }
        }
      ]
    );
  };
  
  const handleCancelSubscription = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your Pro subscription? You'll lose access to all premium features.",
      [
        {
          text: "Keep Subscription",
          style: "cancel"
        },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: () => {
            cancelSubscription();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert("Subscription Cancelled", "Your Pro subscription has been cancelled.");
          }
        }
      ]
    );
  };
  
  const generateMeals = async () => {
    if (!mealPrompt.trim()) {
      Alert.alert("Error", "Please enter a meal prompt");
      return;
    }
    
    setIsGenerating(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      // In a real app, this would call an AI service
      // For demo purposes, we'll simulate an API call
      setTimeout(() => {
        const mockMeals = [
          {
            name: "Grilled Chicken Salad",
            calories: 350,
            protein: 35,
            carbs: 15,
            fats: 18,
            ingredients: "Grilled chicken breast (4 oz), mixed greens (2 cups), cherry tomatoes (1/2 cup), cucumber (1/2 cup), avocado (1/4), olive oil (1 tbsp), lemon juice (1 tbsp), salt and pepper to taste",
            instructions: "1. Season chicken breast with salt and pepper, then grill until fully cooked.\n2. Chop all vegetables and place in a large bowl.\n3. Slice the cooked chicken and add to the bowl.\n4. Mix olive oil, lemon juice, salt, and pepper for the dressing.\n5. Toss everything together and serve immediately."
          },
          {
            name: "Protein Smoothie Bowl",
            calories: 420,
            protein: 30,
            carbs: 45,
            fats: 12,
            ingredients: "Greek yogurt (1 cup), whey protein (1 scoop), banana (1 medium), mixed berries (1/2 cup), almond milk (1/4 cup), chia seeds (1 tbsp), granola (2 tbsp)",
            instructions: "1. Blend Greek yogurt, protein powder, banana, berries, and almond milk until smooth.\n2. Pour into a bowl.\n3. Top with chia seeds and granola.\n4. Serve cold."
          },
          {
            name: "Salmon with Roasted Vegetables",
            calories: 480,
            protein: 32,
            carbs: 25,
            fats: 28,
            ingredients: "Salmon fillet (5 oz), broccoli florets (1 cup), bell peppers (1/2 cup), zucchini (1/2 cup), olive oil (2 tbsp), minced garlic (2 cloves), lemon (1/2), mixed herbs (1 tsp), salt and pepper to taste",
            instructions: "1. Preheat oven to 400°F (200°C).\n2. Place salmon on a baking sheet lined with parchment paper.\n3. In a bowl, toss vegetables with olive oil, garlic, herbs, salt, and pepper.\n4. Spread vegetables on another baking sheet.\n5. Season salmon with salt, pepper, and a squeeze of lemon juice.\n6. Bake salmon for 12-15 minutes and vegetables for 20-25 minutes.\n7. Serve salmon with roasted vegetables on the side."
          }
        ];
        
        setGeneratedMeals(mockMeals);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating meals:", error);
      setIsGenerating(false);
      Alert.alert("Error", "Failed to generate meals. Please try again.");
    }
  };
  
  const addMealToLog = (meal: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const { addEntry } = useFoodStore.getState();
    
    addEntry({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      ingredients: meal.ingredients
    });
    
    Alert.alert("Success", `${meal.name} added to your food log`);
  };
  
  const toggleFeatures = () => {
    setExpandedFeatures(!expandedFeatures);
  };
  
  const toggleMealDetails = (mealType: string) => {
    setExpandedMealDetails(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const renderMealCard = (meal: any, mealType: string, mealTitle: string) => {
    const isExpanded = expandedMealDetails[mealType] || false;
    
    return (
      <View style={styles.mealCard} key={mealType}>
        <View style={styles.mealCardHeader}>
          <View>
            <Text style={styles.mealTypeLabel}>{mealTitle}</Text>
            <Text style={styles.mealName}>{meal.name}</Text>
          </View>
          <View style={styles.mealActions}>
            <Button
              title={isExpanded ? "Hide Details" : "Details"}
              onPress={() => toggleMealDetails(mealType)}
              variant="outline"
              size="small"
              style={styles.detailsButton}
            />
          </View>
        </View>
        
        <View style={styles.macrosContainer}>
          <Text style={styles.macroItem}>{meal.calories} cal</Text>
          <Text style={styles.macroItem}>{meal.protein}g protein</Text>
          <Text style={styles.macroItem}>{meal.carbs}g carbs</Text>
          <Text style={styles.macroItem}>{meal.fats}g fats</Text>
        </View>
        
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <Text style={styles.detailsLabel}>Ingredients:</Text>
            <Text style={styles.detailsText}>{meal.ingredients}</Text>
            
            <Text style={styles.detailsLabel}>Instructions:</Text>
            <Text style={styles.detailsText}>{meal.instructions}</Text>
          </View>
        )}
        
        <Button
          title="Add to Food Log"
          onPress={() => addMealToLog(meal)}
          size="small"
          style={styles.addMealButton}
        />
      </View>
    );
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
        {!isPro ? (
          // Pro subscription offer for non-subscribers
          <View style={styles.proOfferContainer}>
            <View style={styles.crownContainer}>
              <Crown size={60} color={colors.accent} />
            </View>
            
            <Text style={styles.proTitle}>Upgrade to Mr Cal Pro</Text>
            <Text style={styles.proPrice}>$4.99/month</Text>
            
            <Pressable style={styles.featuresHeader} onPress={toggleFeatures}>
              <Text style={styles.featuresTitle}>Pro Features</Text>
              {expandedFeatures ? (
                <ChevronUp size={20} color={colors.text} />
              ) : (
                <ChevronDown size={20} color={colors.text} />
              )}
            </Pressable>
            
            {expandedFeatures && (
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Check size={20} color={colors.success} />
                  <Text style={styles.featureText}>Pin unlimited meals for quick access</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Check size={20} color={colors.success} />
                  <Text style={styles.featureText}>Track unlimited meals per day</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Check size={20} color={colors.success} />
                  <Text style={styles.featureText}>AI-generated meal suggestions</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Check size={20} color={colors.success} />
                  <Text style={styles.featureText}>Advanced nutrition analytics</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Check size={20} color={colors.success} />
                  <Text style={styles.featureText}>Priority customer support</Text>
                </View>
              </View>
            )}
            
            <View style={styles.limitationsContainer}>
              <Text style={styles.limitationsTitle}>Free Plan Limitations:</Text>
              
              <View style={styles.limitationItem}>
                <X size={16} color={colors.error} />
                <Text style={styles.limitationText}>Limited to 3 meals per day</Text>
              </View>
              
              <View style={styles.limitationItem}>
                <X size={16} color={colors.error} />
                <Text style={styles.limitationText}>Cannot pin meals for quick access</Text>
              </View>
              
              <View style={styles.limitationItem}>
                <X size={16} color={colors.error} />
                <Text style={styles.limitationText}>No AI meal suggestions</Text>
              </View>
            </View>
            
            <Button
              title="Upgrade to Pro"
              onPress={handleSubscribe}
              style={styles.subscribeButton}
            />
          </View>
        ) : (
          // Pro features for subscribers
          <View style={styles.proContentContainer}>
            <View style={styles.proHeader}>
              <View style={styles.proHeaderLeft}>
                <Crown size={24} color={colors.accent} />
                <Text style={styles.proHeaderText}>Mr Cal Pro</Text>
              </View>
              <Text style={styles.subscriptionDate}>
                Member since {formatDate(subscriptionDate)}
              </Text>
            </View>
            
            {/* Daily Meal Suggestions */}
            <View style={styles.dailyMealsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Meal Suggestions</Text>
                <Clock size={18} color={colors.lightText} />
              </View>
              
              {renderMealCard(DAILY_MEAL_SUGGESTIONS.breakfast, 'breakfast', 'Breakfast')}
              {renderMealCard(DAILY_MEAL_SUGGESTIONS.lunch, 'lunch', 'Lunch')}
              {renderMealCard(DAILY_MEAL_SUGGESTIONS.dinner, 'dinner', 'Dinner')}
            </View>
            
            {/* Custom AI Meal Generator */}
            <View style={styles.aiMealsContainer}>
              <Text style={styles.aiMealsTitle}>Custom Meal Generator</Text>
              <Text style={styles.aiMealsDescription}>
                Describe what kind of meal you're looking for, and our AI will generate personalized suggestions.
              </Text>
              
              <Input
                label="What kind of meal would you like?"
                placeholder="e.g. High protein breakfast, Keto dinner, Vegan lunch under 500 calories"
                value={mealPrompt}
                onChangeText={setMealPrompt}
                multiline
              />
              
              <Button
                title={isGenerating ? "Generating..." : "Generate Meal Ideas"}
                onPress={generateMeals}
                loading={isGenerating}
                style={styles.generateButton}
              />
              
              {generatedMeals.length > 0 && (
                <View style={styles.generatedMealsContainer}>
                  <Text style={styles.generatedMealsTitle}>Custom Meal Suggestions</Text>
                  
                  {generatedMeals.map((meal, index) => (
                    <View key={index} style={styles.mealCard}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      
                      <View style={styles.macrosContainer}>
                        <Text style={styles.macroItem}>{meal.calories} cal</Text>
                        <Text style={styles.macroItem}>{meal.protein}g protein</Text>
                        <Text style={styles.macroItem}>{meal.carbs}g carbs</Text>
                        <Text style={styles.macroItem}>{meal.fats}g fats</Text>
                      </View>
                      
                      <Text style={styles.detailsLabel}>Ingredients:</Text>
                      <Text style={styles.detailsText}>{meal.ingredients}</Text>
                      
                      <Text style={styles.detailsLabel}>Instructions:</Text>
                      <Text style={styles.detailsText}>{meal.instructions}</Text>
                      
                      <Button
                        title="Add to Food Log"
                        onPress={() => addMealToLog(meal)}
                        size="small"
                        style={styles.addMealButton}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.cancelContainer}>
              <Button
                title="Cancel Subscription"
                onPress={handleCancelSubscription}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        )}
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
  proOfferContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  crownContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  proTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  proPrice: {
    fontSize: 18,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  limitationsContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  limitationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitationText: {
    fontSize: 14,
    color: colors.lightText,
    marginLeft: 8,
  },
  subscribeButton: {
    marginTop: 8,
  },
  proContentContainer: {
    flex: 1,
  },
  proHeader: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  proHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  subscriptionDate: {
    fontSize: 12,
    color: colors.lightText,
  },
  dailyMealsContainer: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  aiMealsContainer: {
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
  aiMealsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  aiMealsDescription: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 16,
    lineHeight: 20,
  },
  generateButton: {
    marginTop: 8,
  },
  generatedMealsContainer: {
    marginTop: 24,
  },
  generatedMealsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  mealActions: {
    flexDirection: 'row',
  },
  detailsButton: {
    minWidth: 100,
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  macroItem: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 12,
    marginBottom: 4,
  },
  expandedDetails: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: colors.lightText,
    lineHeight: 20,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  addMealButton: {
    alignSelf: 'flex-end',
  },
  cancelContainer: {
    marginTop: 24,
  },
  cancelButton: {
    borderColor: colors.error,
  },
});