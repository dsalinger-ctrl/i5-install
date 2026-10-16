import { Alert, Pressable, ScrollView, StyleSheet, Text, View, type PressableProps, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, TabBarHeight } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Small uppercase, letter-spaced Montserrat label. */
export function Eyebrow({ children, color, style }: { children: React.ReactNode; color?: string; style?: TextStyle }) {
  const t = useTheme();
  return <Text style={[styles.eyebrow, { color: color ?? t.sub }, style]}>{children}</Text>;
}

export function Title({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <Text style={[styles.h1, { color: t.ink }]}>{children}</Text>;
}

export type Tone = 'amber' | 'red' | 'ok' | 'blue';

export function Pill({ label, tone, style }: { label: string; tone: Tone; style?: TextStyle }) {
  const t = useTheme();
  const colors: Record<Tone, [string, string]> = {
    amber: [t.amberBg, t.amberInk],
    // Red reads louder: filled with the ink color.
    red: [t.redInk, t.redBg],
    ok: [t.okBg, t.okInk],
    blue: [t.tint, t.accent],
  };
  const [bg, fg] = colors[tone];
  return <Text style={[styles.pill, { backgroundColor: bg, color: fg }, style]}>{label}</Text>;
}

/** Pressable that shrinks slightly while held, like the prototype's tiles. */
export function Tap({ style, ...props }: PressableProps & { style?: PressableProps['style'] }) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
      ]}
    />
  );
}

/** Scrolling page that clears the status bar and the floating tab bar. */
export function Screen({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={[
        styles.screen,
        { paddingTop: insets.top + 10, paddingBottom: TabBarHeight + Math.max(insets.bottom, 18) + 24 },
      ]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function Header({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.hdr}>
      <View style={{ flex: 1 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
      </View>
      {right}
    </View>
  );
}

/** Placeholder for actions whose screens land in a later build phase. */
export function comingSoon(feature: string, phase: number) {
  Alert.alert(feature, `Not built yet (Phase ${phase}). This build uses sample data.`);
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 16, gap: 10, flexGrow: 1 },
  hdr: { paddingHorizontal: 6, paddingBottom: 6, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  eyebrow: { fontFamily: Fonts.semibold, fontSize: 12, letterSpacing: 1.7 },
  h1: { fontFamily: Fonts.bold, fontSize: 28, letterSpacing: -0.3, marginTop: 2 },
  pill: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
