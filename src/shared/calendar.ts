import { DAY_TIMEZONE, PROMPT_EPOCH_DAY_ID } from './constants';

const DAY_ID_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDayId(value: string): boolean {
  if (!DAY_ID_PATTERN.test(value)) {
    return false;
  }
  const utcNoon = Date.parse(`${value}T12:00:00.000Z`);
  if (Number.isNaN(utcNoon)) {
    return false;
  }
  return dayIdFromInstant(new Date(utcNoon), 'UTC') === value;
}


function parseDayParts(dayId: string): [number, number, number] {
  const [year, month, day] = dayId.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid day id: ${dayId}`);
  }
  return [year, month, day];
}

export function assertDayId(value: string): string {
  if (!isDayId(value)) {
    throw new Error(`Invalid day id: ${value}`);
  }
  return value;
}

export function dayIdFromInstant(
  now: Date,
  timeZone: string = DAY_TIMEZONE
): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addDays(dayId: string, delta: number): string {
  assertDayId(dayId);
  const [year, month, day] = parseDayParts(dayId);
  const utc = Date.UTC(year, month - 1, day + delta, 12, 0, 0);
  return dayIdFromInstant(new Date(utc), 'UTC');
}

export function compareDayIds(a: string, b: string): number {
  assertDayId(a);
  assertDayId(b);
  return a === b ? 0 : a < b ? -1 : 1;
}

export function daysBetween(fromDayId: string, toDayId: string): number {
  assertDayId(fromDayId);
  assertDayId(toDayId);
  const from = Date.parse(`${fromDayId}T12:00:00.000Z`);
  const to = Date.parse(`${toDayId}T12:00:00.000Z`);
  return Math.round((to - from) / 86_400_000);
}

export function promptIndexForDay(
  dayId: string,
  catalogLength: number,
  epochDayId: string = PROMPT_EPOCH_DAY_ID
): number {
  if (catalogLength <= 0) {
    throw new Error('Prompt catalog is empty');
  }
  const offset = daysBetween(epochDayId, dayId);
  const index = offset % catalogLength;
  return index < 0 ? index + catalogLength : index;
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - date.getTime();
}

/** Midnight at the start of this calendar day in the given zone, as a UTC Date. */
export function zonedMidnight(
  dayId: string,
  timeZone: string = DAY_TIMEZONE
): Date {
  assertDayId(dayId);
  const [year, month, day] = parseDayParts(dayId);
  const utcGuess = Date.UTC(year, month - 1, day, 0, 0, 0);
  let offset = timeZoneOffsetMs(new Date(utcGuess), timeZone);
  let utc = Date.UTC(year, month - 1, day, 0, 0, 0) - offset;
  offset = timeZoneOffsetMs(new Date(utc), timeZone);
  utc = Date.UTC(year, month - 1, day, 0, 0, 0) - offset;
  return new Date(utc);
}

export function nextCloseAt(
  now: Date,
  timeZone: string = DAY_TIMEZONE
): Date {
  const todayId = dayIdFromInstant(now, timeZone);
  const tomorrowId = addDays(todayId, 1);
  return zonedMidnight(tomorrowId, timeZone);
}

export function formatDayLabel(
  dayId: string,
  timeZone: string = DAY_TIMEZONE
): string {
  assertDayId(dayId);
  const midnight = zonedMidnight(dayId, timeZone);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(midnight);
}

/**
 * Returns every calendar day that should already be closed, after lastClosedDayId,
 * up through yesterday in the given zone. Close is always for a finished day, never today.
 */
export function pendingCloseDayIds(
  now: Date,
  lastClosedDayId: string | null,
  timeZone: string = DAY_TIMEZONE
): string[] {
  const todayId = dayIdFromInstant(now, timeZone);
  const yesterdayId = addDays(todayId, -1);
  const startId = lastClosedDayId
    ? addDays(assertDayId(lastClosedDayId), 1)
    : yesterdayId;
  if (compareDayIds(startId, yesterdayId) > 0) {
    return [];
  }
  const pending: string[] = [];
  let cursor = startId;
  while (compareDayIds(cursor, yesterdayId) <= 0) {
    pending.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return pending;
}
