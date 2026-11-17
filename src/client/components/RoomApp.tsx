import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { navigateTo } from '@devvit/web/client';
import type { GameStateResponse } from '../../shared/api';
import { formatDayLabel } from '../../shared/calendar';
import { LOCAL_PREVIEW_BANNER, FIXTURE_BANNER } from '../../shared/constants';
import { quickPlayQueue } from '../../shared/archive';
import { buildRecapView, shouldShowRecapCard } from '../../shared/recap';
import type { ArchiveDaySummary, VoteChoice } from '../../shared/types';
import {
  CATEGORY_LABEL,
  commentCta,
  earlyReadBody,
  earlyReadLabel,
  locksLabel,
  emptyArchive,
  guessPrompt,
  keepCutPrompt,
  lockLabel,
  lockedWait,
  loginCta,
} from '../copy';
import { useCountdown } from '../hooks/useCountdown';
import { useCountUp } from '../hooks/useCountUp';
import { useGame } from '../hooks/useGame';
import { readDismissedRecap, writeDismissedRecap } from '../theme';
import {
  ArchiveIcon,
  CutIcon,
  FlameIcon,
  KeepIcon,
  LockIcon,
  SplitBar,
  Stat,
  ThemeToggle,
  Wordmark,
} from './ui';

type Screen = 'today' | 'archive' | 'archive-play';

const percentLabel = (value: number) => `${value}%`;
const choiceLabel = (choice: VoteChoice) => (choice === 'keep' ? 'Keep' : 'Cut');

