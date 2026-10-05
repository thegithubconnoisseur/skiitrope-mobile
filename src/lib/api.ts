import { API_BASE_URL } from './config';

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>, message: string) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Options = {
  method?: 'GET' | 'POST';
  token?: string | null;
  body?: Record<string, unknown>;
};

export async function api<T = Record<string, unknown>>(
  path: string,
  { method = 'GET', token, body }: Options = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }

  if (!response.ok) {
    const detail = typeof data.detail === 'string' ? data.detail : 'Request failed.';
    throw new ApiError(response.status, data, detail);
  }
  return data as T;
}

// --- Types mirroring the backend serializers ------------------------------

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string | null;
  stock: number;
  in_stock: boolean;
  is_featured: boolean;
  category: Category;
  description?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  price: string;
  total: string;
};

export type Cart = {
  items: CartItem[];
  count: number;
  subtotal: string;
  shipping: string;
  free_shipping_remaining: string;
  total: string;
  currency: string;
  currency_symbol: string;
};

export type User = {
  email: string;
  first_name: string;
  last_name: string;
};

export type OrderItem = {
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type Order = {
  number: string;
  status: string;
  email: string;
  subtotal: string;
  shipping: string;
  total: string;
  currency: string;
  created_at: string;
  items: OrderItem[];
};

// --- Endpoint helpers ------------------------------------------------------

export const getProducts = (params: { category?: string; q?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.q) query.set('q', params.q);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return api<Product[]>(`/api/products/${suffix}`);
};

export const getProduct = (slug: string) => api<Product>(`/api/products/${slug}/`);

export const getCategories = () => api<Category[]>('/api/categories/');

export const getCart = (token: string) =>
  api<Cart>('/api/cart/', { token });

export const addToCart = (token: string, productId: number, quantity = 1) =>
  api<Cart>('/api/cart/add/', {
    method: 'POST',
    token,
    body: { product_id: productId, quantity },
  });

export const updateCartItem = (token: string, productId: number, quantity: number) =>
  api<Cart>('/api/cart/update/', {
    method: 'POST',
    token,
    body: { product_id: productId, quantity },
  });

export const removeCartItem = (token: string, productId: number) =>
  api<Cart>('/api/cart/remove/', {
    method: 'POST',
    token,
    body: { product_id: productId },
  });

export const loginWithEmail = (email: string, password: string) =>
  api<{ token: string; user: User }>('/api/auth/login/', {
    method: 'POST',
    body: { email, password },
  });

export const logout = (token: string) =>
  api('/api/auth/logout/', { method: 'POST', token });

export const getOrders = (token: string) =>
  api<Order[]>('/api/orders/', { token });

export type CheckoutPayload = {
  email: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export const checkout = (token: string, payload: CheckoutPayload) =>
  api<{ checkout_url: string; order_number: string }>('/api/checkout/', {
    method: 'POST',
    token,
    body: payload,
  });
