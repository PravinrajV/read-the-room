import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MIN_REVEAL_VOTES } from './constants.ts';
import {
  closeDay,
  findClosestGuesser,
  findMostDividedCall,
  isEarlyRead,
  normalizeDayRecord,
  normalizeSnapshot,
  scoreAgainstSnapshot,
} from './reveal.ts';
import type { LockRecord } from './types.ts';

function lock(
  userId: string,
  prediction: number,
  lockedAt: string,
  choice: 'keep' | 'cut' = 'keep'
): LockRecord {
  return {
    userId,
    username: userId,
    choice,
    prediction,
    lockedAt,
  };
}

describe('reveal', () => {
  it('treats anything under 10 locks as an early read', () => {
    assert.equal(MIN_REVEAL_VOTES, 10);
    assert.equal(isEarlyRead(0), true);
    assert.equal(isEarlyRead(9), true);
    assert.equal(isEarlyRead(10), false);
  });

  it('hides the split and the closest guesser when the room is too small', () => {
    const locks = Array.from({ length: 9 }, (_, i) =>
      lock(`u${i}`, 50, `2026-11-12T12:00:0${i}.000Z`, i < 5 ? 'keep' : 'cut')
    );
    const snapshot = closeDay({
      dayId: '2026-11-12',
      promptId: 'demo',
      closedAt: '2026-11-13T05:00:00.000Z',
      keepVotes: 5,
      cutVotes: 4,
      locks,
    });
    assert.equal(snapshot.status, 'early_read');
    assert.equal(snapshot.keepPercent, null);
    assert.equal(snapshot.closestGuesser, null);
    assert.equal(snapshot.totalVotes, 9);
    assert.equal(scoreAgainstSnapshot(50, snapshot), null);
  });

  it('freezes a revealed split and picks the closest, earlier lock on a tie', () => {
    const locks = [
      lock('ana', 67, '2026-11-12T12:00:00.000Z'),
      lock('bo', 67, '2026-11-12T11:00:00.000Z'),
      lock('cam', 90, '2026-11-12T10:00:00.000Z', 'cut'),
    ];
    const snapshot = closeDay({
      dayId: '2026-11-12',
      promptId: 'demo',
      closedAt: '2026-11-13T05:00:00.000Z',
      keepVotes: 2,
      cutVotes: 1,
      locks,
      minVotes: 3,
    });
    assert.equal(snapshot.status, 'revealed');
    assert.equal(snapshot.keepPercent, 67);
    assert.equal(snapshot.closestGuesser?.username, 'bo');
    assert.equal(snapshot.closestGuesser?.error, 0);
    assert.equal(snapshot.closestGuesser?.score, 100);
    assert.deepEqual(scoreAgainstSnapshot(70, snapshot), {
      keepPercent: 67,
      error: 3,
      score: 97,
    });
  });

  it('rejects a close when the counts and the lock list disagree', () => {
    assert.throws(() =>
      closeDay({
        dayId: '2026-11-12',
        promptId: 'demo',
        closedAt: '2026-11-13T05:00:00.000Z',
        keepVotes: 2,
        cutVotes: 0,
        locks: [lock('ana', 50, '2026-11-12T12:00:00.000Z')],
      })
    );
  });

  it('picks the day closest to a 50/50 as the most divided call', () => {
    const most = findMostDividedCall([
      {
        dayId: '2026-11-10',
        promptTitle: 'Quiet Car',
        snapshot: {
          dayId: '2026-11-10',
          promptId: 'amtrak-quiet-car',
          closedAt: '2026-11-11T05:00:00.000Z',
          keepVotes: 8,
          cutVotes: 2,
          totalVotes: 10,
          status: 'revealed',
          keepPercent: 80,
          closestGuesser: null,
        },
      },
      {
        dayId: '2026-11-11',
        promptTitle: 'Clear bag',
        snapshot: {
          dayId: '2026-11-11',
          promptId: 'nfl-clear-bag',
          closedAt: '2026-11-12T05:00:00.000Z',
          keepVotes: 6,
          cutVotes: 6,
          totalVotes: 12,
          status: 'revealed',
          keepPercent: 50,
          closestGuesser: null,
        },
      },
      {
        dayId: '2026-11-12',
        promptTitle: 'Early',
        snapshot: {
          dayId: '2026-11-12',
          promptId: 'x',
          closedAt: '2026-11-13T05:00:00.000Z',
          keepVotes: 2,
          cutVotes: 2,
          totalVotes: 4,
          status: 'early_read',
          keepPercent: null,
          closestGuesser: null,
        },
      },
    ]);
    assert.equal(most?.dayId, '2026-11-11');
    assert.equal(most?.distanceFromSplit, 0);
    assert.equal(findClosestGuesser([], 50), null);
  });

  it('skips lopsided days so a 100% Keep day is never called most divided', () => {
    const lopsided = (dayId: string, keepPercent: number) => ({
      dayId,
      promptTitle: dayId,
      snapshot: {
        dayId,
        promptId: dayId,
        closedAt: '2026-11-17T05:00:00.000Z',
        keepVotes: keepPercent,
        cutVotes: 100 - keepPercent,
        totalVotes: 100,
        status: 'revealed' as const,
        keepPercent,
        closestGuesser: null,
      },
    });
    assert.equal(findMostDividedCall([lopsided('a', 100), lopsided('b', 80)]), null);
    assert.equal(findMostDividedCall([lopsided('a', 100), lopsided('c', 65)])?.dayId, 'c');
    assert.equal(findMostDividedCall([lopsided('d', 34)]), null);
  });
});

describe('normalizeSnapshot', () => {
  const base = {
    dayId: '2026-11-16',
    promptId: 'p',
    closedAt: '2026-11-17T05:00:00.000Z',
    keepVotes: 1,
    cutVotes: 0,
    totalVotes: 1,
    status: 'revealed' as const,
    keepPercent: 100,
    closestGuesser: { userId: 'u', username: 'u', prediction: 50, error: 50, score: 50 },
  };

  it('rewrites an under-threshold revealed snapshot as an early read', () => {
    const fixed = normalizeSnapshot(base);
    assert.equal(fixed.status, 'early_read');
    assert.equal(fixed.keepPercent, null);
    assert.equal(fixed.closestGuesser, null);
    assert.equal(fixed.totalVotes, 1);
    assert.equal(scoreAgainstSnapshot(50, fixed), null);
  });

  it('is idempotent and leaves valid snapshots alone', () => {
    const once = normalizeSnapshot(base);
    assert.deepEqual(normalizeSnapshot(once), once);
    const valid = { ...base, keepVotes: 7, cutVotes: 3, totalVotes: 10, keepPercent: 70 };
    assert.equal(normalizeSnapshot(valid), valid);
  });

  it('normalizes a stored day record and keeps it unchanged when valid', () => {
    const day = { status: 'revealed', snapshot: base };
    const fixed = normalizeDayRecord(day);
    assert.equal(fixed.status, 'early_read');
    assert.equal(fixed.snapshot?.status, 'early_read');
    const open = { status: 'open', snapshot: null };
    assert.equal(normalizeDayRecord(open), open);
  });
});
