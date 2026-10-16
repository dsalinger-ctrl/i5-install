import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { NowCard } from '@/components/now-card';
import { Sheet } from '@/components/sheet';
import { Eyebrow, Pill, Screen, Tap, Title, comingSoon, type Tone } from '@/components/ui';
import { Brand, Fonts, Radius } from '@/constants/theme';
import { MOBILIZE, RED_ALERT, TASKS, type Task } from '@/data/sample';
import { useTheme } from '@/hooks/use-theme';
import { useDay, type PunchAction } from '@/state/day';

const PLAN_TOMORROW_AFTER_HOURS = 10;

export default function HomeScreen() {
  const t = useTheme();
  const day = useDay();
  const now = useNow();
  const [sheet, setSheet] = useState<'clock' | 'tasks' | 'mobilize' | null>(null);
  const close = () => setSheet(null);
  // Mobilize closes itself once the last item is checked and the card moves to Working on.
  if (sheet === 'mobilize' && day.stage !== 'mob') setSheet(null);

  const lead = day.role === 'lead';
  const hoursOnClock = day.punch.since && day.punch.status !== 'out' ? (now - day.punch.since) / 3_600_000 : 0;
  const showAlert = lead && (day.stage === 'mob' || day.stage === 'work');

  return (
    <Screen>
      <View style={styles.hdr}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{formatDate(now)}</Eyebrow>
          <Title>
            {greeting(now)}, {day.me.name}
          </Title>
          <ClockLine onPress={() => setSheet('clock')} />
        </View>
        <View style={[styles.avatar, { backgroundColor: t.surface, borderColor: t.line }]}>
          <Text style={[styles.avatarText, { color: t.ink }]}>{day.me.initials}</Text>
        </View>
      </View>

      <NowCard onOpenMobilize={() => setSheet('mobilize')} onPickTask={() => setSheet('tasks')} />

      {showAlert && (
        <View style={[styles.alert, { backgroundColor: t.redBg }]}>
          <Icon name="warning" color={t.redInk} strokeWidth={2.2} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.alertTitle, { color: t.redInk }]}>{RED_ALERT.title}</Text>
            <Text style={[styles.alertSub, { color: t.redInk }]}>{RED_ALERT.detail}</Text>
          </View>
          <Tap onPress={() => comingSoon('Decor Lift Plan', 3)} style={[styles.alertBtn, { backgroundColor: t.redInk }]}>
            <Text style={[styles.alertBtnText, { color: t.redBg }]}>{RED_ALERT.action}</Text>
          </Tap>
        </View>
      )}

      <View style={{ flex: 1, minHeight: 6 }} />

      <View style={styles.tiles}>
        {lead ? (
          <>
            {hoursOnClock >= PLAN_TOMORROW_AFTER_HOURS ? (
              <Tile
                icon="sparkle"
                name="Easy plan tomorrow"
                sub="Start time + tasks"
                badge={{ label: '10 hrs', tone: 'blue' }}
                primary
                onPress={() => comingSoon('Plan tomorrow', 2)}
              />
            ) : (
              <Tile
                icon="clock"
                name="2-hr update"
                sub="Post to Todd"
                badge={{ label: '12:00', tone: 'amber' }}
                onPress={() => comingSoon('2-hr update', 2)}
              />
            )}
            <Tile icon="video" name="Zoom call" sub="Todd and Dan" onPress={() => comingSoon('Zoom call', 2)} />
            <Tile
              icon="calendar"
              name="Schedule"
              sub="Next 4 weeks"
              badge={{ label: 'Off Thu', tone: 'blue' }}
              onPress={() => comingSoon('Schedule', 1)}
            />
            <Tile
              icon="shield"
              name="Safety"
              sub="Lift plan"
              badge={{ label: 'Now', tone: 'red' }}
              onPress={() => comingSoon('Safety', 3)}
            />
          </>
        ) : (
          <>
            <Tile
              icon="calendar"
              name="My schedule"
              sub="Next 4 weeks"
              badge={{ label: 'Off Thu', tone: 'blue' }}
              onPress={() => comingSoon('My schedule', 1)}
            />
            <Tile icon="video" name="Zoom call" sub="Todd and Dan" onPress={() => comingSoon('Zoom call', 2)} />
            <Tile icon="warning" name="Flag issue" sub="Photo + drawing" onPress={() => comingSoon('Flag issue', 2)} />
            <Tile icon="shield" name="Safety" sub="Daily check" onPress={() => comingSoon('Safety', 3)} />
          </>
        )}
      </View>

      <ClockSheet open={sheet === 'clock'} onClose={close} />
      <TaskSheet open={sheet === 'tasks'} onClose={close} />
      <MobilizeSheet open={sheet === 'mobilize'} onClose={close} />
    </Screen>
  );
}

