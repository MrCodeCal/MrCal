import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useFoodStore } from '@/stores/foodStore';
import { useUserStore } from '@/stores/userStore';
import { getWeightUnit } from '@/utils/calculations';

export default function AddManualScreen() {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const addEntry = useFoodStore(state => state.addEntry);
  const user = useUserStore(state => state.user);
  
  if (!user) return null;
  
  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Food name is required";
    }
    
    if (!calories.trim()) {
      newErrors.calories = "Calories are required";
    } else if (isNaN(Number(calories)) || Number(calories) < 0) {
      newErrors.calories = "Please enter a valid calorie amount";
    }
    
    if (!protein.trim()) {
      newErrors.protein = "Protein amount is required";
    } else if (isNaN(Number(protein)) || Number(protein) < 0) {
      newErrors.protein = "Please enter a valid protein amount";
    }
    
    if (carbs.trim() && (isNaN(Number(carbs)) || Number(carbs) < 0)) {
      newErrors.carbs = "Please enter a valid carbs amount";
    }
    
    if (fats.trim() && (isNaN(Number(fats)) || Number(fats) < 0)) {
      newErrors.fats = "Please enter a valid fats amount";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!validateInputs()) return;
    
    addEntry({
      name,
      ingredients: ingredients.trim() || undefined,
      calories: parseInt(calories, 10),
      protein: parseInt(protein, 10),
      carbs: carbs.trim() ? parseInt(carbs, 10) : undefined,
      fats: fats.trim() ? parseInt(fats, 10) : undefined,
      imageUri: imageUri || undefined,
    });
    
    router.back();
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const removeImage = () => {
    setImageUri(null);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  contentFit="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <X size={20} color={colors.background} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.imagePlaceholder}
                onPress={pickImage}
              >
                <Camera size={32} color={colors.lightText} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.form}>
            <Input
              label="Food Name"
              placeholder="e.g. Grilled Chicken Salad"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            
            <Input
              label="Ingredients (Optional)"
              placeholder="e.g. Chicken, lettuce, tomatoes, olive oil"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
            />
            
            <View style={styles.row}>
              <Input
                label="Calories"
                placeholder="e.g. 350"
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
                error={errors.calories}
                containerStyle={styles.halfInput}
              />
              
              <Input
                label="Protein (g)"
                placeholder="e.g. 25"
                value={protein}
                onChangeText={setProtein}
                keyboardType="number-pad"
                error={errors.protein}
                containerStyle={styles.halfInput}
              />
            </View>
            
            <View style={styles.row}>
              <Input
                label="Carbs (g) (Optional)"
                placeholder="e.g. 30"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="number-pad"
                error={errors.carbs}
                containerStyle={styles.halfInput}
              />
              
              <Input
                label="Fats (g) (Optional)"
                placeholder="e.g. 12"
                value={fats}
                onChangeText={setFats}
                keyboardType="number-pad"
                error={errors.fats}
                containerStyle={styles.halfInput}
              />
            </View>
          </View>
          
          <Button
            title="Add Food Entry"
            onPress={handleSubmit}
            size="large"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: colors.lightText,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
  },
});