import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, useTheme } from '@/components/ui';
import { Product, getProduct } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { API_BASE_URL } from '@/lib/config';

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { token } = useAuth();
  const { add, refresh } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getProduct(slug)
      .then(setProduct)
      .catch(() => setError('Could not load this product.'));
  }, [slug]);

  const handleAdd = async () => {
    if (!token) {
      Alert.alert(
        'Sign in to add items',
        'Your cart is tied to your account so it syncs between the app and the website.',
      );
      return;
    }
    setAdding(true);
    try {
      await add(product!.id);
      await refresh();
      Alert.alert('Added to cart', 'Your cart is synced with the website too.');
    } catch {
      Alert.alert('Could not add the item', 'Check your connection and try again.');
    } finally {
      setAdding(false);
    }
  };

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>{error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.red} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: product.name }} />
      {product.image ? (
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View
          style={[styles.image, { backgroundColor: colors.backgroundElement, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: colors.textSecondary }}>No image</Text>
        </View>
      )}

      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
          {product.category.name}
        </Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>
          {product.name}
        </Text>
        <Text style={{ color: colors.red, fontSize: 24, fontWeight: '800' }}>
          ${product.price}
        </Text>
        <Text
          style={{
            color: product.in_stock ? colors.success : colors.redDark,
            fontWeight: '700',
          }}>
          {product.in_stock ? `In stock (${product.stock} left)` : 'Out of stock'}
        </Text>
      </View>

      {product.description ? (
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
          {product.description}
        </Text>
      ) : null}

      <Button
        title={adding ? 'Adding…' : 'Add to cart'}
        onPress={handleAdd}
        disabled={adding || !product.in_stock}
      />

      <Text
        style={{ color: colors.blue, textAlign: 'center', marginTop: 8 }}
        onPress={() => Linking.openURL(API_BASE_URL)}>
        Open the full website
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
});
