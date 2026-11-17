export const CATEGORY_LABEL: Record<string, string> = {
  airline: 'Airline',
  airport: 'Airport',
  venue: 'Venue',
  park: 'Park',
  museum: 'Museum',
  transit: 'Transit',
  'return-policy': 'Returns',
  school: 'School',
};

export const keepCutPrompt = 'Keep this rule, or cut it?';
export const guessPrompt = 'What share of the room will say Keep?';
export const lockLabel = 'Lock in your call';
export const lockedWait = 'You are locked in. The room reveals at midnight, US Eastern.';
export const earlyReadLabel = 'Early read';
export const earlyReadBody =
  'Not enough locks to show a split. The vote count is real. There is no official score for this day.';
export const emptyArchive =
  'No closed days with a real split yet. The archive fills after real play, and we never invent votes.';
export const commentCta = 'Tell the room why in the comments';
export const loginCta = 'Log in to lock in your call';

export const locksLabel = (count: number): string => `${count} ${count === 1 ? 'lock' : 'locks'}`;
