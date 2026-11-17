import { MAX_PREDICTION, MIN_PREDICTION } from './constants';

export function isPrediction(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_PREDICTION &&
    value <= MAX_PREDICTION
  );
}

export function assertPrediction(value: unknown): number {
  if (!isPrediction(value)) {
    throw new Error('Guess has to be a whole number from 0 to 100');
  }
  return value;
}

/** Official Keep share, 0 to 100. Null if there are no votes. */
export function keepPercentFromCounts(
  keepVotes: number,
  totalVotes: number
): number | null {
  if (keepVotes < 0 || totalVotes < 0 || keepVotes > totalVotes) {
    throw new Error('Vote counts are invalid');
  }
  if (totalVotes === 0) {
    return null;
  }
  return Math.round((keepVotes / totalVotes) * 100);
}

export function predictionError(
  guess: number,
  actualKeepPercent: number
): number {
  return Math.abs(assertPrediction(guess) - assertPrediction(actualKeepPercent));
}

/** 100 for a perfect guess. Each percentage point off costs one point. */
export function scorePrediction(
  guess: number,
  actualKeepPercent: number
): number {
  return Math.max(0, 100 - predictionError(guess, actualKeepPercent));
}
