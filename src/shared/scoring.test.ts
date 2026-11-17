import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  keepPercentFromCounts,
  predictionError,
  scorePrediction,
  isPrediction,
} from './scoring.ts';

describe('scoring', () => {
  it('only accepts whole numbers from 0 to 100', () => {
    assert.equal(isPrediction(0), true);
    assert.equal(isPrediction(100), true);
    assert.equal(isPrediction(42.5), false);
    assert.equal(isPrediction(-1), false);
    assert.equal(isPrediction(101), false);
    assert.equal(isPrediction(NaN), false);
  });

  it('rounds the Keep share the way we tell players we will', () => {
    assert.equal(keepPercentFromCounts(0, 0), null);
    assert.equal(keepPercentFromCounts(1, 1), 100);
    assert.equal(keepPercentFromCounts(0, 8), 0);
    assert.equal(keepPercentFromCounts(1, 2), 50);
    assert.equal(keepPercentFromCounts(1, 3), 33);
    assert.equal(keepPercentFromCounts(2, 3), 67);
    assert.equal(keepPercentFromCounts(1, 8), 13);
  });

  it('scores a perfect guess at 100 and knocks off one point per percent', () => {
    assert.equal(scorePrediction(50, 50), 100);
    assert.equal(scorePrediction(47, 50), 97);
    assert.equal(scorePrediction(0, 100), 0);
    assert.equal(scorePrediction(100, 0), 0);
    assert.equal(predictionError(40, 55), 15);
  });
});
