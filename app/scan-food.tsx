import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ArrowLeft, Camera, Check, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { analyzeFoodImage } from '@/utils/foodAI';
import { useFoodStore } from '@/stores/foodStore';

export default function ScanFoodScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState<{
    name: string;
    calories: number;
    protein: number;
    carbs?: number;
    fats?: number;
  } | null>(null);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  
  const cameraRef = useRef<any>(null);
  const addEntry = useFoodStore(state => state.addEntry);
  
  useEffect(() => {
    if (foodData) {
      setName(foodData.name);
      setCalories(foodData.calories.toString());
      setProtein(foodData.protein.toString());
      if (foodData.carbs) setCarbs(foodData.carbs.toString());
      if (foodData.fats) setFats(foodData.fats.toString());
    }
  }, [foodData]);
  
  const takePicture = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (Platform.OS === 'web') {
      // Mock image capture for web
      setCapturedImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000');
      return;
    }
    
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };
  
  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setAnalyzing(true);
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // For web, use mock data
      if (Platform.OS === 'web') {
        setTimeout(() => {
          setFoodData({
            name: 'Healthy Salad',
            calories: 320,
            protein: 15,
            carbs: 30,
            fats: 12,
          });
          setAnalyzing(false);
        }, 1500);
        return;
      }
      
      // Convert image to base64 for AI analysis
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        // Remove the data:image/jpeg;base64, part
        const base64Image = base64data.split(',')[1];
        
        try {
          const result = await analyzeFoodImage(base64Image);
          setFoodData(result);
        } catch (error) {
          console.error('Error analyzing image:', error);
          Alert.alert('Error', 'Failed to analyze the image. Please try again or add manually.');
        } finally {
          setAnalyzing(false);
        }
      };
    } catch (error) {
      console.error('Error preparing image:', error);
      setAnalyzing(false);
      Alert.alert('Error', 'Failed to process the image. Please try again.');
    }
  };
  
  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addEntry({
      name,
      calories: parseInt(calories, 10),
      protein: parseInt(protein, 10),
      carbs: carbs ? parseInt(carbs, 10) : undefined,
      fats: fats ? parseInt(fats, 10) : undefined,
      imageUri: capturedImage || undefined,
    });
    
    router.back();
  };
  
  const resetCapture = () => {
    setCapturedImage(null);
    setFoodData(null);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };
  
  const toggleCamera = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };
  
  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan your food and estimate calories.
          </Text>
          <Button 
            title="Grant Permission" 
            onPress={requestPermission} 
            style={styles.permissionButton}
          />
          <Button 
            title="Go Back" 
            onPress={() => router.back()} 
            variant="outline"
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={styles.container}>
      {!capturedImage ? (
        // Camera view
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            <SafeAreaView style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color={colors.background} />
              </TouchableOpacity>
              
              <View style={styles.cameraButtonsContainer}>
                <TouchableOpacity 
                  style={styles.flipButton}
                  onPress={toggleCamera}
                >
                  <Camera size={24} color={colors.background} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </CameraView>
        </>
      ) : (
        // Image preview and analysis
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity 
              style={styles.previewBackButton}
              onPress={resetCapture}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>
              {foodData ? 'Confirm Details' : 'Analyzing Food'}
            </Text>
            <View style={styles.previewPlaceholder} />
          </View>
          
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: capturedImage }}
              style={styles.imagePreview}
              contentFit="cover"
            />
          </View>
          
          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.analyzingText}>Analyzing your food...</Text>
            </View>
          ) : foodData ? (
            <View style={styles.foodDataContainer}>
              <Input
                label="Food Name"
                value={name}
                onChangeText={setName}
              />
              
              <View style={styles.nutritionInputs}>
                <Input
                  label="Calories"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="number-pad"
                  containerStyle={styles.halfInput}
                />
                
                <Input
                  label="Protein (g)"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="number-pad"
                  containerStyle={styles.halfInput}
                />
              </View>
              
              <View style={styles.nutritionInputs}>
                <Input
                  label="Carbs (g)"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="number-pad"
                  containerStyle={styles.halfInput}
                />
                
                <Input
                  label="Fats (g)"
                  value={fats}
                  onChangeText={setFats}
                  keyboardType="number-pad"
                  containerStyle={styles.halfInput}
                />
              </View>
              
              <Button
                title="Save Food Entry"
                onPress={handleSave}
                icon={<Check size={20} color={colors.background} />}
                style={styles.saveButton}
              />
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <Button
                title="Analyze Food"
                onPress={analyzeImage}
                style={styles.analyzeButton}
              />
              
              <Button
                title="Retake Photo"
                onPress={resetCapture}
                variant="outline"
                style={styles.retakeButton}
              />
            </View>
          )}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  backButton: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
  },
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  previewBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  previewPlaceholder: {
    width: 40,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 16,
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  analyzingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
  },
  actionButtons: {
    padding: 20,
  },
  analyzeButton: {
    marginBottom: 12,
  },
  retakeButton: {},
  foodDataContainer: {
    padding: 20,
  },
  nutritionInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 20,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    width: '100%',
    marginBottom: 12,
  },
});