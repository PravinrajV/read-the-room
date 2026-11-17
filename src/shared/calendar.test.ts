import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addDays,
  compareDayIds,
  dayIdFromInstant,
  daysBetween,
  isDayId,
  nextCloseAt,
  pendingCloseDayIds,
  promptIndexForDay,
  zonedMidnight,
} from './calendar.ts';

describe('calendar', () => {
  it('accepts real dates and rejects impossible ones', () => {
    assert.equal(isDayId('2026-11-13'), true);
    assert.equal(isDayId('2026-02-29'), false);
    assert.equal(isDayId('2026-13-01'), false);
    assert.equal(isDayId('11-13-2026'), false);
  });

  it('reads the Eastern calendar date, including around midnight', () => {
    const beforeMidnight = new Date('2026-11-13T04:30:00.000Z'); // 11:30 PM ET on Nov 12
    const afterMidnight = new Date('2026-11-13T05:30:00.000Z'); // 12:30 AM ET on Nov 13
    assert.equal(dayIdFromInstant(beforeMidnight), '2026-11-12');
    assert.equal(dayIdFromInstant(afterMidnight), '2026-11-13');
  });

  it('handles the 2026 spring-forward and fall-back midnights', () => {
    // DST starts 2026-03-08 at 2:00 AM ET. Midnight that morning still exists.
    const spring = zonedMidnight('2026-03-08');
    assert.equal(dayIdFromInstant(spring), '2026-03-08');
    assert.equal(dayIdFromInstant(new Date(spring.getTime() - 1)), '2026-03-07');
    assert.equal(nextCloseAt(new Date(spring.getTime() + 1000)).getTime(), zonedMidnight('2026-03-09').getTime());

    // DST ends 2026-11-01 at 2:00 AM ET. Midnight is unambiguous.
    const fall = zonedMidnight('2026-11-01');
    assert.equal(dayIdFromInstant(fall), '2026-11-01');
    assert.equal(dayIdFromInstant(new Date(fall.getTime() - 1)), '2026-10-31');
  });

  it('adds and compares calendar days in UTC date math', () => {
    assert.equal(addDays('2026-11-13', -1), '2026-11-12');
    assert.equal(addDays('2026-03-08', -1), '2026-03-07');
    assert.equal(daysBetween('2026-11-11', '2026-11-13'), 2);
    assert.equal(compareDayIds('2026-11-12', '2026-11-13'), -1);
  });

  it('rotates prompts from the epoch, including dates before the epoch', () => {
    assert.equal(promptIndexForDay('2026-11-11', 30), 0);
    assert.equal(promptIndexForDay('2026-11-12', 30), 1);
    assert.equal(promptIndexForDay('2026-12-11', 30), 0);
    assert.equal(promptIndexForDay('2026-11-10', 30), 29);
  });

  it('closes every finished Eastern day after the last close, never today', () => {
    const now = new Date('2026-11-13T14:00:00.000Z'); // 9:00 AM ET Nov 13
    assert.deepEqual(pendingCloseDayIds(now, null), ['2026-11-12']);
    assert.deepEqual(pendingCloseDayIds(now, '2026-11-12'), []);
    assert.deepEqual(pendingCloseDayIds(now, '2026-11-09'), [
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
    ]);
    const justBeforeMidnight = new Date(zonedMidnight('2026-11-13').getTime() - 1);
    assert.deepEqual(pendingCloseDayIds(justBeforeMidnight, '2026-11-11'), []);
  });
});
