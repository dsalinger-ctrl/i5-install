import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Eyebrow, Tap, comingSoon } from '@/components/ui';
import { Brand, Fonts, Radius } from '@/constants/theme';
import { JOB, NEXT_CHECK_IN, PEOPLE } from '@/data/sample';
import { useDay } from '@/state/day';

/** Home's one card: the one thing to do now. Always I-5 blue, in light and dark mode. */
export function NowCard({ onOpenMobilize, onPickTask }: { onOpenMobilize: () => void; onPickTask: () => void }) {
  const day = useDay();
  const lead = day.role === 'lead';

  return (
    <View style={styles.hero}>
      <View style={styles.topRow}>
        <Eyebrow color={Brand.heroSub} style={{ flexShrink: 1 }}>
          {lead
            ? `TODAY · ${JOB.name.toUpperCase()} · ${JOB.number.replace('-', '\u2011')}`
            : `TODAY · ${JOB.short} · LEAD: ${PEOPLE.lead.name.toUpperCase()}`}
        </Eyebrow>
        {lead ? (
          <Text style={styles.leadPill}>Lead</Text>
        ) : (
          <Text style={styles.sub}>Crew of {JOB.crewSize}</Text>
        )}
      </View>

      {day.stage === 'clock' && (
        <Stage label="First thing" big="Start your day" sub={`You're at ${JOB.name}${lead ? ` · day ${JOB.day} of ${JOB.days}` : ''}`}>
          <HeroButton label="Clock in" onPress={() => day.punchAction('in')} />
        </Stage>
      )}

      {day.stage === 'mob' && (
        <Stage
          label={`Mobilize · ${day.mobilize.done} of ${day.mobilize.total} done`}
          big={day.mobilize.next?.label ?? 'All set'}
          bigSize={26}
          sub="Your start-of-day list">
          <HeroButton label="Open my list" onPress={onOpenMobilize} />
        </Stage>
      )}

      {day.stage === 'work' && (
        <Stage
          label="Working on"
          labelRight={
            lead ? undefined : (
              <Pressable onPress={onPickTask} style={styles.change} accessibilityRole="button">
                <Text style={styles.changeText}>Change</Text>
              </Pressable>
            )
          }
          big={day.current?.drawing ?? 'Done'}
          mid={day.current?.title ?? 'Your tasks are done'}
          sub={`Next check-in ${NEXT_CHECK_IN}`}>
          <View style={styles.two}>
            <HeroButton label="Check in" half onPress={() => comingSoon('Vibe Board check-in', 2)} />
            {lead ? (
              <HeroButton label="Change task" half ghost onPress={onPickTask} />
            ) : (
              <HeroButton label="All tasks" half ghost onPress={() => router.navigate('/tasks')} />
            )}
          </View>
        </Stage>
      )}

      {day.stage === 'eod' && (
        <Stage
          label={`Wrap up · ${day.eod.done} of ${day.eod.total} done`}
          big={day.eod.next?.label ?? 'All done. Send it.'}
          bigSize={24}
          sub="Then send and clock out">
          <HeroButton label="Wrap up my day" onPress={() => comingSoon('Wrap up', 4)} />
        </Stage>
      )}
    </View>
  );
}

function Stage({
  label,
  labelRight,
  big,
  bigSize = 32,
  mid,
  sub,
  children,
}: {
  label: string;
  labelRight?: React.ReactNode;
  big: string;
  bigSize?: number;
  mid?: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stage}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelRight}
      </View>
      <Text style={[styles.big, { fontSize: bigSize, lineHeight: Math.round(bigSize * 1.15) }]}>{big}</Text>
      {mid ? <Text style={styles.mid}>{mid}</Text> : null}
      <Text style={styles.sub}>{sub}</Text>
      {children}
    </View>
  );
}

function HeroButton({
  label,
  onPress,
  ghost,
  half,
}: {
  label: string;
  onPress: () => void;
  ghost?: boolean;
  half?: boolean;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.btn, ghost ? styles.btnGhost : styles.btnSolid, half && { flex: 1 }]}>
      <Text style={[styles.btnText, ghost ? styles.btnGhostText : styles.btnSolidText]}>{label}</Text>
    </Tap>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: Brand.blue, borderRadius: Radius.hero, padding: 20, gap: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  leadPill: {
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    color: Brand.blue,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stage: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 34 },
  label: { fontSize: 14, fontWeight: '600', color: Brand.heroSub },
  big: { fontFamily: Fonts.bold, color: '#FFFFFF' },
  mid: { fontSize: 19, fontWeight: '500', color: '#FFFFFF' },
  sub: { fontSize: 14, color: Brand.heroSub },
  two: { flexDirection: 'row', gap: 10 },
  btn: { minHeight: 56, borderRadius: Radius.button, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnSolid: { backgroundColor: '#FFFFFF' },
  btnGhost: { borderWidth: 1, borderColor: Brand.heroLine },
  btnText: { fontSize: 17 },
  btnSolidText: { color: Brand.blue, fontWeight: '700' },
  btnGhostText: { color: '#FFFFFF', fontWeight: '600' },
  change: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
  },
  changeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
