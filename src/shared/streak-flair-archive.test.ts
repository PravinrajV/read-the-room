import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { emptyStreak, recordLivePlay } from './streak.ts';
import { formatFlair } from './flair.ts';
import { canScoreArchiveDay, playArchiveDay, quickPlayQueue, summarizeArchiveDay } from './archive.ts';
import type { DaySnapshot } from './types.ts';
import { getPromptById } from './prompts.ts';

const revealed: DaySnapshot = {
  dayId: '2026-11-12',
  promptId: 'nfl-clear-bag',
  closedAt: '2026-11-13T05:00:00.000Z',
  keepVotes: 7,
  cutVotes: 3,
  totalVotes: 10,
  status: 'revealed',
  keepPercent: 70,
  closestGuesser: null,
};

const early: DaySnapshot = {
  ...revealed,
  status: 'early_read',
  keepPercent: null,
  totalVotes: 4,
  keepVotes: 2,
  cutVotes: 2,
};

describe('streaks and flair', () => {
  it('starts a streak at 1 and increments only on consecutive days', () => {
    const first = recordLivePlay(emptyStreak(), '2026-11-11');
    assert.deepEqual(first, { count: 1, lastPlayedDayId: '2026-11-11' });
    const second = recordLivePlay(first, '2026-11-12');
    assert.equal(second.count, 2);
    const broken = recordLivePlay(second, '2026-11-14');
    assert.equal(broken.count, 1);
    assert.deepEqual(recordLivePlay(second, '2026-11-12'), second);
  });

  it('keeps flair short enough for Reddit', () => {
    assert.equal(formatFlair({ streak: 7, lastScore: 98 }), 'Streak 7 98');
    assert.equal(formatFlair({ streak: 0, lastScore: null }), 'Streak 0');
    assert.ok(formatFlair({ streak: 99999, lastScore: 100 }).length <= 22);
  });
});

describe('archive', () => {
  it('refuses to invent a score for an early read', () => {
    assert.equal(canScoreArchiveDay(early), false);
    assert.throws(() =>
      playArchiveDay({
        dayId: early.dayId,
        userId: 'judge',
        username: 'judge',
        choice: 'keep',
        prediction: 50,
        snapshot: early,
        playedAt: '2026-11-13T15:00:00.000Z',
      })
    );
  });

  it('scores an archive play against the frozen split and does not overwrite a first try', () => {
    const play = playArchiveDay({
      dayId: revealed.dayId,
      userId: 'judge',
      username: 'judge',
      choice: 'cut',
      prediction: 73,
      snapshot: revealed,
      playedAt: '2026-11-13T15:00:00.000Z',
    });
    assert.equal(play.score, 97);
    assert.equal(play.keepPercent, 70);
    const again = playArchiveDay({
      dayId: revealed.dayId,
      userId: 'judge',
      username: 'judge',
      choice: 'keep',
      prediction: 10,
      snapshot: revealed,
      playedAt: '2026-11-13T16:00:00.000Z',
      existingPlay: play,
    });
    assert.equal(again.score, 97);
    assert.equal(again.prediction, 73);
  });

  it('queues up to five unplayed revealed days, oldest first', () => {
    const prompt = getPromptById('nfl-clear-bag');
    const days = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'].map(
      (dayId, index) =>
        summarizeArchiveDay({
          dayId,
          prompt,
          snapshot: { ...revealed, dayId },
          play: index === 0 ? { dayId, userId: 'j', username: 'j', choice: 'keep', prediction: 70, score: 100, error: 0, keepPercent: 70, playedAt: '' } : null,
        })
    );
    days.push(
      summarizeArchiveDay({
        dayId: '2026-11-09',
        prompt,
        snapshot: early,
        play: null,
      })
    );
    const queue = quickPlayQueue(days, 5);
    assert.deepEqual(
      queue.map((day) => day.dayId),
      ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']
    );
  });
});
