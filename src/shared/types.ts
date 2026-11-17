export type VoteChoice = 'keep' | 'cut';

export type DayStatus = 'open' | 'revealed' | 'early_read';

export type PromptCategory =
  | 'airline'
  | 'airport'
  | 'venue'
  | 'park'
  | 'museum'
  | 'transit'
  | 'return-policy'
  | 'school';

export type PromptSource = {
  title: string;
  publisher: string;
  url: string;
  asOf: string;
};

export type Prompt = {
  id: string;
  title: string;
  scenario: string;
  outcome: string;
  category: PromptCategory;
  source: PromptSource;
};

export type LockRecord = {
  userId: string;
  username: string;
  choice: VoteChoice;
  prediction: number;
  lockedAt: string;
};

export type ClosestGuesser = {
  userId: string;
  username: string;
  prediction: number;
  error: number;
  score: number;
};

export type DaySnapshot = {
  dayId: string;
  promptId: string;
  closedAt: string;
  keepVotes: number;
  cutVotes: number;
  totalVotes: number;
  status: 'revealed' | 'early_read';
  keepPercent: number | null;
  closestGuesser: ClosestGuesser | null;
};

export type DayRecord = {
  dayId: string;
  promptId: string;
  status: DayStatus;
  openedAt: string;
  closedAt: string | null;
  locks: Record<string, LockRecord>;
  keepVotes: number;
  cutVotes: number;
  snapshot: DaySnapshot | null;
};

export type StreakState = {
  count: number;
  lastPlayedDayId: string | null;
};

export type ArchivePlay = {
  dayId: string;
  userId: string;
  username: string;
  choice: VoteChoice;
  prediction: number;
  score: number;
  error: number;
  keepPercent: number;
  playedAt: string;
};

export type MostDividedCall = {
  dayId: string;
  promptTitle: string;
  keepPercent: number;
  totalVotes: number;
  distanceFromSplit: number;
};

export type PlayerView = {
  userId: string | null;
  username: string | null;
  canLock: boolean;
  lock: LockRecord | null;
  score: number | null;
  streak: StreakState;
  archivePlay: ArchivePlay | null;
};

export type YesterdayRecap = {
  dayId: string;
  prompt: Prompt;
  snapshot: DaySnapshot;
  /** The viewer's own call and guess for that day, if they locked one. */
  yourLock: { choice: VoteChoice; prediction: number } | null;
  yourScore: number | null;
  mostDivided: MostDividedCall | null;
};

export type ArchiveDaySummary = {
  dayId: string;
  prompt: Prompt;
  status: 'revealed' | 'early_read';
  totalVotes: number;
  keepPercent: number | null;
  played: boolean;
  yourScore: number | null;
};
