import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Product, ProductCard, useTheme } from '@/components/ui';
import { Category, getCategories, getProducts } from '@/lib/api';
import { SHOP_NAME } from '@/lib/config';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [products, cats] = await Promise.all([getProducts(), getCategories()]);
      setFeatured(products.filter((p) => p.is_featured).slice(0, 6));
      setCategories(cats);
    } catch {
      setError('Could not load the shop. Pull to retry.');
      setFeatured((current) => current);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
      }>
      <View style={styles.hero}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{SHOP_NAME}</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Gear up for the slopes.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Shop by category</Text>
      <View style={styles.chips}>
        {categories.map((category) => (
          <Link key={category.id} href={`/catalog?category=${category.slug}`} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.chip,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={{ color: colors.blue, fontWeight: '600' }}>{category.name}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured gear</Text>
      {error ? <Text style={{ color: colors.textSecondary }}>{error}</Text> : null}
      {featured === null ? (
        <ActivityIndicator color={colors.red} style={{ marginVertical: 24 }} />
      ) : (
        <FlatList
          data={featured}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <Link href={`/product/${item.slug}`} asChild>
              <Pressable style={{ flex: 1 }}>
                <ProductCard product={item} onPress={() => {}} />
              </Pressable>
            </Link>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  hero: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
