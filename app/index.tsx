import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { useUserStore, createUser } from '@/stores/userStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

export default function OnboardingScreen() {
  // Authentication fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Personal info fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  
  // Unit system selection
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  
  // Goal selection
  const [goal, setGoal] = useState<'bulking' | 'cutting' | 'maintaining'>('maintaining');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  // Form state
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Subscription state
  const [showProOffer, setShowProOffer] = useState(false);
  
  const { setUser, completeOnboarding } = useUserStore();
  const { setProStatus } = useSubscriptionStore();
  
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 4) {
      newErrors.username = "Username must be at least 4 characters";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!age.trim()) {
      newErrors.age = "Age is required";
    } else if (isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      newErrors.age = "Please enter a valid age";
    }
    
    if (!weight.trim()) {
      newErrors.weight = "Current weight is required";
    } else if (isNaN(Number(weight)) || Number(weight) <= 0 || Number(weight) > 500) {
      newErrors.weight = "Please enter a valid weight";
    }
    
    if (!targetWeight.trim()) {
      newErrors.targetWeight = "Target weight is required";
    } else if (isNaN(Number(targetWeight)) || Number(targetWeight) <= 0 || Number(targetWeight) > 500) {
      newErrors.targetWeight = "Please enter a valid target weight";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };
  
  const handlePrevStep = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const user = createUser(
      username,
      password,
      name,
      parseInt(age, 10),
      parseInt(weight, 10),
      parseInt(targetWeight, 10),
      goal,
      unitSystem,
      gender
    );
    
    setUser(user);
    completeOnboarding();
    
    // Show Pro offer after signup
    setShowProOffer(true);
  };
  
  const handleProOffer = (subscribe: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (subscribe) {
      setProStatus(true);
    }
    
    router.replace('/(tabs)');
  };
  
  const toggleGender = () => {
    setGender(current => current === 'male' ? 'female' : 'male');
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const toggleUnitSystem = () => {
    setUnitSystem(current => current === 'metric' ? 'imperial' : 'metric');
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const selectGoal = (selectedGoal: 'bulking' | 'cutting' | 'maintaining') => {
    setGoal(selectedGoal);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const handleLoginRedirect = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/login');
  };
  
  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lb';
  
  if (showProOffer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.proOfferContainer}>
          <Logo size="large" />
          <Text style={styles.proOfferTitle}>Upgrade to Pro</Text>
          <Text style={styles.proOfferSubtitle}>Get the most out of Mr Cal with premium features</Text>
          
          <View style={styles.proFeatures}>
            <View style={styles.proFeatureItem}>
              <Text style={styles.proFeatureText}>• Pin unlimited meals for quick access</Text>
            </View>
            <View style={styles.proFeatureItem}>
              <Text style={styles.proFeatureText}>• Track unlimited meals per day</Text>
            </View>
            <View style={styles.proFeatureItem}>
              <Text style={styles.proFeatureText}>• AI-generated meal suggestions</Text>
            </View>
            <View style={styles.proFeatureItem}>
              <Text style={styles.proFeatureText}>• Advanced nutrition analytics</Text>
            </View>
          </View>
          
          <Text style={styles.proOfferPrice}>$4.99/month</Text>
          
          <View style={styles.proOfferButtons}>
            <Button
              title="Subscribe Now"
              onPress={() => handleProOffer(true)}
              style={styles.proSubscribeButton}
            />
            <Button
              title="Maybe Later"
              onPress={() => handleProOffer(false)}
              variant="outline"
              style={styles.proLaterButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Logo size="large" />
            <Text style={styles.subtitle}>
              {step === 1 ? "Create your account" : 
               step === 2 ? "Tell us about yourself" : 
               "What's your fitness goal?"}
            </Text>
          </View>
          
          {step === 1 && (
            <View style={styles.form}>
              <Input
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                error={errors.username}
                autoCapitalize="none"
              />
              
              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={errors.confirmPassword}
              />
              
              <View style={styles.loginRedirect}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <Button
                  title="Log In"
                  onPress={handleLoginRedirect}
                  variant="outline"
                  size="small"
                />
              </View>
            </View>
          )}
          
          {step === 2 && (
            <View style={styles.form}>
              <Input
                label="Your Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                error={errors.name}
                autoCapitalize="words"
              />
              
              <Input
                label="Your Age"
                placeholder="Enter your age"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                error={errors.age}
              />
              
              <View style={styles.unitSystemContainer}>
                <Text style={styles.label}>Unit System</Text>
                <View style={styles.unitButtons}>
                  <Button
                    title="Metric (kg)"
                    variant={unitSystem === 'metric' ? 'primary' : 'outline'}
                    onPress={() => setUnitSystem('metric')}
                    style={styles.unitButton}
                  />
                  <Button
                    title="Imperial (lb)"
                    variant={unitSystem === 'imperial' ? 'primary' : 'outline'}
                    onPress={() => setUnitSystem('imperial')}
                    style={styles.unitButton}
                  />
                </View>
              </View>
              
              <Input
                label={`Current Weight (${weightUnit})`}
                placeholder={`Enter your current weight in ${weightUnit}`}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                error={errors.weight}
              />
              
              <Input
                label={`Target Weight (${weightUnit})`}
                placeholder={`Enter your target weight in ${weightUnit}`}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="decimal-pad"
                error={errors.targetWeight}
              />
              
              <View style={styles.genderContainer}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderButtons}>
                  <Button
                    title="Male"
                    variant={gender === 'male' ? 'primary' : 'outline'}
                    onPress={() => setGender('male')}
                    style={styles.genderButton}
                  />
                  <Button
                    title="Female"
                    variant={gender === 'female' ? 'primary' : 'outline'}
                    onPress={() => setGender('female')}
                    style={styles.genderButton}
                  />
                </View>
              </View>
            </View>
          )}
          
          {step === 3 && (
            <View style={styles.form}>
              <Text style={styles.label}>Select Your Goal</Text>
              
              <View style={styles.goalContainer}>
                <Button
                  title="Bulking"
                  variant={goal === 'bulking' ? 'primary' : 'outline'}
                  onPress={() => selectGoal('bulking')}
                  style={styles.goalButton}
                />
                
                <Button
                  title="Maintaining"
                  variant={goal === 'maintaining' ? 'primary' : 'outline'}
                  onPress={() => selectGoal('maintaining')}
                  style={styles.goalButton}
                />
                
                <Button
                  title="Cutting"
                  variant={goal === 'cutting' ? 'primary' : 'outline'}
                  onPress={() => selectGoal('cutting')}
                  style={styles.goalButton}
                />
              </View>
              
              <View style={styles.goalDescription}>
                <Text style={styles.goalTitle}>
                  {goal === 'bulking' ? "Bulking" : 
                   goal === 'cutting' ? "Cutting" : 
                   "Maintaining"}
                </Text>
                <Text style={styles.goalText}>
                  {goal === 'bulking' 
                    ? "Build muscle mass with a calorie surplus. We'll add 500 calories to your daily target."
                    : goal === 'cutting'
                    ? "Lose fat while preserving muscle. We'll reduce your daily target by 500 calories."
                    : "Maintain your current weight and body composition with a balanced calorie intake."
                  }
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.navigationButtons}>
            {step > 1 && (
              <Button
                title="Back"
                onPress={handlePrevStep}
                variant="outline"
                style={styles.navigationButton}
              />
            )}
            
            {step < 3 ? (
              <Button
                title="Next"
                onPress={handleNextStep}
                style={[
                  styles.navigationButton,
                  step === 1 && styles.singleButton
                ]}
              />
            ) : (
              <Button
                title="Get Started"
                onPress={handleSubmit}
                style={styles.navigationButton}
              />
            )}
          </View>
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
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: 16,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  unitSystemContainer: {
    marginBottom: 16,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  unitButton: {
    flex: 1,
  },
  genderContainer: {
    marginBottom: 24,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
  },
  goalContainer: {
    marginBottom: 24,
  },
  goalButton: {
    marginBottom: 12,
  },
  goalDescription: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: colors.lightText,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  navigationButton: {
    flex: 1,
  },
  singleButton: {
    flex: 1,
  },
  loginRedirect: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 8,
  },
  proOfferContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proOfferTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  proOfferSubtitle: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 24,
  },
  proFeatures: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  proFeatureItem: {
    marginBottom: 12,
  },
  proFeatureText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  proOfferPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 24,
  },
  proOfferButtons: {
    width: '100%',
    gap: 12,
  },
  proSubscribeButton: {
    marginBottom: 12,
  },
  proLaterButton: {},
});