import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, money, useTheme } from '@/components/ui';
import { Order, getOrders } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

const STATUS_COLORS: Record<string, string> = {
  pending: '#b45309',
  paid: '#1f8a4c',
  shipped: '#2f6bff',
  cancelled: '#e8112d',
};

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { token } = useAuth();
  const { refresh: refreshCart } = useCart();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token) {
      setOrders([]);
      return;
    }
    try {
      setOrders(await getOrders(token));
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    const focus = setInterval(load, 30_000);
    load();
    return () => clearInterval(focus);
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
      await refreshCart();
    } finally {
      setRefreshing(false);
    }
  };

  if (!token) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          Sign in to see your orders
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
          Every order you place — app or website — shows up here.
        </Text>
      </View>
    );
  }

  if (orders === null) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.red} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>No orders yet</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
          Your order history will appear here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
      }>
      {orders.map((order) => (
        <View key={order.number} style={[styles.card, { borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{order.number}</Text>
            <Text
              style={{
                color: STATUS_COLORS[order.status] ?? colors.textSecondary,
                fontWeight: '700',
                textTransform: 'uppercase',
                fontSize: 12,
              }}>
              {order.status}
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            {new Date(order.created_at).toLocaleDateString()} · {order.email}
          </Text>
          <View style={{ marginTop: 8, gap: 2 }}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>
                  {item.quantity} × {item.product_name}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {money('$', item.line_total)}
                </Text>
              </View>
            ))}
          </View>
          <View style={[styles.itemRow, { marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8 }]}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Total</Text>
            <Text style={{ color: colors.red, fontWeight: '800' }}>
              {money('$', order.total)} {order.currency}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});
