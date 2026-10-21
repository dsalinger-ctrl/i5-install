import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { ALLOWED_DOMAIN, isAllowedEmail, supabase, supabaseConfigured } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type Me = { email: string; name: string; firstName: string; initials: string };

function meFrom(session: Session | null): Me | null {
  const u = session?.user;
  if (!u?.email) return null;
  const meta = u.user_metadata ?? {};
  const name: string = meta.full_name || meta.name || u.email.split('@')[0];
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  return { email: u.email, name, firstName: parts[0] ?? name, initials };
}

function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Phase 1 testing before Supabase is set up: run on sample data without signing in (dev builds only).
  const [sampleMode, setSampleMode] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  // Belt and braces: never keep a session for an account outside I-5.
  useEffect(() => {
    if (session && !isAllowedEmail(session.user.email)) supabase.auth.signOut();
  }, [session]);

  async function signInWithGoogle() {
    setError(null);
    setBusy(true);
    try {
      // exp://…/--/auth/callback in Expo Go, i5install://auth/callback in builds.
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          // hd pre-filters Google's account picker to I-5 accounts.
          queryParams: { hd: ALLOWED_DOMAIN, prompt: 'select_account' },
        },
      });
      if (oauthError || !data.url) throw oauthError ?? new Error('No sign-in URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return; // cancelled or dismissed

      const { queryParams } = Linking.parse(result.url);
      const code = typeof queryParams?.code === 'string' ? queryParams.code : undefined;
      const denied = typeof queryParams?.error_description === 'string' ? queryParams.error_description : undefined;
      if (!code) throw new Error(denied ?? 'Google sign-in did not finish.');

      const { data: exchanged, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
      if (!isAllowedEmail(exchanged.session?.user.email)) {
        await supabase.auth.signOut();
        throw new Error(`Sign in with your @${ALLOWED_DOMAIN} account.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return {
    configured: supabaseConfigured,
    loading,
    busy,
    error,
    me: meFrom(session),
    signedIn: (!!session && isAllowedEmail(session.user.email)) || sampleMode,
    sampleMode,
    useSampleData: () => setSampleMode(true),
    signInWithGoogle,
    signOut: async () => {
      setSampleMode(false);
      if (supabaseConfigured) await supabase.auth.signOut();
    },
  };
}

export type Auth = ReturnType<typeof useAuthState>;

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>');
  return auth;
}
