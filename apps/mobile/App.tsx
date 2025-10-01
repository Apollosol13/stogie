import { App } from 'expo-router/build/qualified-entry';
import React, { memo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { AlertModal } from './polyfills/web/alerts.web';
import './global.css';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // You can customize this error UI
    }
    return this.props.children;
  }
}

const Wrapper = memo(() => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider
        initialMetrics={{
          insets: { top: 64, bottom: 34, left: 0, right: 0 },
          frame: {
            x: 0,
            y: 0,
            width: typeof window === 'undefined' ? 390 : window.innerWidth,
            height: typeof window === 'undefined' ? 844 : window.innerHeight,
          },
        }}
      >
        <App />
        <Toaster />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
});

const StogieCigarApp = () => {
  return (
    <>
      <Wrapper />
      <AlertModal />
    </>
  );
};

export default StogieCigarApp;
