import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Field, money, useTheme } from '@/components/ui';
import { ApiError, CheckoutPayload, checkout } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { token, user } = useAuth();
  const { cart, refresh } = useCart();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<CheckoutPayload>({
    email: user?.email ?? '',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'NG',
  });

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((current) => ({ ...current, email: user.email }));
    }
  }, [user]);

  if (!token) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          Sign in to check out
        </Text>
        <Button title="Go to Account" onPress={() => router.replace('/(tabs)/account')} />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          Your cart is empty
        </Text>
        <Button title="Browse the shop" onPress={() => router.replace('/(tabs)/catalog')} />
      </View>
    );
  }

  const set = (key: keyof CheckoutPayload) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const result = await checkout(token, form);
      await WebBrowser.openBrowserAsync(result.checkout_url);
      await refresh();
      Alert.alert(
        'Order placed',
        `Order ${result.order_number} — if you completed payment, it will show under Orders once confirmed.`,
        [{ text: 'View orders', onPress: () => router.replace('/(tabs)/orders') }],
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && error.data.errors) {
        const errors = error.data.errors as Record<string, string[]>;
        const first = Object.values(errors)[0];
        Alert.alert('Check your details', Array.isArray(first) ? first[0] : 'Some details are missing.');
      } else {
        const message = error instanceof ApiError ? error.message : 'Could not start checkout.';
        Alert.alert('Checkout failed', message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      <View style={[styles.summary, { borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Order summary</Text>
        {cart.items.map(({ product, quantity, total }) => (
          <View key={product.id} style={styles.row}>
            <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>
              {quantity} × {product.name}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {money(cart.currency_symbol, total)}
            </Text>
          </View>
        ))}
        <View style={[styles.row, { marginTop: 6 }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Total</Text>
          <Text style={{ color: colors.red, fontWeight: '800' }}>
            {money(cart.currency_symbol, cart.total)}
          </Text>
        </View>
      </View>

      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
        Delivery details
      </Text>
      <View style={{ gap: 12 }}>
        <Field label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Full name" value={form.full_name} onChangeText={set('full_name')} placeholder="Ava Rider" />
        <Field label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="+234 800 000 0000" keyboardType="phone-pad" />
        <Field label="Address line 1" value={form.address_line1} onChangeText={set('address_line1')} placeholder="12 Slope Street" />
        <Field label="Address line 2 (optional)" value={form.address_line2} onChangeText={set('address_line2')} />
        <Field label="City" value={form.city} onChangeText={set('city')} placeholder="Lagos" />
        <Field label="State / Region" value={form.state} onChangeText={set('state')} placeholder="Lagos" />
        <Field label="Postal code" value={form.postal_code} onChangeText={set('postal_code')} placeholder="100001" />
        <Field label="Country (2-letter code)" value={form.country} onChangeText={set('country')} autoCapitalize="characters" placeholder="NG" />
      </View>

      <Button title={busy ? 'Starting checkout…' : 'Continue to payment'} onPress={handleSubmit} disabled={busy} />
      <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
        Payment runs on Stripe's secure page — the same one the website uses.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  summary: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});
