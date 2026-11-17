/** Shared rules for Read the Room. Keep these values in one place. */

export const APP_NAME = 'Read the Room';
export const APP_SLUG = 'read-the-room';

/** Day boundaries and the reveal use US Eastern, including DST. */
export const DAY_TIMEZONE = 'America/New_York';

/**
 * Day 0 of the prompt calendar. Prompt index is days since this date,
 * modulo the catalog length. Do not reorder the catalog after we ship.
 */
export const PROMPT_EPOCH_DAY_ID = '2026-11-11';

/** A closed day needs at least this many locks before we show a split. */
export const MIN_REVEAL_VOTES = 10;

export const MIN_PREDICTION = 0;
export const MAX_PREDICTION = 100;

/** Reddit user flair is short. Keep generated text inside this budget. */
export const FLAIR_MAX_LENGTH = 22;

export const FIXTURE_BANNER =
  'Dev fixture. These splits are not real and will never ship as real votes.';

export const LOCAL_PREVIEW_BANNER =
  'Local preview. Nothing here is a live Reddit vote.';

// A day only counts as "most divided" if its final split landed between 35% and 65% Keep.
export const MOST_DIVIDED_MAX_DISTANCE = 15;
