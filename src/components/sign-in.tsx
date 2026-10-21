import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { Tap } from '@/components/ui';
import { Brand, Fonts, Radius } from '@/constants/theme';
import { ALLOWED_DOMAIN } from '@/lib/supabase';
import { useAuth } from '@/state/auth';

/** Shown until someone signs in with their I-5 Google account. Matches the splash: the panel on navy. */
export function SignIn() {
  const auth = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.brand}>
        <Panel />
        <Text style={styles.name}>I-5 Install</Text>
        <Text style={styles.tag}>CUSTOM DECOR · INSTALLED RIGHT</Text>
      </View>

      <View style={styles.bottom}>
        {auth.error ? <Text style={styles.error}>{auth.error}</Text> : null}

        {auth.configured ? (
          <Tap
            onPress={auth.signInWithGoogle}
            disabled={auth.busy}
            accessibilityRole="button"
            style={styles.btn}>
            {auth.busy ? (
              <ActivityIndicator color={Brand.blue} />
            ) : (
              <Text style={styles.btnText}>Continue with Google</Text>
            )}
          </Tap>
        ) : (
          <Text style={styles.note}>Sign-in isn&apos;t set up yet. Supabase keys go in .env.local.</Text>
        )}

        <Text style={styles.note}>Use your @{ALLOWED_DOMAIN} account.</Text>

        {__DEV__ && !auth.configured ? (
          <Tap onPress={auth.useSampleData} accessibilityRole="button" style={styles.ghost}>
            <Text style={styles.ghostText}>Use sample data</Text>
          </Tap>
        ) : null}
      </View>
    </View>
  );
}

/** The app icon's "panel": gold outer frame, thin white inner frame, I-5. */
function Panel() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120" accessibilityLabel="I-5">
      <Rect x="28" y="28" width="64" height="64" fill="none" stroke={Brand.gold} strokeWidth={3.2} />
      <Rect x="38" y="38" width="44" height="44" fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.55} />
      <SvgText x="60" y="67" textAnchor="middle" fontFamily={Fonts.semibold} fontSize="17" fill="#FFFFFF" letterSpacing="1">
        I-5
      </SvgText>
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Brand.navy, paddingHorizontal: 24, justifyContent: 'space-between' },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  name: { fontFamily: Fonts.bold, color: '#FFFFFF', fontSize: 24, letterSpacing: 0.5 },
  tag: { fontFamily: Fonts.semibold, color: Brand.gold, fontSize: 12, letterSpacing: 1.9 },
  bottom: { gap: 12 },
  btn: {
    minHeight: 56,
    borderRadius: Radius.button,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: Brand.blue, fontSize: 17, fontWeight: '700' },
  ghost: {
    minHeight: 50,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Brand.heroLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  note: { color: Brand.heroSub, fontSize: 14, textAlign: 'center' },
  error: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(163,45,45,0.85)',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});