export const RoomApp = () => {
  const { state, loading, error, lock, playArchive } = useGame();
  const [screen, setScreen] = useState<Screen>('today');
  const [choice, setChoice] = useState<VoteChoice | null>(null);
  const [prediction, setPrediction] = useState(50);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [archiveDay, setArchiveDay] = useState<ArchiveDaySummary | null>(null);
  const [dismissedRecap, setDismissedRecap] = useState<string | null>(readDismissedRecap);

  if (loading && !state) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-center text-muted">Lighting the room…</p>
        </div>
      </Shell>
    );
  }

  if (!state) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-center text-cut">{error ?? 'Could not load today.'}</p>
        </div>
      </Shell>
    );
  }

  const showRecap = shouldShowRecapCard(state.recap?.dayId ?? null, dismissedRecap);

  return (
    <Shell
      banner={
        state.fixture ? FIXTURE_BANNER : state.localPreview ? LOCAL_PREVIEW_BANNER : null
      }
    >
      {screen === 'today' ? (
        <TodayScreen
          state={state}
          showRecap={showRecap}
          onDismissRecap={() => {
            if (state.recap) {
              writeDismissedRecap(state.recap.dayId);
              setDismissedRecap(state.recap.dayId);
            }
          }}
          onOpenRecap={() => setDismissedRecap(null)}
          choice={choice}
          prediction={prediction}
          busy={busy}
          error={localError ?? error}
          onChoice={setChoice}
          onPrediction={setPrediction}
          onLock={async () => {
            if (!choice) {
              setLocalError('Pick Keep or Cut first');
              return;
            }
            setBusy(true);
            setLocalError(null);
            try {
              await lock(choice, prediction);
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : 'Could not lock your call');
            } finally {
              setBusy(false);
            }
          }}
          onOpenArchive={() => setScreen('archive')}
        />
      ) : null}
      {screen === 'archive' ? (
        <ArchiveScreen
          state={state}
          onBack={() => setScreen('today')}
          onPlay={(day) => {
            setArchiveDay(day);
            setChoice(null);
            setPrediction(50);
            setScreen('archive-play');
          }}
        />
      ) : null}
      {screen === 'archive-play' && archiveDay ? (
        <ArchivePlayScreen
          day={archiveDay}
          choice={choice}
          prediction={prediction}
          busy={busy}
          error={localError}
          onChoice={setChoice}
          onPrediction={setPrediction}
          onBack={() => setScreen('archive')}
          onSubmit={async () => {
            if (!choice) {
              setLocalError('Pick Keep or Cut first');
              return;
            }
            setBusy(true);
            setLocalError(null);
            try {
              await playArchive(archiveDay.dayId, choice, prediction);
              setScreen('archive');
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : 'Could not score that day');
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
    </Shell>
  );
};

const Shell = ({
  children,
  banner,
}: {
  children: ReactNode;
  banner?: string | null;
}) => (
  <div className="room-shell flex h-full min-h-0 flex-col px-3 pt-2.5 sm:px-6 sm:pt-4">
    {banner ? (
      <div className="mx-auto mb-2 w-full max-w-[34rem] shrink-0 rounded-full border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-1 text-center text-[0.66rem] leading-snug tracking-wide text-accent">
        {banner}
      </div>
    ) : null}
    <div className="mx-auto flex min-h-0 w-full max-w-[34rem] flex-1 flex-col overflow-hidden">
      {children}
    </div>
  </div>
);

const TodayScreen = ({
  state,
  showRecap,
  onDismissRecap,
  onOpenRecap,
  choice,
  prediction,
  busy,
  error,
  onChoice,
  onPrediction,
  onLock,
  onOpenArchive,
}: {
  state: GameStateResponse;
  showRecap: boolean;
  onDismissRecap: () => void;
  onOpenRecap: () => void;
  choice: VoteChoice | null;
  prediction: number;
  busy: boolean;
  error: string | null;
  onChoice: (choice: VoteChoice) => void;
  onPrediction: (value: number) => void;
  onLock: () => void;
  onOpenArchive: () => void;
}) => {
  const remaining = useCountdown(state.status === 'open' ? state.closesAt : null);
  const lockedChoice = state.player.lock?.choice ?? choice;
  const lockedPrediction = state.player.lock?.prediction ?? prediction;
  const revealed = state.status === 'revealed' && state.snapshot;

  const canPlayToday = state.status === 'open' && !state.player.lock;
  const header = (
    <Header
      dayId={state.dayId}
      remaining={remaining}
      streak={state.player.streak.count}
      onOpenArchive={onOpenArchive}
      archiveCount={state.archive.length}
    />
  );

  if (showRecap && state.recap) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          {header}
          <YesterdayCard recap={state.recap} />
        </div>
        <div className="shrink-0 border-t border-line pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            className="btn-gold w-full rounded-full px-5 py-3 text-sm font-semibold"
            onClick={onDismissRecap}
          >
            {canPlayToday ? "Play today's call" : 'See today'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto pb-3">
        {header}
        {state.recap ? (
          <RecapStrip recap={state.recap} mostDivided={state.mostDivided} onOpen={onOpenRecap} />
        ) : null}
        <PromptCard state={state} />
        {state.player.lock && state.status === 'open' ? (
          <LockedCard
            choice={state.player.lock.choice}
            prediction={state.player.lock.prediction}
          />
        ) : null}
        {revealed && state.snapshot ? (
          <RevealCard
            snapshot={state.snapshot}
            yourChoice={state.player.lock?.choice ?? null}
            yourGuess={state.player.lock?.prediction ?? null}
            yourScore={state.player.score}
          />
        ) : null}
        {state.status === 'early_read' && state.snapshot ? (
          <EarlyReadCard count={state.snapshot.totalVotes} />
        ) : null}
        {error ? <p className="mt-3 text-sm text-cut">{error}</p> : null}
        {!state.player.userId ? <p className="mt-3 text-sm text-muted">{loginCta}</p> : null}
        {state.commentUrl && (state.player.lock || state.status !== 'open') ? (
          <button
            className="link mt-4 text-left text-sm"
            onClick={() => navigateTo(state.commentUrl as string)}
          >
            {commentCta}
          </button>
        ) : null}
        {lockedChoice && revealed ? (
          <p className="sr-only">
            You picked {lockedChoice} and guessed {percentLabel(lockedPrediction)}.
          </p>
        ) : null}
      </div>
      {canPlayToday ? (
        <PlayControls
          canLock={state.player.canLock}
          choice={choice}
          prediction={prediction}
          busy={busy}
          onChoice={onChoice}
          onPrediction={onPrediction}
          onLock={onLock}
        />
      ) : null}
    </div>
  );
};

const Header = ({
  dayId,
  remaining,
  streak,
  onOpenArchive,
  archiveCount,
}: {
  dayId: string;
  remaining: string;
  streak: number;
  onOpenArchive: () => void;
  archiveCount: number;
}) => (
  <header className="mb-2.5">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 shrink overflow-hidden whitespace-nowrap">
        <Wordmark />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className="tabular inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-2.5 text-[0.72rem] font-medium whitespace-nowrap text-fg-2"
          aria-label={streak > 0 ? `Streak ${streak}` : 'No streak yet'}
          title={streak > 0 ? `Streak ${streak}` : 'No streak yet'}
        >
          <FlameIcon className={`h-3.5 w-3.5 ${streak > 0 ? 'text-accent' : 'text-faint'}`} />
          <span aria-hidden="true">{streak}</span>
          <span className="hidden sm:inline" aria-hidden="true">
            {streak === 1 ? 'day' : 'days'}
          </span>
        </span>
        <button
          className="btn-ghost tabular inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[0.72rem] font-medium"
          onClick={onOpenArchive}
          aria-label={archiveCount ? `Archive, ${archiveCount} days` : 'Archive'}
        >
          <ArchiveIcon className="h-3.5 w-3.5" />
          <span className="hidden min-[400px]:inline">Archive</span>
          {archiveCount ? <span className="text-faint">{archiveCount}</span> : null}
        </button>
        <ThemeToggle />
      </div>
    </div>
    <p className="tabular mt-1 text-xs whitespace-nowrap text-muted">
      {formatDayLabel(dayId)}
      {remaining ? <span className="text-faint"> · {remaining}</span> : null}
    </p>
  </header>
);

const PromptCard = ({ state }: { state: GameStateResponse }) => {
  const [expanded, setExpanded] = useState(false);
  const canToggle = state.prompt.scenario.length > 160;

  return (
    <article className="room-card rounded-2xl px-4 py-3.5 sm:rounded-3xl sm:px-5 sm:py-5">
      <p className="eyebrow">{CATEGORY_LABEL[state.prompt.category] ?? state.prompt.category}</p>
      <h1 className="font-serif mt-1.5 text-[1.32rem] leading-[1.18] tracking-[-0.01em] text-fg sm:text-[1.6rem]">
        {state.prompt.title}
      </h1>
      <p
        className={`mt-2 text-sm leading-snug text-fg-2 sm:leading-relaxed ${
          canToggle && !expanded ? 'line-clamp-3' : ''
        }`}
      >
        {state.prompt.scenario}
      </p>
      {canToggle ? (
        <button className="link mt-1 text-xs font-medium" onClick={() => setExpanded((open) => !open)}>
          {expanded ? 'Show less' : 'More'}
        </button>
      ) : null}
      <div className="hairline mt-3" />
      <p className="mt-2.5 text-[0.7rem] leading-snug text-faint">
        Source: {state.prompt.source.publisher}, as of{' '}
        <span className="whitespace-nowrap">{state.prompt.source.asOf}</span>.{' '}
        <button className="link" onClick={() => navigateTo(state.prompt.source.url)}>
          {state.prompt.source.title}
        </button>
      </p>
    </article>
  );
};

const PlayControls = ({
  canLock,
  choice,
  prediction,
  busy,
  onChoice,
  onPrediction,
  onLock,
}: {
  canLock: boolean;
  choice: VoteChoice | null;
  prediction: number;
  busy: boolean;
  onChoice: (choice: VoteChoice) => void;
  onPrediction: (value: number) => void;
  onLock: () => void;
}) => (
  <section className="room-actions shrink-0 border-t border-line pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
    <p className="text-xs font-medium text-fg-2 sm:text-sm">{keepCutPrompt}</p>
    <div className="mt-2 grid grid-cols-2 gap-2">
      <ChoiceButton
        kind="keep"
        active={choice === 'keep'}
        dim={choice === 'cut'}
        onClick={() => onChoice('keep')}
      />
      <ChoiceButton
        kind="cut"
        active={choice === 'cut'}
        dim={choice === 'keep'}
        onClick={() => onChoice('cut')}
      />
    </div>
    <label className="mt-3 block">
      <span className="flex items-end justify-between gap-3">
        <span className="text-xs font-medium text-fg-2 sm:text-sm">{guessPrompt}</span>
        <span className="tabular shrink-0 font-serif text-[1.9rem] leading-none text-accent sm:text-4xl">
          {percentLabel(prediction)}
          <span className="ml-1 font-sans text-xs font-medium text-faint">Keep</span>
        </span>
      </span>
      <input
        className="guess mt-1.5"
        type="range"
        min={0}
        max={100}
        step={1}
        value={prediction}
        style={{ '--value': `${prediction}%` } as CSSProperties}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={prediction}
        aria-valuetext={`${prediction}% Keep`}
        aria-label={guessPrompt}
        onChange={(event) => onPrediction(Number(event.target.value))}
      />
      <span className="tabular flex justify-between text-[0.62rem] text-faint" aria-hidden="true">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </span>
    </label>
    <button
      className="btn-gold mt-2.5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
      disabled={!canLock || busy || !choice}
      onClick={onLock}
    >
      <LockIcon className="h-4 w-4" />
      {busy ? 'Locking…' : lockLabel}
    </button>
  </section>
);

const ChoiceButton = ({
  kind,
  active,
  dim,
  onClick,
}: {
  kind: VoteChoice;
  active: boolean;
  dim: boolean;
  onClick: () => void;
}) => (
  <button
    className="choice flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold tracking-wide sm:h-12"
    data-kind={kind}
    data-active={active ? 'true' : 'false'}
    data-dim={dim ? 'true' : 'false'}
    aria-pressed={active}
    onClick={onClick}
  >
    {kind === 'keep' ? (
      <KeepIcon className="choice-icon h-[18px] w-[18px]" />
    ) : (
      <CutIcon className="choice-icon h-[18px] w-[18px]" />
    )}
    {choiceLabel(kind)}
  </button>
);

const LockedCard = ({ choice, prediction }: { choice: VoteChoice; prediction: number }) => (
  <section className="room-card rise mt-3 rounded-3xl px-5 py-5">
    <div className="flex items-center gap-3">
      <span className="relative grid h-11 w-11 shrink-0 place-items-center text-accent">
        <svg viewBox="0 0 44 44" className="absolute inset-0 h-11 w-11 -rotate-90" aria-hidden="true">
          <circle cx="22" cy="22" r="20" fill="none" stroke="var(--line)" strokeWidth="2" />
          <circle
            className="seal-ring"
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <LockIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="eyebrow">Locked</p>
        <p className="mt-0.5 text-xs text-muted">Sealed until midnight ET</p>
      </div>
    </div>
    <p className="mt-4 font-serif text-[1.45rem] leading-snug text-fg sm:text-2xl">
      You said {choiceLabel(choice)}, and guessed {percentLabel(prediction)} Keep.
    </p>
    <div className="mt-4">
      <div className="relative h-1.5 rounded-full bg-[var(--track)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gold"
          style={{ width: `${prediction}%` }}
        />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--surface-flat)] bg-gold"
          style={{ left: `${prediction}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="tabular mt-1.5 flex justify-between text-[0.62rem] text-faint" aria-hidden="true">
        <span>0</span>
        <span>Your guess</span>
        <span>100</span>
      </div>
    </div>
    <p className="mt-4 text-sm leading-relaxed text-muted">{lockedWait}</p>
  </section>
);

/** Big real number, counting up from zero. */
const BigPercent = ({ value }: { value: number }) => {
  const shown = useCountUp(value);
  return (
    <span className="tabular font-serif text-[3.2rem] leading-none tracking-[-0.02em] text-fg sm:text-6xl">
      {shown}
      <span className="text-[0.55em] text-faint">%</span>
    </span>
  );
};

const ScoreCount = ({ value }: { value: number }) => {
  const shown = useCountUp(value, 1200, 700);
  return <>{shown}</>;
};

const YesterdayCard = ({ recap }: { recap: NonNullable<GameStateResponse['recap']> }) => {
  const view = buildRecapView(recap);
  return (
    <section
      className="room-card rise overflow-hidden rounded-3xl px-4 py-4 sm:px-5 sm:py-5"
      aria-label="Yesterday's room"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Yesterday&apos;s room</p>
        <p className="tabular text-[0.7rem] text-faint">{formatDayLabel(view.dayId)}</p>
      </div>
      <h2 className="font-serif mt-1.5 text-[1.2rem] leading-snug text-fg sm:text-[1.4rem]">
        {view.title}
      </h2>

      {view.kind === 'revealed' ? (
        <>
          <div className="mt-4 flex items-end gap-3">
            <BigPercent value={view.keepPercent} />
            <p className="pb-1.5 text-sm leading-snug text-muted">
              of {locksLabel(view.totalVotes)}
              <br />
              said Keep
            </p>
          </div>
          <div className="mt-4">
            <SplitBar
              keepPercent={view.keepPercent}
              marker={view.yourGuess}
              markerLabel={view.yourGuess !== null ? `You ${percentLabel(view.yourGuess)}` : undefined}
            />
            <div className="tabular mt-2 flex justify-between text-xs font-medium">
              <span className="text-keep">Keep {percentLabel(view.keepPercent)}</span>
              <span className="text-cut">Cut {percentLabel(view.cutPercent)}</span>
            </div>
          </div>
          {view.yourChoice && view.yourGuess !== null ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="Your call">{choiceLabel(view.yourChoice)}</Stat>
              <Stat label="Guess">
                {percentLabel(view.yourGuess)}
                {view.guessError !== null ? (
                  <span className="text-faint"> ±{view.guessError}</span>
                ) : null}
              </Stat>
              <Stat label="Score">
                {view.yourScore !== null ? <ScoreCount value={view.yourScore} /> : 'None'}
              </Stat>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">You didn&apos;t lock a call that day.</p>
          )}
          {view.closest ? (
            <p className="mt-3 text-xs text-muted">
              Closest guess: <span className="font-medium text-fg">u/{view.closest.username}</span>,
              off by {view.closest.error}.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-4 font-serif text-[1.6rem] leading-tight text-fg">
            {earlyReadLabel}, {locksLabel(view.totalVotes)}
          </p>
          <div className="mt-3 h-3 rounded-full border border-dashed border-line-strong" aria-hidden="true" />
          <p className="mt-3 text-sm leading-relaxed text-muted">{earlyReadBody}</p>
          {view.yourChoice && view.yourGuess !== null ? (
            <p className="mt-3 text-sm text-fg-2">
              You said {choiceLabel(view.yourChoice)} and guessed {percentLabel(view.yourGuess)} Keep.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
};

const RevealCard = ({
  snapshot,
  yourChoice,
  yourGuess,
  yourScore,
}: {
  snapshot: NonNullable<GameStateResponse['snapshot']>;
  yourChoice: VoteChoice | null;
  yourGuess: number | null;
  yourScore: number | null;
}) => {
  const keep = snapshot.keepPercent ?? 0;
  return (
    <section className="room-card rise mt-3 rounded-3xl px-5 py-5">
      <p className="eyebrow">The room</p>
      <div className="mt-3 flex items-end gap-3">
        <BigPercent value={keep} />
        <p className="pb-1.5 text-sm text-muted">said Keep</p>
      </div>
      <div className="mt-4">
        <SplitBar
          keepPercent={keep}
          marker={yourGuess}
          markerLabel={yourGuess !== null ? `You ${percentLabel(yourGuess)}` : undefined}
        />
      </div>
      <p className="mt-3 text-sm text-muted">
        {locksLabel(snapshot.totalVotes)}. {percentLabel(100 - keep)} said Cut.
      </p>
      {yourGuess !== null ? (
        <p className="mt-4 text-sm text-fg">
          You picked {yourChoice === 'keep' ? 'Keep' : 'Cut'} and guessed{' '}
          {percentLabel(yourGuess)}.
          {yourScore !== null ? ` That's a ${yourScore}.` : ''}
        </p>
      ) : null}
      {snapshot.closestGuesser ? (
        <p className="mt-3 text-sm text-muted">
          Closest guess: u/{snapshot.closestGuesser.username}, off by{' '}
          {snapshot.closestGuesser.error}.
        </p>
      ) : null}
    </section>
  );
};

