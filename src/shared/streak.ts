import { addDays, compareDayIds } from './calendar';
import type { StreakState } from './types';

const FRESH: StreakState = { count: 0, lastPlayedDayId: null };

export function emptyStreak(): StreakState {
  return { ...FRESH };
}

/** Live-day locks only. Archive plays should not call this. */
export function recordLivePlay(
  current: StreakState,
  dayId: string
): StreakState {
  if (current.lastPlayedDayId === dayId) {
    return current;
  }
  if (
    current.lastPlayedDayId &&
    compareDayIds(current.lastPlayedDayId, dayId) > 0
  ) {
    throw new Error('Cannot play a live day earlier than the last played day');
  }
  const nextCount =
    current.lastPlayedDayId && addDays(current.lastPlayedDayId, 1) === dayId
      ? current.count + 1
      : 1;
  return { count: nextCount, lastPlayedDayId: dayId };
}
