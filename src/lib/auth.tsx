import * as WebBrowser from 'expo-web-browser';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { ApiError, User, loginWithEmail, logout as apiLogout } from './api';
import { API_BASE_URL, AUTH_REDIRECT_URL } from './config';
import { deleteItem, getItem, setItem } from './storage';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'skiitrope.token';
const USER_KEY = 'skiitrope.user';

type AuthState = {
  loading: boolean;
  token: string | null;
  user: User | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/** URL that starts the site's normal Google login and ends at the
 *  mobile handoff view, which deep-links back with a token. */
function googleLoginUrl() {
  const finish = `${API_BASE_URL}/api/auth/mobile/finish/`;
  return `${API_BASE_URL}/accounts/google/login/?next=${encodeURIComponent(finish)}`;
}

function parseTokenFromDeepLink(url: string): { token: string; email: string } | null {
  try {
    const parsed = new URL(url);
    const token = parsed.searchParams.get('token');
    const email = parsed.searchParams.get('email');
    if (token) {
      return { token, email: email ?? '' };
    }
  } catch {
    return null;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const storedToken = await getItem(TOKEN_KEY);
      const storedUser = await getItem(USER_KEY);
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (newToken: string, newUser: User | null) => {
    await setItem(TOKEN_KEY, newToken);
    if (newUser) {
      await setItem(USER_KEY, JSON.stringify(newUser));
    } else {
      await deleteItem(USER_KEY);
    }
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const result = await loginWithEmail(email.trim(), password);
      await persist(result.token, result.user);
    },
    [persist],
  );

  const signInWithGoogle = useCallback(async () => {
    const result = await WebBrowser.openAuthSessionAsync(
      googleLoginUrl(),
      AUTH_REDIRECT_URL,
    );
    if (result.type !== 'success' || !result.url) {
      return;
    }
    const parsed = parseTokenFromDeepLink(result.url);
    if (!parsed) {
      return;
    }
    await persist(parsed.token, parsed.email ? { email: parsed.email, first_name: '', last_name: '' } : null);
  }, [persist]);

  const signOut = useCallback(async () => {
    if (token) {
      try {
        await apiLogout(token);
      } catch (error) {
        if (!(error instanceof ApiError)) {
          Alert.alert('Could not reach the server', 'You were signed out on this device anyway.');
        }
      }
    }
    await deleteItem(TOKEN_KEY);
    await deleteItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(
    () => ({ loading, token, user, signInWithEmail, signInWithGoogle, signOut }),
    [loading, token, user, signInWithEmail, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
