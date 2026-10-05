# Skiitrope Mobile

The official Android app for the [Skiitrope](https://ski-shop-paqi.onrender.com) ski and
snowboard shop. Built with Expo / React Native, talking to the same Django backend that
powers the website.

## What it does

- Browse the full catalogue, search, and filter by category
- Sign in with **Google** or email + password (same accounts as the website)
- **Synced cart** — the cart lives in your account on the server, so items added on the
  website appear in the app, and items added in the app appear on the website
- Checkout through Stripe's secure hosted payment page
- Order history for your account

## Project layout

```
src/
  app/            expo-router screens (tabs, product detail, checkout)
  components/     shared UI components
  constants/      theme colors (Skiitrope brand palette)
  lib/            API client, auth + cart state, config
```

## Configuration

The backend URL is set in `app.json` under `expo.extra.apiUrl` (defaults to the deployed
Render site). To develop against a local Django server, change it there — on the Android
emulator use `http://10.0.2.2:8000`.

## Running locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or an emulator.

## Building the APK

```bash
npx eas login        # free Expo account
npx eas build -p android --profile preview
```

EAS builds a signed APK in the cloud and gives you a download link you can share.

## Deep link

The app registers the `skiitropemobile://` scheme. Website sign-in finishes at
`/api/auth/mobile/finish/`, which hands the app its auth token via
`skiitropemobile://auth?token=…`.
