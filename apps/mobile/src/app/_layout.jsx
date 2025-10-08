import { useAuth } from "@/utils/auth/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts, LibreBodoni_400Regular, LibreBodoni_700Bold } from "@expo-google-fonts/libre-bodoni";
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
  
  // Load Libre Bodoni for entire app
  const [fontsLoaded, fontError] = useFonts({
    LibreBodoni_400Regular,
    LibreBodoni_700Bold,
  });

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (fontError) {
      console.error('❌ Font loading error:', fontError);
    }
    if (fontsLoaded) {
      const prev = Text.defaultProps?.style;
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = Array.isArray(prev)
        ? [...prev, { fontFamily: 'LibreBodoni_400Regular' }]
        : [prev || {}, { fontFamily: 'LibreBodoni_400Regular' }];
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
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
