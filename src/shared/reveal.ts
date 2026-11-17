import { MIN_REVEAL_VOTES, MOST_DIVIDED_MAX_DISTANCE } from './constants';
import type {
  ClosestGuesser,
  DaySnapshot,
  LockRecord,
  MostDividedCall,
} from './types';
import { keepPercentFromCounts, predictionError, scorePrediction } from './scoring';

export function isEarlyRead(
  totalVotes: number,
  minVotes: number = MIN_REVEAL_VOTES
): boolean {
  if (totalVotes < 0) {
    throw new Error('Vote count cannot be negative');
  }
  return totalVotes < minVotes;
}

export function findClosestGuesser(
  locks: readonly LockRecord[],
  actualKeepPercent: number
): ClosestGuesser | null {
  if (locks.length === 0) {
    return null;
  }
  const ranked = [...locks].sort((a, b) => {
    const errorA = predictionError(a.prediction, actualKeepPercent);
    const errorB = predictionError(b.prediction, actualKeepPercent);
    if (errorA !== errorB) {
      return errorA - errorB;
    }
    if (a.lockedAt !== b.lockedAt) {
      return a.lockedAt < b.lockedAt ? -1 : 1;
    }
    return a.username.localeCompare(b.username);
  });
  const winner = ranked[0];
  if (!winner) {
    return null;
  }
  const error = predictionError(winner.prediction, actualKeepPercent);
  return {
    userId: winner.userId,
    username: winner.username,
    prediction: winner.prediction,
    error,
    score: scorePrediction(winner.prediction, actualKeepPercent),
  };
}

export function closeDay(input: {
  dayId: string;
  promptId: string;
  closedAt: string;
  keepVotes: number;
  cutVotes: number;
  locks: readonly LockRecord[];
  minVotes?: number;
}): DaySnapshot {
  const totalVotes = input.keepVotes + input.cutVotes;
  if (totalVotes !== input.locks.length) {
    throw new Error('Lock list and vote counts do not match');
  }
  if (isEarlyRead(totalVotes, input.minVotes ?? MIN_REVEAL_VOTES)) {
    return {
      dayId: input.dayId,
      promptId: input.promptId,
      closedAt: input.closedAt,
      keepVotes: input.keepVotes,
      cutVotes: input.cutVotes,
      totalVotes,
      status: 'early_read',
      keepPercent: null,
      closestGuesser: null,
    };
  }
  const keepPercent = keepPercentFromCounts(input.keepVotes, totalVotes);
  if (keepPercent === null) {
    throw new Error('A revealed day needs a Keep percent');
  }
  return {
    dayId: input.dayId,
    promptId: input.promptId,
    closedAt: input.closedAt,
    keepVotes: input.keepVotes,
    cutVotes: input.cutVotes,
    totalVotes,
    status: 'revealed',
    keepPercent,
    closestGuesser: findClosestGuesser(input.locks, keepPercent),
  };
}

export function findMostDividedCall(
  days: readonly { dayId: string; promptTitle: string; snapshot: DaySnapshot }[]
): MostDividedCall | null {
  const revealed = days
    .filter((day) => day.snapshot.status === 'revealed' && day.snapshot.keepPercent !== null)
    .map((day) => {
      const keepPercent = day.snapshot.keepPercent as number;
      return {
        dayId: day.dayId,
        promptTitle: day.promptTitle,
        keepPercent,
        totalVotes: day.snapshot.totalVotes,
        distanceFromSplit: Math.abs(keepPercent - 50),
      };
    })
    .filter((day) => day.distanceFromSplit <= MOST_DIVIDED_MAX_DISTANCE);
  if (revealed.length === 0) {
    return null;
  }
  revealed.sort((a, b) => {
    if (a.distanceFromSplit !== b.distanceFromSplit) {
      return a.distanceFromSplit - b.distanceFromSplit;
    }
    if (a.totalVotes !== b.totalVotes) {
      return b.totalVotes - a.totalVotes;
    }
    return a.dayId < b.dayId ? 1 : -1;
  });
  return revealed[0] ?? null;
}

export function scoreAgainstSnapshot(
  prediction: number,
  snapshot: DaySnapshot
): { score: number; error: number; keepPercent: number } | null {
  if (snapshot.status !== 'revealed' || snapshot.keepPercent === null) {
    return null;
  }
  return {
    keepPercent: snapshot.keepPercent,
    error: predictionError(prediction, snapshot.keepPercent),
    score: scorePrediction(prediction, snapshot.keepPercent),
  };
}
