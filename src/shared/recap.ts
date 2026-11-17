import { predictionError } from './scoring';
import type { VoteChoice, YesterdayRecap } from './types';

/** Everything the "Yesterday's room" card shows, derived only from the real recap. */
export type RecapView =
  | {
      kind: 'revealed';
      dayId: string;
      title: string;
      keepPercent: number;
      cutPercent: number;
      totalVotes: number;
      yourChoice: VoteChoice | null;
      yourGuess: number | null;
      guessError: number | null;
      yourScore: number | null;
      closest: { username: string; error: number } | null;
    }
  | {
      kind: 'early_read';
      dayId: string;
      title: string;
      totalVotes: number;
      yourChoice: VoteChoice | null;
      yourGuess: number | null;
    };

export function buildRecapView(recap: YesterdayRecap): RecapView {
  const yourChoice = recap.yourLock?.choice ?? null;
  const yourGuess = recap.yourLock?.prediction ?? null;
  const { snapshot } = recap;
  if (snapshot.status !== 'revealed' || snapshot.keepPercent === null) {
    return {
      kind: 'early_read',
      dayId: recap.dayId,
      title: recap.prompt.title,
      totalVotes: snapshot.totalVotes,
      yourChoice,
      yourGuess,
    };
  }
  const keepPercent = snapshot.keepPercent;
  return {
    kind: 'revealed',
    dayId: recap.dayId,
    title: recap.prompt.title,
    keepPercent,
    cutPercent: 100 - keepPercent,
    totalVotes: snapshot.totalVotes,
    yourChoice,
    yourGuess,
    guessError: yourGuess === null ? null : predictionError(yourGuess, keepPercent),
    yourScore: yourGuess === null ? null : recap.yourScore,
    closest: snapshot.closestGuesser
      ? { username: snapshot.closestGuesser.username, error: snapshot.closestGuesser.error }
      : null,
  };
}

/** The full card shows once per recap day, until the player dismisses it. */
export function shouldShowRecapCard(
  recapDayId: string | null,
  dismissedDayId: string | null
): boolean {
  return recapDayId !== null && recapDayId !== dismissedDayId;
}
