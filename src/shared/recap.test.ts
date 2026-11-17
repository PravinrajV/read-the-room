import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildRecapView, shouldShowRecapCard } from './recap.ts';
import type { YesterdayRecap } from './types.ts';

const recap = (overrides: Partial<YesterdayRecap> = {}): YesterdayRecap => ({
  dayId: '2026-11-16',
  prompt: {
    id: 'p',
    title: 'No smoking, including e-cigs',
    scenario: '',
    outcome: '',
    category: 'airline',
    source: { title: 't', publisher: 'p', url: 'https://example.com', asOf: '2026-11-10' },
  },
  snapshot: {
    dayId: '2026-11-16',
    promptId: 'p',
    closedAt: '2026-11-17T05:00:00.000Z',
    keepVotes: 7,
    cutVotes: 5,
    totalVotes: 12,
    status: 'revealed',
    keepPercent: 58,
    closestGuesser: { userId: 'u', username: 'dee', prediction: 56, error: 2, score: 98 },
  },
  yourLock: { choice: 'keep', prediction: 64 },
  yourScore: 94,
  mostDivided: null,
  ...overrides,
});

describe('buildRecapView', () => {
  it('reports the real split, your call, your miss and the closest guess', () => {
    const view = buildRecapView(recap());
    assert.equal(view.kind, 'revealed');
    if (view.kind !== 'revealed') return;
    assert.equal(view.keepPercent, 58);
    assert.equal(view.cutPercent, 42);
    assert.equal(view.totalVotes, 12);
    assert.equal(view.yourChoice, 'keep');
    assert.equal(view.yourGuess, 64);
    assert.equal(view.guessError, 6);
    assert.equal(view.yourScore, 94);
    assert.deepEqual(view.closest, { username: 'dee', error: 2 });
  });

  it('shows no split or score for an early read', () => {
    const view = buildRecapView(
      recap({
        snapshot: {
          ...recap().snapshot,
          keepVotes: 3,
          cutVotes: 1,
          totalVotes: 4,
          status: 'early_read',
          keepPercent: null,
          closestGuesser: null,
        },
        yourScore: null,
      })
    );
    assert.equal(view.kind, 'early_read');
    assert.equal(view.totalVotes, 4);
    assert.equal('keepPercent' in view, false);
    assert.equal(view.yourChoice, 'keep');
  });

  it('leaves your stats empty when you did not play', () => {
    const view = buildRecapView(recap({ yourLock: null, yourScore: null }));
    assert.equal(view.kind, 'revealed');
    if (view.kind !== 'revealed') return;
    assert.equal(view.yourChoice, null);
    assert.equal(view.guessError, null);
    assert.equal(view.yourScore, null);
  });
});

describe('shouldShowRecapCard', () => {
  it('shows once per recap day until dismissed', () => {
    assert.equal(shouldShowRecapCard('2026-11-16', null), true);
    assert.equal(shouldShowRecapCard('2026-11-16', '2026-11-16'), false);
    assert.equal(shouldShowRecapCard('2026-11-16', '2026-11-15'), true);
    assert.equal(shouldShowRecapCard(null, null), false);
  });
});
