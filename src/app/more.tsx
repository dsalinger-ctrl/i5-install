import { StyleSheet, Text, View } from 'react-native';

import { Eyebrow, Header, Screen, Tap } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { JOB, PEOPLE, type Role } from '@/data/sample';
import { useTheme } from '@/hooks/use-theme';
import { useDay, type Stage } from '@/state/day';

const STAGES: { stage: Stage; label: string }[] = [
  { stage: 'clock', label: 'Start' },
  { stage: 'mob', label: 'Mobilize' },
  { stage: 'work', label: 'Working' },
  { stage: 'eod', label: 'Wrap up' },
];

export default function MoreScreen() {
  const t = useTheme();
  const day = useDay();

  return (
    <Screen>
      <Header eyebrow={`${JOB.name.toUpperCase()} · ${JOB.number}`} title="More" />

      <View style={[styles.card, { backgroundColor: t.surface }]}>
        <Eyebrow color={t.accent}>PHASE 2+</Eyebrow>
        <Text style={[styles.body, { color: t.sub }]}>
          Packing list, Shipments, End of day, Crew board, Plan tomorrow, My day, My schedule, Request time off and
          Appearance.
        </Text>
      </View>

      <View style={styles.groupH}>
        <Eyebrow>SAMPLE DATA</Eyebrow>
        <Text style={[styles.note, { color: t.sub }]}>Testing only. Role comes from the Decor Teams calendar later.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: t.surface }]}>
        <Text style={[styles.label, { color: t.ink }]}>View as</Text>
        <Segmented
          options={(['lead', 'crew'] as Role[]).map((r) => ({
            key: r,
            label: `${PEOPLE[r].name} · ${r === 'lead' ? 'Lead' : 'Crew'}`,
          }))}
          value={day.role}
          onChange={(r) => day.setRole(r as Role)}
        />
        <Text style={[styles.label, { color: t.ink, marginTop: 8 }]}>Jump the now card to</Text>
        <Segmented
          options={STAGES.map((s) => ({ key: s.stage, label: s.label }))}
          value={day.stage}
          onChange={(s) => day.jumpTo(s as Stage)}
        />
        <Tap onPress={day.reset} style={[styles.reset, { backgroundColor: t.field }]}>
          <Text style={[styles.resetText, { color: t.ink }]}>Reset the day</Text>
        </Tap>
      </View>
    </Screen>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  const t = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: t.field }]}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Tap
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.segBtn, on && { backgroundColor: t.surface }]}>
            <Text style={[styles.segText, { color: on ? t.ink : t.sub }]} numberOfLines={1}>
              {o.label}
            </Text>
          </Tap>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  body: { fontSize: 15, lineHeight: 22 },
  groupH: { paddingHorizontal: 6, paddingTop: 10, gap: 2 },
  note: { fontSize: 13 },
  label: { fontFamily: Fonts.bold, fontSize: 15 },
  seg: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 3 },
  segBtn: { flex: 1, minHeight: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  segText: { fontSize: 14, fontWeight: '600' },
  reset: { minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  resetText: { fontSize: 15, fontWeight: '600' },
});
