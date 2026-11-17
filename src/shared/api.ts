import type {
  ArchiveDaySummary,
  ArchivePlay,
  DaySnapshot,
  DayStatus,
  LockRecord,
  MostDividedCall,
  Prompt,
  StreakState,
  YesterdayRecap,
} from './types';

export type ErrorResponse = {
  status: 'error';
  message: string;
};

export type GameStateResponse = {
  type: 'game-state';
  now: string;
  dayId: string;
  status: DayStatus;
  closesAt: string;
  prompt: Prompt;
  fixture: boolean;
  localPreview: boolean;
  voteCount: number;
  snapshot: DaySnapshot | null;
  player: {
    userId: string | null;
    username: string | null;
    canLock: boolean;
    lock: LockRecord | null;
    score: number | null;
    streak: StreakState;
  };
  recap: YesterdayRecap | null;
  mostDivided: MostDividedCall | null;
  archive: ArchiveDaySummary[];
  commentUrl: string | null;
};

export type LockRequest = {
  choice: 'keep' | 'cut';
  prediction: number;
};

export type LockResponse = {
  type: 'lock';
  state: GameStateResponse;
};

export type ArchivePlayRequest = {
  dayId: string;
  choice: 'keep' | 'cut';
  prediction: number;
};

export type ArchivePlayResponse = {
  type: 'archive-play';
  play: ArchivePlay;
  state: GameStateResponse;
};
