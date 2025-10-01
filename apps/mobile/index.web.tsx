import '@expo/metro-runtime';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import StogieCigarApp from './App';

LoadSkiaWeb().then(async () => {
  renderRootComponent(StogieCigarApp);
});
