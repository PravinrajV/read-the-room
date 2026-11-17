import { playArchiveDay, summarizeArchiveDay } from '../shared/archive';
import type { GameStateResponse } from '../shared/api';
import {
  addDays,
  dayIdFromInstant,
  formatDayLabel,
  nextCloseAt,
  pendingCloseDayIds,
  zonedMidnight,
} from '../shared/calendar';
import { promptForDay } from '../shared/catalog';
import { DAY_TIMEZONE } from '../shared/constants';
import { closeDay, findMostDividedCall, scoreAgainstSnapshot } from '../shared/reveal';
import { assertPrediction } from '../shared/scoring';
import { emptyStreak, recordLivePlay } from '../shared/streak';
import type {
  ArchiveDaySummary,
  DayRecord,
  DaySnapshot,
  LockRecord,
  MostDividedCall,
  VoteChoice,
  YesterdayRecap,
} from '../shared/types';
import type { GameStore } from './store';

export type GameServiceOptions = {
  store: GameStore;
  fixture?: boolean;
  localPreview?: boolean;
  commentUrl?: string | null;
  timeZone?: string;
};

export type Actor = {
  userId: string | null;
  username: string | null;
};

const OPEN_DAY = (dayId: string, openedAt: string): DayRecord => ({
  dayId,
  promptId: promptForDay(dayId).id,
  status: 'open',
  openedAt,
  closedAt: null,
  locks: {},
  keepVotes: 0,
  cutVotes: 0,
  snapshot: null,
});

export class GameService {
  private readonly store: GameStore;
  private readonly fixture: boolean;
  private readonly localPreview: boolean;
  private readonly commentUrl: string | null;
  private readonly timeZone: string;

  constructor(options: GameServiceOptions) {
    this.store = options.store;
    this.fixture = options.fixture === true;
    this.localPreview = options.localPreview === true;
    this.commentUrl = options.commentUrl ?? null;
    this.timeZone = options.timeZone ?? DAY_TIMEZONE;
  }

  async ensureClosedDays(now: Date): Promise<void> {
    const lastClosed = await this.store.getLastClosedDayId();
    const pending = pendingCloseDayIds(now, lastClosed, this.timeZone);
    for (const dayId of pending) {
      const existing = await this.store.getDay(dayId);
      if (existing && existing.status === 'open') {
        await this.closeDay(dayId, zonedMidnight(addDays(dayId, 1), this.timeZone));
      } else if (existing?.snapshot) {
        await this.store.addClosedDayId(dayId);
        await this.store.setLastClosedDayId(dayId);
      } else {
        // The day was never opened, so there are no real votes to archive.
        await this.store.setLastClosedDayId(dayId);
      }
    }
  }

  async getState(now: Date, actor: Actor): Promise<GameStateResponse> {
    await this.ensureClosedDays(now);
    const dayId = dayIdFromInstant(now, this.timeZone);
    const today = await this.ensureOpenDay(dayId, now);
    const recap = await this.buildRecap(dayId, actor);
    const archive = await this.buildArchive(actor);
    const mostDivided = this.mostDividedFrom(archive);
    const lock = actor.userId ? (today.locks[actor.userId] ?? null) : null;
    const score =
      today.snapshot && lock
        ? (scoreAgainstSnapshot(lock.prediction, today.snapshot)?.score ?? null)
        : null;
    const streak = actor.userId
      ? await this.store.getStreak(actor.userId)
      : emptyStreak();

    return {
      type: 'game-state',
      now: now.toISOString(),
      dayId,
      status: today.status,
      closesAt: nextCloseAt(now, this.timeZone).toISOString(),
      prompt: promptForDay(dayId),
      fixture: this.fixture,
      localPreview: this.localPreview,
      voteCount: today.keepVotes + today.cutVotes,
      snapshot: today.snapshot,
      player: {
        userId: actor.userId,
        username: actor.username,
        canLock: Boolean(actor.userId && actor.username && today.status === 'open' && !lock),
        lock,
        score,
        streak,
      },
      recap,
      mostDivided,
      archive,
      commentUrl: this.commentUrl,
    };
  }

  async lockToday(
    now: Date,
    actor: Actor,
    choice: VoteChoice,
    prediction: number
  ): Promise<GameStateResponse> {
    await this.ensureClosedDays(now);
    if (!actor.userId || !actor.username) {
      throw new Error('Log in to lock in your call');
    }
    assertPrediction(prediction);
    if (choice !== 'keep' && choice !== 'cut') {
      throw new Error('Pick Keep or Cut first');
    }
    const dayId = dayIdFromInstant(now, this.timeZone);
    const today = await this.ensureOpenDay(dayId, now);
    if (today.status !== 'open') {
      throw new Error("Today's room already closed");
    }
    const record: LockRecord = {
      userId: actor.userId,
      username: actor.username,
      choice,
      prediction,
      lockedAt: now.toISOString(),
    };
    let result = await this.store.tryAddLock(dayId, record);
    if (result === 'missing') {
      await this.store.saveDay(today);
      result = await this.store.tryAddLock(dayId, record);
    }
    if (result === 'already') {
      throw new Error('You already locked in today');
    }
    if (result === 'closed' || result === 'missing') {
      throw new Error("Today's room already closed");
    }
    const streak = recordLivePlay(await this.store.getStreak(actor.userId), dayId);
    await this.store.setStreak(actor.userId, streak);
    return this.getState(now, actor);
  }

