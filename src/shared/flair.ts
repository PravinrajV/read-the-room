import { FLAIR_MAX_LENGTH } from './constants';

export function formatFlair(input: {
  streak: number;
  lastScore: number | null;
}): string {
  const streak = Math.max(0, Math.floor(input.streak));
  const scorePart =
    input.lastScore === null ? null : ` ${Math.round(input.lastScore)}`;
  const withScore = `Streak ${streak}${scorePart ?? ''}`.trim();
  if (withScore.length <= FLAIR_MAX_LENGTH) {
    return withScore;
  }
  const compact = `S${streak}${input.lastScore === null ? '' : ` ${Math.round(input.lastScore)}`}`;
  if (compact.length <= FLAIR_MAX_LENGTH) {
    return compact;
  }
  return compact.slice(0, FLAIR_MAX_LENGTH);
}
