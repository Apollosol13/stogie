import { useAuth } from "@/utils/auth/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Text } from "react-native";
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  
  // Load Adamina font for entire app from local asset
  const [fontsLoaded, fontError] = useFonts({
    Adamina_400Regular: require("../assets/fonts/Adamina_400Regular.ttf"),
  });

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (fontError) {
      console.error('❌ Font loading error:', fontError);
      console.log('⚠️  App will use system font instead');
    }
    if (fontsLoaded) {
      console.log('✅ Adamina font loaded successfully');
      // Set as default font for all Text components
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = { fontFamily: 'Adamina_400Regular' };
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Show app when auth is ready (don't wait for font - it's optional)
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
        </Stack>
        <AuthModal />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