  async playArchive(
    now: Date,
    actor: Actor,
    dayId: string,
    choice: VoteChoice,
    prediction: number
  ): Promise<{ play: import('../shared/types').ArchivePlay; state: GameStateResponse }> {
    await this.ensureClosedDays(now);
    if (!actor.userId || !actor.username) {
      throw new Error('Log in to play a closed day');
    }
    if (choice !== 'keep' && choice !== 'cut') {
      throw new Error('Pick Keep or Cut first');
    }
    const day = await this.store.getDay(dayId);
    if (!day?.snapshot) {
      throw new Error('That day is not in the archive yet');
    }
    const existing = await this.store.getArchivePlay(actor.userId, dayId);
    const play = playArchiveDay({
      dayId,
      userId: actor.userId,
      username: actor.username,
      choice,
      prediction,
      snapshot: day.snapshot,
      playedAt: now.toISOString(),
      existingPlay: existing,
    });
    if (!existing) {
      await this.store.saveArchivePlay(play);
    }
    return { play, state: await this.getState(now, actor) };
  }

  private async ensureOpenDay(dayId: string, now: Date): Promise<DayRecord> {
    const existing = await this.store.getDay(dayId);
    if (existing) {
      return existing;
    }
    const created = OPEN_DAY(dayId, zonedMidnight(dayId, this.timeZone).toISOString());
    if (dayId === dayIdFromInstant(now, this.timeZone)) {
      await this.store.saveDay(created);
    }
    return created;
  }

  private async closeDay(dayId: string, closedAt: Date): Promise<DaySnapshot> {
    const existing = await this.store.getDay(dayId);
    const day = existing ?? OPEN_DAY(dayId, zonedMidnight(dayId, this.timeZone).toISOString());
    if (day.snapshot && day.status !== 'open') {
      await this.store.setLastClosedDayId(dayId);
      await this.store.addClosedDayId(dayId);
      return day.snapshot;
    }
    const snapshot = closeDay({
      dayId,
      promptId: day.promptId,
      closedAt: closedAt.toISOString(),
      keepVotes: day.keepVotes,
      cutVotes: day.cutVotes,
      locks: Object.values(day.locks),
    });
    day.status = snapshot.status;
    day.closedAt = snapshot.closedAt;
    day.snapshot = snapshot;
    await this.store.saveDay(day);
    await this.store.addClosedDayId(dayId);
    await this.store.setLastClosedDayId(dayId);
    return snapshot;
  }

  private async buildRecap(todayId: string, actor: Actor): Promise<YesterdayRecap | null> {
    const yesterdayId = addDays(todayId, -1);
    const yesterday = await this.store.getDay(yesterdayId);
    if (!yesterday?.snapshot) {
      return null;
    }
    const yourLock = actor.userId ? yesterday.locks[actor.userId] : null;
    const yourScore =
      yourLock && yesterday.snapshot
        ? (scoreAgainstSnapshot(yourLock.prediction, yesterday.snapshot)?.score ?? null)
        : null;
    const archive = await this.buildArchive(actor);
    return {
      dayId: yesterdayId,
      prompt: promptForDay(yesterdayId),
      snapshot: yesterday.snapshot,
      yourScore,
      mostDivided: this.mostDividedFrom(archive),
    };
  }

  private async buildArchive(actor: Actor): Promise<ArchiveDaySummary[]> {
    const ids = await this.store.listClosedDayIds();
    const days: ArchiveDaySummary[] = [];
    for (const dayId of ids) {
      const day = await this.store.getDay(dayId);
      if (!day?.snapshot) {
        continue;
      }
      const play = actor.userId
        ? await this.store.getArchivePlay(actor.userId, dayId)
        : null;
      days.push(
        summarizeArchiveDay({
          dayId,
          prompt: promptForDay(dayId),
          snapshot: day.snapshot,
          play,
        })
      );
    }
    return days;
  }

  private mostDividedFrom(archive: ArchiveDaySummary[]): MostDividedCall | null {
    return findMostDividedCall(
      archive
        .filter((day) => day.status === 'revealed')
        .map((day) => ({
          dayId: day.dayId,
          promptTitle: day.prompt.title,
          snapshot: {
            dayId: day.dayId,
            promptId: day.prompt.id,
            closedAt: '',
            keepVotes: 0,
            cutVotes: 0,
            totalVotes: day.totalVotes,
            status: 'revealed' as const,
            keepPercent: day.keepPercent,
            closestGuesser: null,
          },
        }))
    );
  }
}

export function formatTodayPostTitle(dayId: string): string {
  const prompt = promptForDay(dayId);
  return `Read the Room: ${prompt.title} (${formatDayLabel(dayId)})`;
}
