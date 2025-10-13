import { useAuth } from "@/utils/auth/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
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
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          LibreBodoni_400Regular: require('../../assets/fonts/LibreBodoni-Regular.ttf'),
          LibreBodoni_700Bold: require('../../assets/fonts/LibreBodoni-Bold.ttf'),
        });
        console.log('✅ Libre Bodoni fonts loaded successfully from local files');
        
        // Set as default font for all Text components
        const prev = Text.defaultProps?.style;
        Text.defaultProps = Text.defaultProps || {};
        Text.defaultProps.style = Array.isArray(prev)
          ? [...prev, { fontFamily: 'LibreBodoni_400Regular' }]
          : [prev || {}, { fontFamily: 'LibreBodoni_400Regular' }];
        
        setFontsLoaded(true);
      } catch (error) {
        console.error('❌ Font loading error:', error);
        console.log('⚠️  App will use system font instead');
        setFontsLoaded(true); // Continue anyway with system font
      }
    }
    loadFonts();
  }, []);

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
