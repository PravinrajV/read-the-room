import type { ArchiveDaySummary, ArchivePlay, DaySnapshot, Prompt } from './types';
import { scoreAgainstSnapshot } from './reveal';
import { assertPrediction } from './scoring';

export function canScoreArchiveDay(snapshot: DaySnapshot | null): boolean {
  return snapshot?.status === 'revealed' && snapshot.keepPercent !== null;
}

export function summarizeArchiveDay(input: {
  dayId: string;
  prompt: Prompt;
  snapshot: DaySnapshot;
  play: ArchivePlay | null;
}): ArchiveDaySummary {
  return {
    dayId: input.dayId,
    prompt: input.prompt,
    status: input.snapshot.status,
    totalVotes: input.snapshot.totalVotes,
    keepPercent: input.snapshot.keepPercent,
    played: input.play !== null,
    // An early read has no official split, so an older stored score never shows.
    yourScore: input.snapshot.status === 'revealed' ? (input.play?.score ?? null) : null,
  };
}

export function playArchiveDay(input: {
  dayId: string;
  userId: string;
  username: string;
  choice: 'keep' | 'cut';
  prediction: number;
  snapshot: DaySnapshot;
  playedAt: string;
  existingPlay?: ArchivePlay | null;
}): ArchivePlay {
  if (input.existingPlay) {
    return input.existingPlay;
  }
  const scored = scoreAgainstSnapshot(
    assertPrediction(input.prediction),
    input.snapshot
  );
  if (!scored) {
    throw new Error(
      'This day is an early read, so there is no official split to score against'
    );
  }
  return {
    dayId: input.dayId,
    userId: input.userId,
    username: input.username,
    choice: input.choice,
    prediction: input.prediction,
    score: scored.score,
    error: scored.error,
    keepPercent: scored.keepPercent,
    playedAt: input.playedAt,
  };
}

/** Prefer revealed days the player has not tried yet, oldest first, up to a limit. */
export function quickPlayQueue(
  days: readonly ArchiveDaySummary[],
  limit = 5
): ArchiveDaySummary[] {
  return days
    .filter((day) => day.status === 'revealed' && !day.played)
    .slice(0, limit);
}
