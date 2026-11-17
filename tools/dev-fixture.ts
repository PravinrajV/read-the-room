import { addDays, dayIdFromInstant, zonedMidnight } from '../src/shared/calendar.ts';
import { promptForDay } from '../src/shared/catalog.ts';
import { closeDay } from '../src/shared/reveal.ts';
import type { DayRecord, LockRecord, VoteChoice } from '../src/shared/types.ts';
import type { MemoryStore } from '../src/server/memory-store.ts';

/**
 * Local-preview only. These people and splits are invented for UI review.
 * Never import this module from the production server entry.
 */
const FIXTURE_PLAYERS = [
  'fixture-ada',
  'fixture-bo',
  'fixture-cam',
  'fixture-dee',
  'fixture-ed',
  'fixture-fay',
  'fixture-gus',
  'fixture-hadi',
  'fixture-iris',
  'fixture-jo',
  'fixture-kip',
  'fixture-liv',
];

export function seedDevFixture(store: MemoryStore, now: Date): void {
  const todayId = dayIdFromInstant(now);
  const plans: { offset: number; keepCount: number; early?: boolean }[] = [
    { offset: 6, keepCount: 7 },
    { offset: 5, keepCount: 5 },
    { offset: 4, keepCount: 9 },
    { offset: 3, keepCount: 6 },
    { offset: 2, keepCount: 8 },
    { offset: 1, keepCount: 3, early: true },
  ];

  for (const plan of plans) {
    const dayId = addDays(todayId, -plan.offset);
    const players = plan.early ? FIXTURE_PLAYERS.slice(0, 4) : FIXTURE_PLAYERS;
    const locks: Record<string, LockRecord> = {};
    let keepVotes = 0;
    let cutVotes = 0;
    players.forEach((username, index) => {
      const choice: VoteChoice = index < plan.keepCount ? 'keep' : 'cut';
      if (choice === 'keep') {
        keepVotes += 1;
      } else {
        cutVotes += 1;
      }
      const opened = zonedMidnight(dayId);
      locks[username] = {
        userId: username,
        username,
        choice,
        prediction: Math.min(100, Math.max(0, 40 + index * 4)),
        lockedAt: new Date(opened.getTime() + (index + 1) * 60 * 60 * 1000).toISOString(),
      };
    });
    const closedAt = zonedMidnight(addDays(dayId, 1));
    const snapshot = closeDay({
      dayId,
      promptId: promptForDay(dayId).id,
      closedAt: closedAt.toISOString(),
      keepVotes,
      cutVotes,
      locks: Object.values(locks),
    });
    const day: DayRecord = {
      dayId,
      promptId: promptForDay(dayId).id,
      status: snapshot.status,
      openedAt: zonedMidnight(dayId).toISOString(),
      closedAt: snapshot.closedAt,
      locks,
      keepVotes,
      cutVotes,
      snapshot,
    };
    store.days.set(dayId, day);
    store.closedDayIds.push(dayId);
    store.lastClosedDayId = dayId;
  }
  store.closedDayIds.sort();
}