const EarlyReadCard = ({ count }: { count: number }) => (
  <section className="room-card rise mt-3 rounded-3xl px-5 py-5">
    <p className="eyebrow">{earlyReadLabel}</p>
    <p className="mt-2 font-serif text-2xl text-fg">{locksLabel(count)}</p>
    <p className="mt-3 text-sm leading-relaxed text-muted">{earlyReadBody}</p>
  </section>
);

const RecapStrip = ({
  recap,
  mostDivided,
  onOpen,
}: {
  recap: NonNullable<GameStateResponse['recap']>;
  mostDivided: GameStateResponse['mostDivided'];
  onOpen: () => void;
}) => (
  <section className="mb-2.5 rounded-2xl border border-line bg-[var(--highlight)] px-3 py-2 text-xs leading-snug text-muted sm:px-4 sm:py-2.5 sm:text-sm">
    <div className="flex items-start gap-3">
      <p className="min-w-0 flex-1">
        <span className="font-semibold uppercase tracking-[0.16em] text-accent">Yesterday</span>
        {' · '}
        <span className="text-fg">{recap.prompt.title}</span>
        {recap.snapshot.status === 'early_read'
          ? `. ${earlyReadLabel}, ${locksLabel(recap.snapshot.totalVotes)}.`
          : `. ${percentLabel(recap.snapshot.keepPercent ?? 0)} of ${locksLabel(recap.snapshot.totalVotes)} said Keep.${
              recap.yourScore !== null ? ` You scored ${recap.yourScore}.` : ''
            }`}
        {mostDivided && mostDivided.dayId !== recap.dayId
          ? ` Most divided: ${mostDivided.promptTitle} at ${percentLabel(mostDivided.keepPercent)} Keep.`
          : ''}
      </p>
      <button className="link shrink-0 text-xs font-medium" onClick={onOpen}>
        Replay
      </button>
    </div>
    {recap.snapshot.status === 'revealed' && recap.snapshot.keepPercent !== null ? (
      <div className="mt-2">
        <SplitBar keepPercent={recap.snapshot.keepPercent} height="sm" />
      </div>
    ) : null}
  </section>
);

