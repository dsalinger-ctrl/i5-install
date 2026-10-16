import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Bottom sheet with a dimmed backdrop. Tap outside to close. */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [anim] = useState(() => new Animated.Value(0));
  // Stays mounted after `open` turns false so the close animation can play.
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    Animated.timing(anim, { toValue: open ? 1 : 0, duration: open ? 300 : 220, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished && !open) setMounted(false);
      },
    );
  }, [open, anim]);

  if (!mounted) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [height * 0.8, 0] });

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: t.bg, maxHeight: height * 0.78, paddingBottom: insets.bottom + 16, transform: [{ translateY }] },
        ]}>
        <View style={[styles.grab, { backgroundColor: t.line }]} />
        <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.sub, { color: t.sub }]}>{subtitle}</Text> : null}
        <ScrollView contentContainerStyle={{ gap: 8, paddingTop: 6 }} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 16,
    gap: 4,
  },
  grab: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 8 },
  title: { fontFamily: Fonts.bold, fontSize: 20, paddingHorizontal: 6 },
  sub: { fontSize: 14, paddingHorizontal: 6 },
});
