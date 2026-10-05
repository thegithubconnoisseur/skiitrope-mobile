import { Link, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Product, ProductCard, useTheme } from '@/components/ui';
import { Category, getCategories, getProducts } from '@/lib/api';
export default function CatalogScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const activeCategory = params.category ?? '';

  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setProducts(null);
    const data = await getProducts({ category: activeCategory, q: query });
    setProducts(data);
  }, [activeCategory, query]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load().catch(() => setProducts([]));
    }, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search gear…"
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.search,
          { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
        ]}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: 0, name: 'All', slug: '' }, ...categories]}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
        renderItem={({ item }) => {
          const selected = item.slug === activeCategory;
          return (
            <Pressable
              onPress={() =>
                router.replace(item.slug ? `/catalog?category=${item.slug}` : '/catalog')
              }
              style={[
                styles.chip,
                {
                  borderColor: selected ? colors.red : colors.border,
                  backgroundColor: selected ? colors.red : 'transparent',
                },
              ]}>
              <Text
                style={{
                  color: selected ? '#fff' : colors.blue,
                  fontWeight: '600',
                }}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      {products === null ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: 32 }} />
      ) : products.length === 0 ? (
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 32 }}>
          Nothing matches that search.
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Link href={`/product/${item.slug}`} asChild>
              <Pressable style={{ flex: 1 }}>
                <ProductCard product={item} onPress={() => {}} />
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  search: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
