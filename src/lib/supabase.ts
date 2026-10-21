import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

/**
 * Supabase client. The URL and publishable key are public by design (row-level security protects the data).
 * Third-party keys (Trello, Google, Zoom, Procore, Paychex) never go here; they live in edge functions.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabaseConfigured = Boolean(url && key);

export const supabase = createClient(url ?? 'https://not-configured.supabase.co', key ?? 'not-configured', {
  auth: {
    storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Refresh tokens only while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** Only I-5 Google Workspace accounts may sign in. Also enforced by Google (Internal app) and a database trigger. */
export const ALLOWED_DOMAIN = 'i5design.com';

export function isAllowedEmail(email?: string | null) {
  return !!email && email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}