const ArchiveScreen = ({
  state,
  onBack,
  onPlay,
}: {
  state: GameStateResponse;
  onBack: () => void;
  onPlay: (day: ArchiveDaySummary) => void;
}) => {
  const queue = useMemo(() => quickPlayQueue(state.archive, 5), [state.archive]);
  return (
    <section className="min-h-0 flex-1 overflow-y-auto pb-4">
      <div className="flex items-center justify-between gap-2">
        <button className="link text-xs font-medium" onClick={onBack}>
          ← Back to today
        </button>
        <ThemeToggle />
      </div>
      <h1 className="font-serif mt-2 text-3xl tracking-[-0.01em] text-fg">Archive</h1>
      <p className="mt-1.5 text-sm text-muted">
        Play closed days against their frozen real split. This never changes the official room.
      </p>
      {state.fixture ? <p className="mt-2 text-xs text-accent">{FIXTURE_BANNER}</p> : null}
      {queue.length > 0 ? (
        <button
          className="btn-gold mt-4 rounded-full px-4 py-2 text-sm font-semibold"
          onClick={() => {
            const first = queue[0];
            if (first) {
              onPlay(first);
            }
          }}
        >
          Quick play, {queue.length} day{queue.length === 1 ? '' : 's'}
        </button>
      ) : null}
      {state.archive.length === 0 ? (
        <p className="room-card mt-5 rounded-3xl px-5 py-6 text-sm leading-relaxed text-muted">
          {emptyArchive}
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {state.archive.map((day, index) => (
            <li
              key={day.dayId}
              className="room-card rise rounded-2xl px-4 py-3.5"
              style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="tabular text-[0.7rem] text-faint">{formatDayLabel(day.dayId)}</p>
                {day.status === 'early_read' ? (
                  <span className="rounded-full border border-line px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-muted">
                    {earlyReadLabel}
                  </span>
                ) : day.played ? (
                  <span className="tabular rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-2 py-0.5 text-[0.66rem] font-semibold text-accent">
                    Scored {day.yourScore}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 font-serif text-lg leading-snug text-fg">{day.prompt.title}</p>
              {day.status === 'early_read' ? (
                <>
                  <div className="mt-2.5 h-1.5 rounded-full border border-dashed border-line-strong" aria-hidden="true" />
                  <p className="mt-2 text-xs text-muted">
                    {earlyReadLabel}. {locksLabel(day.totalVotes)}. No official split.
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-2.5">
                    <SplitBar keepPercent={day.keepPercent ?? 0} height="sm" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="tabular text-xs text-muted">
                      {percentLabel(day.keepPercent ?? 0)} Keep, {locksLabel(day.totalVotes)}.
                    </p>
                    {!day.played ? (
                      <button
                        className="btn-ghost shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                        onClick={() => onPlay(day)}
                      >
                        Play this day
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const ArchivePlayScreen = ({
  day,
  choice,
  prediction,
  busy,
  error,
  onChoice,
  onPrediction,
  onBack,
  onSubmit,
}: {
  day: ArchiveDaySummary;
  choice: VoteChoice | null;
  prediction: number;
  busy: boolean;
  error: string | null;
  onChoice: (choice: VoteChoice) => void;
  onPrediction: (value: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <section className="min-h-0 flex-1 overflow-y-auto pb-3">
      <div className="flex items-center justify-between gap-2">
        <button className="link text-xs font-medium" onClick={onBack}>
          ← Back to archive
        </button>
        <ThemeToggle />
      </div>
      <article className="room-card rise mt-3 rounded-2xl px-4 py-4 sm:rounded-3xl sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow">{CATEGORY_LABEL[day.prompt.category] ?? day.prompt.category}</p>
          <p className="tabular text-[0.7rem] text-faint">{formatDayLabel(day.dayId)}</p>
        </div>
        <h1 className="font-serif mt-1.5 text-[1.45rem] leading-[1.18] text-fg sm:text-3xl">
          {day.prompt.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">{day.prompt.scenario}</p>
      </article>
      {error ? <p className="mt-3 text-sm text-cut">{error}</p> : null}
    </section>
    <PlayControls
      canLock={!busy}
      choice={choice}
      prediction={prediction}
      busy={busy}
      onChoice={onChoice}
      onPrediction={onPrediction}
      onLock={onSubmit}
    />
  </div>
);
