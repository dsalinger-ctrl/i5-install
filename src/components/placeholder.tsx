import { StyleSheet, Text, View } from 'react-native';

import { Eyebrow, Header, Screen } from '@/components/ui';
import { JOB } from '@/data/sample';
import { useTheme } from '@/hooks/use-theme';

/** Stand-in for tabs that are built in a later phase. */
export function Placeholder({ title, phase, about }: { title: string; phase: number; about: string }) {
  const t = useTheme();
  return (
    <Screen>
      <Header eyebrow={`${JOB.name.toUpperCase()} · ${JOB.number}`} title={title} />
      <View style={[styles.card, { backgroundColor: t.surface }]}>
        <Eyebrow color={t.accent}>PHASE {phase}</Eyebrow>
        <Text style={[styles.body, { color: t.sub }]}>{about}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  body: { fontSize: 15, lineHeight: 22 },
});
