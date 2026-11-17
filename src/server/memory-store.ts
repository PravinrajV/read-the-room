import { emptyStreak } from '../shared/streak';
import type { ArchivePlay, DayRecord, LockRecord, StreakState } from '../shared/types';
import type { GameStore } from './store';

export class MemoryStore implements GameStore {
  readonly days = new Map<string, DayRecord>();
  lastClosedDayId: string | null = null;
  readonly closedDayIds: string[] = [];
  readonly streaks = new Map<string, StreakState>();
  readonly archivePlays = new Map<string, ArchivePlay>();

  async getDay(dayId: string): Promise<DayRecord | null> {
    const day = this.days.get(dayId);
    return day ? structuredClone(day) : null;
  }

  async saveDay(day: DayRecord): Promise<void> {
    this.days.set(day.dayId, structuredClone(day));
  }


  async tryAddLock(
    dayId: string,
    record: LockRecord
  ): Promise<'ok' | 'already' | 'closed' | 'missing'> {
    const day = this.days.get(dayId);
    if (!day) {
      return 'missing';
    }
    if (day.status !== 'open') {
      return 'closed';
    }
    if (day.locks[record.userId]) {
      return 'already';
    }
    day.locks[record.userId] = { ...record };
    if (record.choice === 'keep') {
      day.keepVotes += 1;
    } else {
      day.cutVotes += 1;
    }
    return 'ok';
  }

  async getLastClosedDayId(): Promise<string | null> {
    return this.lastClosedDayId;
  }

  async setLastClosedDayId(dayId: string): Promise<void> {
    this.lastClosedDayId = dayId;
  }

  async listClosedDayIds(): Promise<string[]> {
    return [...this.closedDayIds];
  }

  async addClosedDayId(dayId: string): Promise<void> {
    if (!this.closedDayIds.includes(dayId)) {
      this.closedDayIds.push(dayId);
      this.closedDayIds.sort();
    }
  }

  async getStreak(userId: string): Promise<StreakState> {
    return this.streaks.get(userId) ?? emptyStreak();
  }

  async setStreak(userId: string, streak: StreakState): Promise<void> {
    this.streaks.set(userId, { ...streak });
  }

  async getArchivePlay(userId: string, dayId: string): Promise<ArchivePlay | null> {
    return this.archivePlays.get(`${userId}:${dayId}`) ?? null;
  }

  async saveArchivePlay(play: ArchivePlay): Promise<void> {
    this.archivePlays.set(`${play.userId}:${play.dayId}`, { ...play });
  }
}