/** "On the clock · since 9:58 AM". Tap for the Paychex sheet. */
function ClockLine({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  const { punch } = useDay();
  const label =
    punch.status === 'out'
      ? 'Not clocked in'
      : punch.status === 'in'
        ? `On the clock · since ${formatTime(punch.since)}`
        : punch.status === 'lunch'
          ? 'On lunch'
          : 'Clocked out · hours sent';
  return (
    <Pressable onPress={onPress} style={styles.clk} accessibilityRole="button" accessibilityHint="Opens the Paychex time clock">
      <LiveDot live={punch.status === 'in'} idle={t.line} />
      <Text style={[styles.clkText, { color: t.sub }]}>{label}</Text>
    </Pressable>
  );
}

function LiveDot({ live, idle }: { live: boolean; idle: string }) {
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!live) return;
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }));
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(0);
    };
  }, [live, pulse]);
  return (
    <View style={styles.dotWrap}>
      {live && (
        <Animated.View
          style={[
            styles.dot,
            styles.dotRing,
            {
              opacity: pulse.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 0, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 2.5, 2.5] }) }],
            },
          ]}
        />
      )}
      <View style={[styles.dot, { backgroundColor: live ? Brand.live : idle }]} />
    </View>
  );
}

function Tile({
  icon,
  name,
  sub,
  badge,
  primary,
  onPress,
}: {
  icon: IconName;
  name: string;
  sub: string;
  badge?: { label: string; tone: Tone };
  primary?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${sub}`}
      style={[styles.tile, { backgroundColor: primary ? t.button : t.surface }]}>
      <View style={styles.tileTop}>
        <View style={[styles.ico, { backgroundColor: primary ? 'rgba(255,255,255,0.18)' : t.tint }]}>
          <Icon name={icon} size={22} strokeWidth={2.2} color={primary ? '#FFFFFF' : t.accent} />
        </View>
        {badge &&
          (primary ? (
            <Pill label={badge.label} tone={badge.tone} style={{ backgroundColor: '#FFFFFF', color: Brand.blue }} />
          ) : (
            <Pill label={badge.label} tone={badge.tone} />
          ))}
      </View>
      <View>
        <Text style={[styles.tname, { color: primary ? '#FFFFFF' : t.ink }]}>{name}</Text>
        <Text style={[styles.tsub, { color: primary ? '#D9E2EF' : t.sub }]}>{sub}</Text>
      </View>
    </Tap>
  );
}

function ClockSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTheme();
  const day = useDay();
  const act = (a: PunchAction) => {
    day.punchAction(a);
    onClose();
  };
  const btn = (a: PunchAction, label: string, ghost?: boolean) => (
    <Tap
      key={a}
      onPress={() => act(a)}
      accessibilityRole="button"
      style={[styles.sheetBtn, { backgroundColor: ghost ? t.field : t.button }]}>
      <Text style={[styles.sheetBtnText, { color: ghost ? t.ink : '#FFFFFF' }]}>{label}</Text>
    </Tap>
  );
  const { status, since } = day.punch;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Paychex Flex time clock"
      subtitle={status === 'out' ? 'Not clocked in yet' : `Since ${formatTime(since)} · sent to Paychex Flex`}>
      {status === 'out' && btn('in', 'Clock in')}
      {status === 'in' && [btn('lunch', 'Start lunch', true), btn('out', 'Clock out', true)]}
      {status === 'lunch' && btn('back', 'End lunch')}
      {status === 'done' && <Text style={{ color: t.sub, fontSize: 15, padding: 6 }}>Clocked out for today.</Text>}
    </Sheet>
  );
}

function TaskSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTheme();
  const day = useDay();
  const openIdx = TASKS.map((_, i) => i).filter((i) => !TASKS[i].done);
  const mine = openIdx.filter((i) => TASKS[i].who === day.me.name);
  const rest = openIdx.filter((i) => TASKS[i].who !== day.me.name);

  const row = (i: number) => {
    const task: Task = TASKS[i];
    const cur = i === day.currentIdx;
    return (
      <Pressable
        key={i}
        disabled={task.onHold}
        onPress={() => {
          day.pick(i);
          onClose();
        }}
        style={[styles.trow, { borderBottomColor: t.line }, cur && { backgroundColor: t.tint }, task.onHold && { opacity: 0.5 }]}>
        <Text style={[styles.trowD, { color: t.ink }]}>{task.drawing}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.ink, fontSize: 16 }}>{task.title}</Text>
          <Text style={{ color: t.sub, fontSize: 13 }}>
            {task.who}
            {task.onHold ? ' · on hold' : ''}
          </Text>
        </View>
        {cur ? <Pill label="Now" tone="blue" /> : task.onHold ? <Pill label="Ceiling hold" tone="amber" /> : null}
      </Pressable>
    );
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="What are you working on?"
      subtitle="Sets the drawing for safety forms, flags, Zoom calls and Ask AI.">
      <Eyebrow style={styles.sheetEyebrow}>YOURS</Eyebrow>
      <View style={[styles.rows, { backgroundColor: t.surface }]}>
        {mine.length ? mine.map(row) : <Text style={[styles.empty, { color: t.sub }]}>Nothing left</Text>}
      </View>
      <Eyebrow style={styles.sheetEyebrow}>HELPING THE CREW</Eyebrow>
      <View style={[styles.rows, { backgroundColor: t.surface }]}>{rest.map(row)}</View>
    </Sheet>
  );
}

/** The Mobilization section of My day. The full My day screen comes in Phase 2. */
function MobilizeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTheme();
  const day = useDay();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Mobilization"
      subtitle={`Start of the day · ${day.mobilize.done} of ${day.mobilize.total} done`}>
      <View style={[styles.rows, { backgroundColor: t.surface }]}>
        {MOBILIZE.map((item) => {
          const on = day.isChecked(item.key);
          const note = item.key === 'punch' ? (on ? 'Auto' : 'Clock in') : item.key === 'assess' && !on ? 'Open' : '';
          return (
            <Pressable
              key={item.key}
              onPress={() => (item.key === 'punch' ? !on && day.punchAction('in') : day.toggle(item.key))}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={[styles.chk, { borderBottomColor: t.line }]}>
              <View style={[styles.box, { borderColor: on ? t.okInk : t.line, backgroundColor: on ? t.okBg : 'transparent' }]}>
                {on && <Icon name="check" size={16} strokeWidth={3} color={t.okInk} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink, fontSize: 16 }}>{item.label}</Text>
                {item.detail ? <Text style={{ color: t.sub, fontSize: 12 }}>{item.detail}</Text> : null}
              </View>
              {note ? <Text style={[styles.chkNote, { color: on ? t.okInk : t.sub }]}>{note}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

/** Current time, refreshed every 30 seconds for the clock line and 10-hour check. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function greeting(ms: number) {
  const h = new Date(ms).getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
}

function formatTime(ms?: number) {
  return ms ? new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
}

const styles = StyleSheet.create({
  hdr: { paddingHorizontal: 6, paddingBottom: 6, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 15 },
  clk: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 6, alignSelf: 'flex-start' },
  clkText: { fontSize: 14, fontWeight: '600' },
  dotWrap: { width: 9, height: 9 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dotRing: { position: 'absolute', backgroundColor: Brand.live },
  alert: { borderRadius: 18, paddingVertical: 12, paddingLeft: 14, paddingRight: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertTitle: { fontSize: 15, fontWeight: '700' },
  alertSub: { fontSize: 14 },
  alertBtn: { minHeight: 40, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' },
  alertBtnText: { fontSize: 14, fontWeight: '700' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 120,
    borderRadius: Radius.tile,
    padding: 16,
    justifyContent: 'space-between',
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ico: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tname: { fontFamily: Fonts.bold, fontSize: 17 },
  tsub: { fontSize: 14, marginTop: 2 },
  sheetBtn: { minHeight: 56, borderRadius: Radius.button, alignItems: 'center', justifyContent: 'center' },
  sheetBtnText: { fontSize: 17, fontWeight: '700' },
  sheetEyebrow: { paddingHorizontal: 6, paddingTop: 4 },
  rows: { borderRadius: 18, overflow: 'hidden' },
  empty: { padding: 14, fontSize: 15 },
  trow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trowD: { fontFamily: Fonts.bold, minWidth: 30, fontSize: 16 },
  chk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  box: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  chkNote: { fontSize: 13, fontWeight: '700' },
});
