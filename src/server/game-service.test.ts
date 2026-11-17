import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { zonedMidnight } from '../shared/calendar.ts';
import { promptForDay } from '../shared/catalog.ts';
import { GameService } from './game-service.ts';
import { MemoryStore } from './memory-store.ts';

const noonEt = (dayId: string) => new Date(zonedMidnight(dayId).getTime() + 12 * 60 * 60 * 1000);

const actor = (id: string) => ({ userId: id, username: id });

async function fillDay(
  service: GameService,
  dayId: string,
  players: { id: string; choice: 'keep' | 'cut'; prediction: number }[]
) {
  const now = noonEt(dayId);
  for (const player of players) {
    await service.lockToday(now, actor(player.id), player.choice, player.prediction);
  }
}

describe('GameService', () => {
  it('starts with an empty archive and does not invent votes', async () => {
    const service = new GameService({ store: new MemoryStore() });
    const state = await service.getState(noonEt('2026-11-13'), actor('ana'));
    assert.equal(state.dayId, '2026-11-13');
    assert.equal(state.status, 'open');
    assert.equal(state.voteCount, 0);
    assert.equal(state.snapshot, null);
    assert.deepEqual(state.archive, []);
    assert.equal(state.fixture, false);
    assert.equal(state.prompt.id, promptForDay('2026-11-13').id);
  });

  it('accepts one lock per player and hides the live split', async () => {
    const service = new GameService({ store: new MemoryStore() });
    const state = await service.lockToday(noonEt('2026-11-13'), actor('ana'), 'keep', 62);
    assert.equal(state.player.lock?.choice, 'keep');
    assert.equal(state.player.lock?.prediction, 62);
    assert.equal(state.voteCount, 1);
    assert.equal(state.snapshot, null);
    assert.equal(state.player.canLock, false);
    assert.equal(state.player.streak.count, 1);
    await assert.rejects(() => service.lockToday(noonEt('2026-11-13'), actor('ana'), 'cut', 10));
    await assert.rejects(() => service.lockToday(noonEt('2026-11-13'), { userId: null, username: null }, 'keep', 50));
    await assert.rejects(() => service.lockToday(noonEt('2026-11-13'), actor('bo'), 'keep', 50.5));
  });

  it('closes yesterday as an early read under 10 locks, and as a reveal at 10', async () => {
    const store = new MemoryStore();
    const service = new GameService({ store });
    const nine = Array.from({ length: 9 }, (_, i) => ({
      id: `p${i}`,
      choice: (i < 5 ? 'keep' : 'cut') as 'keep' | 'cut',
      prediction: 50,
    }));
    await fillDay(service, '2026-11-12', nine);
    const early = await service.getState(noonEt('2026-11-13'), actor('p0'));
    assert.equal(early.recap?.snapshot.status, 'early_read');
    assert.equal(early.recap?.snapshot.keepPercent, null);
    assert.equal(early.recap?.yourScore, null);
    assert.equal(early.archive[0]?.status, 'early_read');

    const store2 = new MemoryStore();
    const service2 = new GameService({ store: store2 });
    const ten = [
      ...nine,
      { id: 'p9', choice: 'keep' as const, prediction: 60 },
    ];
    await fillDay(service2, '2026-11-12', ten);
    const revealed = await service2.getState(noonEt('2026-11-13'), actor('p9'));
    assert.equal(revealed.recap?.snapshot.status, 'revealed');
    assert.equal(revealed.recap?.snapshot.keepPercent, 60);
    assert.equal(revealed.recap?.yourScore, 100);
    assert.equal(revealed.recap?.snapshot.closestGuesser?.username, 'p9');
  });

  it('is idempotent on close and ignores late live locks', async () => {
    const store = new MemoryStore();
    const service = new GameService({ store });
    await fillDay(
      service,
      '2026-11-12',
      Array.from({ length: 10 }, (_, i) => ({
        id: `p${i}`,
        choice: 'keep' as const,
        prediction: 80,
      }))
    );
    const first = await service.getState(noonEt('2026-11-13'), actor('p0'));
    const second = await service.getState(noonEt('2026-11-14'), actor('p0'));
    assert.equal(first.archive[0]?.keepPercent, second.archive[0]?.keepPercent);
    await assert.rejects(() =>
      service.lockToday(noonEt('2026-11-12'), actor('late'), 'cut', 10)
    );
  });

  it('scores archive plays against the frozen split and never changes it', async () => {
    const service = new GameService({ store: new MemoryStore() });
    await fillDay(
      service,
      '2026-11-12',
      Array.from({ length: 10 }, (_, i) => ({
        id: `p${i}`,
        choice: (i < 7 ? 'keep' : 'cut') as 'keep' | 'cut',
        prediction: 70,
      }))
    );
    const afterClose = await service.getState(noonEt('2026-11-13'), actor('judge'));
    assert.equal(afterClose.archive[0]?.keepPercent, 70);
    assert.equal(afterClose.voteCount, 0);
    const played = await service.playArchive(
      noonEt('2026-11-13'),
      actor('judge'),
      '2026-11-12',
      'cut',
      65
    );
    assert.equal(played.play.score, 95);
    assert.equal(played.state.archive[0]?.yourScore, 95);
    assert.equal(played.state.archive[0]?.keepPercent, 70);
    const today = await service.getState(noonEt('2026-11-13'), actor('judge'));
    assert.equal(today.voteCount, 0);
    assert.equal(today.player.streak.count, 0);
    const again = await service.playArchive(
      noonEt('2026-11-13'),
      actor('judge'),
      '2026-11-12',
      'keep',
      10
    );
    assert.equal(again.play.prediction, 65);
  });

  it('builds a streak across consecutive live days and resets after a miss', async () => {
    const service = new GameService({ store: new MemoryStore() });
    await service.lockToday(noonEt('2026-11-11'), actor('ana'), 'keep', 50);
    await service.lockToday(noonEt('2026-11-12'), actor('ana'), 'cut', 40);
    const mid = await service.getState(noonEt('2026-11-12'), actor('ana'));
    assert.equal(mid.player.streak.count, 2);
    const later = await service.lockToday(noonEt('2026-11-14'), actor('ana'), 'keep', 55);
    assert.equal(later.player.streak.count, 1);
  });

  it('shares one vote tally for the Eastern day, even across two post views', async () => {
    const store = new MemoryStore();
    const service = new GameService({ store });
    await service.lockToday(noonEt('2026-11-13'), actor('ana'), 'keep', 60);
    const fromFirstPost = await service.getState(noonEt('2026-11-13'), actor('bo'));
    const fromSecondPost = await service.getState(noonEt('2026-11-13'), actor('cy'));
    assert.equal(fromFirstPost.voteCount, 1);
    assert.equal(fromSecondPost.voteCount, 1);
    await service.lockToday(noonEt('2026-11-13'), actor('bo'), 'cut', 40);
    const later = await service.getState(noonEt('2026-11-13'), actor('ana'));
    assert.equal(later.voteCount, 2);
    const day = await store.getDay('2026-11-13');
    assert.equal(day?.keepVotes, 1);
    assert.equal(day?.cutVotes, 1);
    assert.equal('postId' in (day ?? {}), false);
  });
});
