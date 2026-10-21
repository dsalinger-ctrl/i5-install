import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { SignIn } from '@/components/sign-in';
import { TabBar } from '@/components/tab-bar';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/state/auth';
import { DayProvider } from '@/state/day';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({ Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold });

  if (!fontsLoaded && !fontError) return null;

  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{ ...base, colors: { ...base.colors, background: c.bg, card: c.surface, primary: c.accent, text: c.ink } }}>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}

/** Sign-in screen until an @i5design.com account is signed in, then the tabs. */
function Gate() {
  const auth = useAuth();

  // Keep the splash up until we know whether someone is already signed in.
  useEffect(() => {
    if (!auth.loading) SplashScreen.hideAsync();
  }, [auth.loading]);

  if (auth.loading) return null;

  if (!auth.signedIn) {
    return (
      <>
        <StatusBar style="light" />
        <SignIn />
      </>
    );
  }

  return (
    <DayProvider>
      <StatusBar style="auto" />
      <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tasks" />
        <Tabs.Screen name="travel" />
        <Tabs.Screen name="ask" />
        <Tabs.Screen name="more" />
      </Tabs>
    </DayProvider>
  );
}
