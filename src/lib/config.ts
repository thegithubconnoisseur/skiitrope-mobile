import Constants from 'expo-constants';

/**
 * Base URL of the Skiitrope backend. The deployed Render site is the
 * default; during development you can point it at a local server
 * (Android emulator: http://10.0.2.2:8000) via `extra.apiUrl` in app.json.
 */
export const API_BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ?? 'https://ski-shop-paqi.onrender.com';

/** Deep link the server uses to hand the app its auth token. */
export const AUTH_REDIRECT_URL = 'skiitropemobile://auth';

export const SHOP_NAME = 'Skiitrope';
