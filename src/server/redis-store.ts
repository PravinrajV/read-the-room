import { redis } from '@devvit/web/server';
import { emptyStreak } from '../shared/streak';
import type { ArchivePlay, DayRecord, LockRecord, StreakState } from '../shared/types';
import type { GameStore } from './store';

const lastClosedKey = 'meta:lastClosedDayId';
const closedListKey = 'meta:closedDayIds';
// Votes and locks are stored per Eastern day, not per Reddit post. Two posts
// for the same day share this record.
const dayKey = (dayId: string) => `day:${dayId}`;
const streakKey = (userId: string) => `user:${userId}:streak`;
const archiveKey = (userId: string) => `user:${userId}:archive`;

const parseJson = <T>(value: string | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }
  return JSON.parse(value) as T;
};

export class RedisStore implements GameStore {
  async getDay(dayId: string): Promise<DayRecord | null> {
    const raw = await redis.get(dayKey(dayId));
    return raw ? (JSON.parse(raw) as DayRecord) : null;
  }

  async saveDay(day: DayRecord): Promise<void> {
    await redis.set(dayKey(day.dayId), JSON.stringify(day));
  }

  async tryAddLock(
    dayId: string,
    record: LockRecord
  ): Promise<'ok' | 'already' | 'closed' | 'missing'> {
    const key = dayKey(dayId);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const txn = await redis.watch(key);
      const raw = await redis.get(key);
      if (!raw) {
        await txn.unwatch();
        return 'missing';
      }
      const day = JSON.parse(raw) as DayRecord;
      if (day.status !== 'open') {
        await txn.unwatch();
        return 'closed';
      }
      if (day.locks[record.userId]) {
        await txn.unwatch();
        return 'already';
      }
      day.locks[record.userId] = record;
      if (record.choice === 'keep') {
        day.keepVotes += 1;
      } else {
        day.cutVotes += 1;
      }
      await txn.multi();
      await txn.set(key, JSON.stringify(day));
      try {
        await txn.exec();
        return 'ok';
      } catch {
        // Another writer changed the day. Retry the watched read.
      }
    }
    throw new Error('Could not lock your call. Try once more.');
  }

  async getLastClosedDayId(): Promise<string | null> {
    return (await redis.get(lastClosedKey)) ?? null;
  }

  async setLastClosedDayId(dayId: string): Promise<void> {
    await redis.set(lastClosedKey, dayId);
  }

  async listClosedDayIds(): Promise<string[]> {
    return parseJson<string[]>(await redis.get(closedListKey), []);
  }

  async addClosedDayId(dayId: string): Promise<void> {
    const key = closedListKey;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const txn = await redis.watch(key);
      const ids = parseJson<string[]>(await redis.get(key), []);
      if (!ids.includes(dayId)) {
        ids.push(dayId);
        ids.sort();
        await txn.multi();
        await txn.set(key, JSON.stringify(ids));
        try {
          await txn.exec();
          return;
        } catch {
          continue;
        }
      } else {
        await txn.unwatch();
        return;
      }
    }
    throw new Error('Could not update the archive list');
  }

  async getStreak(userId: string): Promise<StreakState> {
    return parseJson<StreakState>(await redis.get(streakKey(userId)), emptyStreak());
  }

  async setStreak(userId: string, streak: StreakState): Promise<void> {
    await redis.set(streakKey(userId), JSON.stringify(streak));
  }

  async getArchivePlay(userId: string, dayId: string): Promise<ArchivePlay | null> {
    const raw = await redis.hGet(archiveKey(userId), dayId);
    return raw ? (JSON.parse(raw) as ArchivePlay) : null;
  }

  async saveArchivePlay(play: ArchivePlay): Promise<void> {
    await redis.hSet(archiveKey(play.userId), {
      [play.dayId]: JSON.stringify(play),
    });
  }
}
