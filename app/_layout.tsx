import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/stores/userStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

export const unstable_settings = {
  initialRouteName: "index",
};

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const isOnboarded = useUserStore(state => state.isOnboarded);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerShadowVisible: false,
      }}
    >
      {!isOnboarded ? (
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: "Sign Up" 
          }} 
        />
      ) : !isLoggedIn ? (
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            title: "Log In" 
          }} 
        />
      ) : (
        <>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="add-manual" 
            options={{ 
              presentation: "modal",
              title: "Add Food Manually" 
            }} 
          />
          <Stack.Screen 
            name="scan-food" 
            options={{ 
              presentation: "fullScreenModal",
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="profile" 
            options={{ 
              title: "Update Progress" 
            }} 
          />
        </>
      )}
    </Stack>
  );
}