import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Field, useTheme } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

export default function AccountScreen() {
  const { colors } = useTheme();
  const { loading, token, user, signInWithEmail, signInWithGoogle, signOut } = useAuth();
  const { refresh: refreshCart } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.red} />
      </View>
    );
  }

  if (token && user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>
          {user.email}
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
          Your cart and orders are synced with the website.
        </Text>
        <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
          <Button
            title="Sign out"
            variant="secondary"
            onPress={() => {
              signOut().then(refreshCart);
            }}
          />
        </View>
      </View>
    );
  }

  const handleEmailLogin = async () => {
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      await refreshCart();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Could not sign in. Try again.';
      Alert.alert('Sign in failed', message);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
      await refreshCart();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
        Welcome back
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 6,
          marginBottom: 12,
        }}>
        Sign in with the same account you use on the website — your cart follows you.
      </Text>

      <Pressable
        onPress={handleGoogleLogin}
        disabled={busy}
        style={({ pressed }) => [
          styles.googleButton,
          { borderColor: colors.border, opacity: busy ? 0.6 : pressed ? 0.85 : 1 },
        ]}>
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
          Continue with Google
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={{ color: colors.textSecondary }}>or with email</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <View style={{ gap: 12 }}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
        />
        <Button
          title={busy ? 'Signing in…' : 'Sign in'}
          onPress={handleEmailLogin}
          disabled={busy || !email || !password}
        />
        <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
          New here? Create an account first on ski-shop-paqi.onrender.com, then sign in.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  googleButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
