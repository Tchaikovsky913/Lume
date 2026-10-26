import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LumeColors } from '@/constants/lume';
import { DatabaseProvider } from '@/database/DatabaseProvider';

import { useFonts } from 'expo-font';
import { Lexend_400Regular } from '@expo-google-fonts/lexend';
import { Andika_400Regular } from '@expo-google-fonts/andika';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontesCarregadas] = useFonts({
  Lexend: Lexend_400Regular,
  Andika: Andika_400Regular,
  OpenDyslexic: require('../../assets/fonts/OpenDyslexic-Regular.otf'),
});
if (!fontesCarregadas) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <DatabaseProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: LumeColors.fundo } }}
        />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
