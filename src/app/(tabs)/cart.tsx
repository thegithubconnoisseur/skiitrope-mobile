import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, money, useTheme } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

export default function CartScreen() {
  const { colors } = useTheme();
  const { token } = useAuth();
  const { cart, busy, refresh, update, remove } = useCart();

  useEffect(() => {
    if (token) {
      refresh();
    }
  }, [token, refresh]);

  if (!token) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          Your cart lives in your account
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Sign in to see the same cart you fill on the website — they stay in sync.
        </Text>
        <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
          <Link href="/(tabs)/account" asChild>
            <Pressable>
              <Button title="Go to Account" onPress={() => {}} />
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  if (!cart) {
    return <View style={[styles.center, { backgroundColor: colors.background }]} />;
  }

  if (cart.items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          Your cart is empty
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
          Items you add here or on the website appear in both places.
        </Text>
        <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
          <Link href="/(tabs)/catalog" asChild>
            <Pressable>
              <Button title="Browse the shop" onPress={() => {}} />
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  const changeQuantity = (productId: number, quantity: number) => {
    update(productId, quantity).catch(() =>
      Alert.alert('Could not update the cart', 'Check your connection and try again.'),
    );
  };

  const removeFromCart = (productId: number) => {
    remove(productId).catch(() => Alert.alert('Could not remove the item.'));
  };

  const freeShipping = cart.shipping === '0.00';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ gap: 12, padding: 16 }}>
        {cart.items.map(({ product, quantity, total }) => (
          <View
            key={product.id}
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, { backgroundColor: colors.backgroundSelected }]} />
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={{ color: colors.red, fontWeight: '700' }}>
                {money(cart.currency_symbol, total)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    disabled={busy}
                    onPress={() => changeQuantity(product.id, quantity - 1)}
                    style={[styles.stepper, { borderColor: colors.border }]}>
                    <Text style={{ color: colors.text, fontSize: 18 }}>–</Text>
                  </Pressable>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{quantity}</Text>
                  <Pressable
                    disabled={busy}
                    onPress={() => changeQuantity(product.id, quantity + 1)}
                    style={[styles.stepper, { borderColor: colors.border }]}>
                    <Text style={{ color: colors.text, fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => removeFromCart(product.id)} disabled={busy}>
                  <Text style={{ color: colors.textSecondary }}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={[styles.summary, { borderColor: colors.border, backgroundColor: colors.background }]}>
        {!freeShipping && (
          <Text style={{ color: colors.blue, fontSize: 13, marginBottom: 8 }}>
            Add {money(cart.currency_symbol, cart.free_shipping_remaining)} more for free shipping.
          </Text>
        )}
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
          <Text style={{ color: colors.text }}>{money(cart.currency_symbol, cart.subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.textSecondary }}>Shipping</Text>
          <Text style={{ color: colors.text }}>
            {freeShipping ? 'Free' : money(cart.currency_symbol, cart.shipping)}
          </Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 6 }]}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>Total</Text>
          <Text style={{ color: colors.red, fontWeight: '800', fontSize: 17 }}>
            {money(cart.currency_symbol, cart.total)}
          </Text>
        </View>
        <Link href="/checkout" asChild>
          <Pressable disabled={busy}>
            <Button title="Checkout" onPress={() => {}} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  stepper: {
    borderWidth: 1,
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    borderTopWidth: 1,
    padding: 16,
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
