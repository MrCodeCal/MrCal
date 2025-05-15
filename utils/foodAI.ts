import { Platform } from 'react-native';

interface AIResponse {
  completion: string;
}

export const analyzeFoodImage = async (imageBase64: string): Promise<{ 
  name: string; 
  calories: number; 
  protein: number;
  carbs?: number;
  fats?: number;
}> => {
  try {
    // Skip AI processing on web platform
    if (Platform.OS === 'web') {
      return {
        name: "Sample Food Item",
        calories: 350,
        protein: 15,
        carbs: 30,
        fats: 12
      };
    }
    
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert that analyzes food images. Provide the name of the food, estimated calories, protein content in grams, carbs in grams, and fats in grams. Return ONLY a JSON object with fields: name, calories (number), protein (number), carbs (number), fats (number).'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What food is in this image? Estimate calories, protein, carbs, and fats content.'
              },
              {
                type: 'image',
                image: imageBase64
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze food image');
    }

    const data: AIResponse = await response.json();
    
    // Parse the completion as JSON
    try {
      const result = JSON.parse(data.completion);
      return {
        name: result.name || "Unknown Food",
        calories: Number(result.calories) || 0,
        protein: Number(result.protein) || 0,
        carbs: Number(result.carbs) || 0,
        fats: Number(result.fats) || 0
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to default values
      return {
        name: "Unknown Food",
        calories: 200,
        protein: 5,
        carbs: 20,
        fats: 8
      };
    }
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};