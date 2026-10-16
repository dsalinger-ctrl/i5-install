/**
 * Sample data for Phase 1. Mirrors the prototype (Table Mountain, Mike leading, Raul on crew).
 * Replaced by Calendar, Trello and Paychex data from the back end once access is approved.
 */

export type Role = 'lead' | 'crew';

export type Person = {
  name: string;
  initials: string;
  role: Role;
};

export type Task = {
  drawing: string;
  title: string;
  who: string;
  done?: boolean;
  /** On hold, e.g. a ceiling hold. Grayed out in the task picker. */
  onHold?: boolean;
};

export type ChecklistItem = { key: string; label: string; detail?: string };

export const PEOPLE: Record<Role, Person> = {
  lead: { name: 'Mike', initials: 'MW', role: 'lead' },
  crew: { name: 'Raul', initials: 'RD', role: 'crew' },
};

export const JOB = {
  name: 'Table Mountain',
  short: 'TM',
  number: '5302-1',
  day: 2,
  days: 3,
  crewSize: 6,
};

export const TASKS: Task[] = [
  { drawing: 'D4', title: 'Unload crate sections', who: 'Mike', done: true },
  { drawing: 'D4', title: 'Bring both sections in', who: 'Raul', done: true },
  { drawing: 'D4', title: 'Set middle frame', who: 'Mike' },
  { drawing: 'D4', title: 'Add screws per structural', who: 'Raul' },
  { drawing: 'D2', title: 'Assemble beams and screens', who: 'Raul' },
  { drawing: 'D2', title: 'Lift and level first sections', who: 'Shaun' },
  { drawing: 'D1', title: 'Upper valance', who: 'Michael', onHold: true },
  { drawing: 'D1', title: 'Unload valance sections', who: 'Raul' },
  { drawing: 'D4', title: 'Fix left edge banding', who: 'Brogan' },
];

/** Mobilization, from the Daily SOP. `punch` checks itself off from the Paychex clock. */
export const MOBILIZE: ChecklistItem[] = [
  { key: 'punch', label: 'Punch in', detail: 'Paychex Flex' },
  { key: 'vibe', label: 'Meet at the Vibe Board, review teams in Trello', detail: '2 min' },
  { key: 'draw', label: 'Drawing review with your team', detail: '10 min' },
  { key: 'clarify', label: 'Back at the Vibe Board, clarify tasks with Mike', detail: '5–10 min' },
  { key: 'assess', label: 'Safety assessment in Procore', detail: 'Opens the form' },
  { key: 'stage', label: 'Unload and stage the Mobilize card items' },
  { key: 'setup', label: 'Set up work areas, carts and lift bins', detail: 'Then safely crank on your tasks' },
];

/** Each person's own EOD task from the job's Mobilize card. */
export const EOD_MINE: Record<string, ChecklistItem[]> = {
  Mike: [
    {
      key: 'trello',
      label: 'Confirm with the install manager, then Zoom start time and first task for everyone',
      detail: 'Easy plan tomorrow',
    },
  ],
  Raul: [{ key: 'cartsx', label: 'Organize the work carts', detail: 'Your EOD task' }],
};

export const EOD_ALL: ChecklistItem[] = [
  { key: 'stop', label: 'Safe stopping point, set up for tomorrow', detail: 'Note supplies, tools or rentals needed' },
  { key: 'detail', label: 'Take one close detail photo', detail: 'A structural connection, wiring, a bolted seam' },
  { key: 'ptools', label: 'Personal tools away, company tools to the job box' },
  { key: 'lifts', label: 'Lifts to the charging area' },
  { key: 'ladders', label: 'Ladders and work carts to staging' },
  { key: 'trash', label: 'All trash into the bins' },
  { key: 'vibeeod', label: 'Vibe Board: Trello status, anything to order' },
  { key: 'walk', label: 'Obvious walk, fix anything that looks bad', detail: '10 min' },
  { key: 'like', label: "Read and like tomorrow's Zoom message", detail: 'At the vehicles' },
];

export function eodItems(name: string): ChecklistItem[] {
  return (EOD_MINE[name] ?? []).concat(EOD_ALL);
}

/** Crew default task order when Raul hasn't picked one (indexes into TASKS). */
export const CREW_QUEUE = [3, 4, 7];

export const NEXT_CHECK_IN = '12:00 PM';

/** What blocks work right now. Lead only for the sample. */
export const RED_ALERT = {
  title: 'Lift plan needed',
  detail: 'Before lifting the D4 middle frame',
  action: 'Fill out',
};
