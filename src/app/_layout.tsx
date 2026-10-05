import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/components/ui';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colors, mode } = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[slug]" options={{ title: 'Product' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
