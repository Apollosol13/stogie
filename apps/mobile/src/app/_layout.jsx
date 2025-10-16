import { useAuth } from "@/utils/auth/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import HealthWarningModal from "@/components/auth/HealthWarningModal";
import { Stack, usePathname, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Text } from "react-native";
import { PostHogProvider, usePostHog } from 'posthog-react-native';
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

// PostHog Screen Tracking Component
function PostHogScreenTracker() {
  const pathname = usePathname();
  const segments = useSegments();
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog && pathname) {
      // Get a clean screen name
      const screenName = pathname === '/' ? 'index' : pathname.replace(/^\//, '');
      
      // Capture screen view event
      posthog.screen(screenName, {
        pathname,
        segments: segments.join('/'),
      });
      
      console.log(`📊 PostHog: Screen viewed - ${screenName}`);
    }
  }, [pathname, posthog]);

  return null;
}

export default function RootLayout() {
  const { initiate, isReady, isAuthenticated } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showHealthWarning, setShowHealthWarning] = useState(false);
  const [healthWarningChecked, setHealthWarningChecked] = useState(false);

  useEffect(() => {
    initiate();
  }, [initiate]);

  // Check if we should show health warning after signup
  useEffect(() => {
    async function checkHealthWarningAcknowledged() {
      try {
        const needsWarning = await SecureStore.getItemAsync('showHealthWarningOnNextLaunch');
        setHealthWarningChecked(true);
        
        // Show warning if flagged (happens after signup)
        if (needsWarning === 'true') {
          setShowHealthWarning(true);
        }
      } catch (error) {
        console.error('Error checking health warning:', error);
        setHealthWarningChecked(true);
      }
    }
    
    if (isReady) {
      checkHealthWarningAcknowledged();
    }
  }, [isReady, isAuthenticated]);

  const handleHealthWarningAcknowledge = async () => {
    try {
      // Clear the flag so it never shows again
      await SecureStore.deleteItemAsync('showHealthWarningOnNextLaunch');
      setShowHealthWarning(false);
      console.log('✅ Health warning acknowledged (one-time)');
    } catch (error) {
      console.error('Error saving health warning acknowledgment:', error);
    }
  };

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
    // Wait for auth, fonts, AND health warning check before hiding splash screen
    if (isReady && fontsLoaded && healthWarningChecked) {
      SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded, healthWarningChecked]);

  // Don't render until auth, fonts, AND health warning check are ready
  if (!isReady || !fontsLoaded || !healthWarningChecked) {
    return null;
  }

  return (
    <PostHogProvider
      apiKey="phc_TbCqACccxwu8A8pA89IAMKIi54oKEZ6BJ83Y6iEDFD3"
      options={{
        host: "https://us.i.posthog.com",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PostHogScreenTracker />
          <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
          </Stack>
          <AuthModal />
          <HealthWarningModal
            visible={showHealthWarning}
            onAcknowledge={handleHealthWarningAcknowledge}
          />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
