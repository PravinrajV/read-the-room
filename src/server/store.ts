import type { ArchivePlay, DayRecord, LockRecord, StreakState } from '../shared/types';

export type GameStore = {
  getDay(dayId: string): Promise<DayRecord | null>;
  saveDay(day: DayRecord): Promise<void>;
  tryAddLock(
    dayId: string,
    record: LockRecord
  ): Promise<'ok' | 'already' | 'closed' | 'missing'>;
  getLastClosedDayId(): Promise<string | null>;
  setLastClosedDayId(dayId: string): Promise<void>;
  listClosedDayIds(): Promise<string[]>;
  addClosedDayId(dayId: string): Promise<void>;
  getStreak(userId: string): Promise<StreakState>;
  setStreak(userId: string, streak: StreakState): Promise<void>;
  getArchivePlay(userId: string, dayId: string): Promise<ArchivePlay | null>;
  saveArchivePlay(play: ArchivePlay): Promise<void>;
};
