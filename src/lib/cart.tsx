import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Cart, addToCart, getCart, removeCartItem, updateCartItem } from './api';
import { useAuth } from './auth';

type CartState = {
  cart: Cart | null;
  busy: boolean;
  refresh: () => Promise<void>;
  add: (productId: number, quantity?: number) => Promise<void>;
  update: (productId: number, quantity: number) => Promise<void>;
  remove: (productId: number) => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    try {
      setCart(await getCart(token));
    } catch {
      setCart(null);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (action: () => Promise<Cart>) => {
      if (!token) {
        throw new Error('Sign in to use your cart.');
      }
      setBusy(true);
      try {
        setCart(await action());
      } finally {
        setBusy(false);
      }
    },
    [token],
  );

  const add = useCallback(
    (productId: number, quantity = 1) =>
      mutate(() => addToCart(token!, productId, quantity)),
    [mutate, token],
  );

  const update = useCallback(
    (productId: number, quantity: number) =>
      mutate(() => updateCartItem(token!, productId, quantity)),
    [mutate, token],
  );

  const remove = useCallback(
    (productId: number) => mutate(() => removeCartItem(token!, productId)),
    [mutate, token],
  );

  const value = useMemo(
    () => ({ cart, busy, refresh, add, update, remove }),
    [cart, busy, refresh, add, update, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
