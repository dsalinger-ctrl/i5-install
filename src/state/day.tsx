import { createContext, useContext, useState, type ReactNode } from 'react';

import {
  CREW_QUEUE,
  MOBILIZE,
  PEOPLE,
  TASKS,
  eodItems,
  type ChecklistItem,
  type Role,
  type Task,
} from '@/data/sample';

export type PunchStatus = 'out' | 'in' | 'lunch' | 'done';
export type Phase = 'mob' | 'work' | 'eod';
/** What the now card shows. */
export type Stage = 'clock' | Phase;
export type PunchAction = 'in' | 'lunch' | 'back' | 'out';

type Punch = { status: PunchStatus; since?: number };

type DayState = {
  role: Role;
  punch: Punch;
  phase: Phase;
  checked: Record<string, boolean>;
  /** Index into TASKS the person picked, or null for the default. */
  picked: number | null;
};

const initial: DayState = { role: 'lead', punch: { status: 'out' }, phase: 'mob', checked: {}, picked: null };

function useDayState() {
  const [s, setS] = useState<DayState>(initial);
  const me = PEOPLE[s.role];

  const isChecked = (key: string) => (key === 'punch' ? s.punch.status !== 'out' : !!s.checked[key]);
  const progress = (items: ChecklistItem[]) => {
    const done = items.filter((i) => isChecked(i.key)).length;
    return { done, total: items.length, next: items.find((i) => !isChecked(i.key)) };
  };

  const currentIndex = (): number | undefined => {
    if (s.picked != null && !TASKS[s.picked].done) return s.picked;
    if (s.role === 'lead') {
      const i = TASKS.findIndex((t) => !t.done && !t.onHold && t.who === me.name);
      return i < 0 ? undefined : i;
    }
    return CREW_QUEUE.find((i) => !TASKS[i].done);
  };
  const currentIdx = currentIndex();
  const current: Task | undefined = currentIdx === undefined ? undefined : TASKS[currentIdx];

  const stage: Stage = s.punch.status === 'out' ? 'clock' : s.phase;

  const mobilize = progress(MOBILIZE);
  const eod = progress(eodItems(me.name));

  function toggle(key: string) {
    if (key === 'punch') return;
    setS((prev) => {
      const checked = { ...prev.checked, [key]: !prev.checked[key] };
      // Mobilize is finished once every item is checked (punch counts once clocked in).
      const mobDone = MOBILIZE.every((i) => (i.key === 'punch' ? prev.punch.status !== 'out' : checked[i.key]));
      return { ...prev, checked, phase: prev.phase === 'mob' && mobDone ? 'work' : prev.phase };
    });
  }

  function punch(action: PunchAction) {
    setS((prev) => {
      const at = Date.now();
      switch (action) {
        case 'in':
          return { ...prev, punch: { status: 'in', since: at } };
        case 'lunch':
          return { ...prev, punch: { ...prev.punch, status: 'lunch' } };
        case 'back':
          return { ...prev, punch: { ...prev.punch, status: 'in' } };
        case 'out':
          return { ...prev, punch: { ...prev.punch, status: 'done' } };
      }
    });
  }

  return {
    role: s.role,
    me,
    punch: s.punch,
    stage,
    mobilize,
    eod,
    eodList: eodItems(me.name),
    current,
    currentIdx,
    isChecked,
    toggle,
    punchAction: punch,
    pick: (i: number) => setS((prev) => ({ ...prev, picked: i })),
    // Sample-data controls (More tab). Real role comes from the Decor Teams calendar.
    setRole: (role: Role) => setS((prev) => ({ ...prev, role, picked: null })),
    jumpTo: (stage: Stage) =>
      setS((prev) =>
        stage === 'clock'
          ? { ...prev, punch: { status: 'out' }, phase: 'mob' }
          : {
              ...prev,
              phase: stage,
              punch: prev.punch.status === 'out' ? { status: 'in', since: Date.now() } : prev.punch,
            },
      ),
    reset: () => setS((prev) => ({ ...initial, role: prev.role })),
  };
}

export type Day = ReturnType<typeof useDayState>;

const DayContext = createContext<Day | null>(null);

export function DayProvider({ children }: { children: ReactNode }) {
  const day = useDayState();
  return <DayContext.Provider value={day}>{children}</DayContext.Provider>;
}

export function useDay(): Day {
  const day = useContext(DayContext);
  if (!day) throw new Error('useDay must be used inside <DayProvider>');
  return day;
}
