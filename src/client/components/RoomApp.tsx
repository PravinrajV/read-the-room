import { useMemo, useState, type ReactNode } from 'react';
import { navigateTo } from '@devvit/web/client';
import type { GameStateResponse } from '../../shared/api';
import { formatDayLabel } from '../../shared/calendar';
import { LOCAL_PREVIEW_BANNER, FIXTURE_BANNER } from '../../shared/constants';
import { quickPlayQueue } from '../../shared/archive';
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
import { useGame } from '../hooks/useGame';

type Screen = 'today' | 'archive' | 'archive-play';

const percentLabel = (value: number) => `${value}%`;

export const RoomApp = () => {
  const { state, loading, error, lock, playArchive } = useGame();
  const [screen, setScreen] = useState<Screen>('today');
  const [choice, setChoice] = useState<VoteChoice | null>(null);
  const [prediction, setPrediction] = useState(50);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [archiveDay, setArchiveDay] = useState<ArchiveDaySummary | null>(null);

  if (loading && !state) {
    return (
      <Shell>
        <p className="text-center text-[#c9bfae]">Lighting the room…</p>
      </Shell>
    );
  }

  if (!state) {
    return (
      <Shell>
        <p className="text-center text-[#d37a66]">{error ?? 'Could not load today.'}</p>
      </Shell>
    );
  }

  return (
    <Shell
      banner={
        state.fixture ? FIXTURE_BANNER : state.localPreview ? LOCAL_PREVIEW_BANNER : null
      }
    >
      {screen === 'today' ? (
        <TodayScreen
          state={state}
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
  <div className="room-shell flex h-full min-h-0 flex-col px-3 py-2 sm:px-6 sm:py-3">
    {banner ? (
      <div className="mb-2 shrink-0 rounded-full border border-[#e4b65c]/40 bg-[#e4b65c]/10 px-3 py-1.5 text-center text-[0.7rem] tracking-wide text-[#e4b65c]">
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

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 overflow-y-auto">
      <Header
        dayId={state.dayId}
        remaining={remaining}
        streak={state.player.streak.count}
        onOpenArchive={onOpenArchive}
        archiveCount={state.archive.length}
      />
      {state.recap ? <RecapStrip recap={state.recap} mostDivided={state.mostDivided} /> : null}
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
      {error ? <p className="mt-3 text-sm text-[#d37a66]">{error}</p> : null}
      {!state.player.userId ? (
        <p className="mt-3 text-sm text-[#c9bfae]">{loginCta}</p>
      ) : null}
      {state.commentUrl && (state.player.lock || state.status !== 'open') ? (
        <button
          className="mt-4 text-left text-sm text-[#e4b65c] underline-offset-4 hover:underline"
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
    </>
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
  <header className="mb-2 flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[#e4b65c]">
        Read the Room
      </p>
      <p className="mt-0.5 text-xs text-[#c9bfae]">{formatDayLabel(dayId)}</p>
    </div>
    <div className="flex shrink-0 flex-col items-end gap-0.5">
      <div className="flex items-center gap-2">
        <div className="rounded-full border border-[rgba(243,234,216,0.14)] px-2.5 py-0.5 text-[0.7rem] text-[#f3ead8]">
          {streak > 0 ? `Streak ${streak}` : 'No streak yet'}
        </div>
        <button
          className="text-[0.7rem] text-[#e4b65c] underline-offset-4 hover:underline"
          onClick={onOpenArchive}
        >
          Archive{archiveCount ? ` (${archiveCount})` : ''}
        </button>
      </div>
      {remaining ? <p className="whitespace-nowrap text-[0.7rem] text-[#c9bfae]">{remaining}</p> : null}
    </div>
  </header>
);

const PromptCard = ({ state }: { state: GameStateResponse }) => {
  const [expanded, setExpanded] = useState(false);
  const canToggle = state.prompt.scenario.length > 160;

  return (
    <article className="room-card rounded-2xl px-4 py-3 sm:rounded-3xl sm:px-5 sm:py-5">
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#e4b65c]">
        {CATEGORY_LABEL[state.prompt.category] ?? state.prompt.category}
      </p>
      <h1 className="font-serif mt-1 text-[1.3rem] leading-tight text-[#f3ead8] sm:text-[1.55rem]">
        {state.prompt.title}
      </h1>
      <p
        className={`mt-2 text-sm leading-snug text-[#ddd3c2] sm:leading-relaxed ${
          canToggle && !expanded ? 'line-clamp-3' : ''
        }`}
      >
        {state.prompt.scenario}
      </p>
      {canToggle ? (
        <button
          className="mt-1 text-xs text-[#e4b65c] underline-offset-4 hover:underline"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Show less' : 'More'}
        </button>
      ) : null}
      <p className="mt-2 text-[0.7rem] leading-snug text-[#9b9084]">
        Source: {state.prompt.source.publisher}, as of{' '}
        <span className="whitespace-nowrap">{state.prompt.source.asOf}</span>.{' '}
        <button
          className="text-[#e4b65c] underline-offset-4 hover:underline"
          onClick={() => navigateTo(state.prompt.source.url)}
        >
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
  <section className="room-actions shrink-0 border-t border-[rgba(243,234,216,0.1)] bg-[#0c0b0a] pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
    <p className="text-xs text-[#c9bfae] sm:text-sm">{keepCutPrompt}</p>
    <div className="mt-2 grid grid-cols-2 gap-2">
      <ChoiceButton kind="keep" active={choice === 'keep'} onClick={() => onChoice('keep')} />
      <ChoiceButton kind="cut" active={choice === 'cut'} onClick={() => onChoice('cut')} />
    </div>
    <label className="mt-3 block">
      <span className="text-xs text-[#c9bfae] sm:text-sm">{guessPrompt}</span>
      <div className="mt-1 flex items-end justify-between">
        <span className="font-serif text-3xl leading-none text-[#e4b65c] sm:text-4xl">
          {percentLabel(prediction)}
        </span>
        <span className="text-xs text-[#9b9084]">Keep</span>
      </div>
      <input
        className="mt-2"
        type="range"
        min={0}
        max={100}
        step={1}
        value={prediction}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={prediction}
        aria-label={guessPrompt}
        onChange={(event) => onPrediction(Number(event.target.value))}
      />
    </label>
    <button
      className="mt-3 w-full rounded-full bg-[#e4b65c] px-5 py-2.5 text-sm font-medium text-[#0c0b0a] transition enabled:hover:bg-[#f0c56f] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={!canLock || busy || !choice}
      onClick={onLock}
    >
      {busy ? 'Locking…' : lockLabel}
    </button>
  </section>
);

const ChoiceButton = ({
  kind,
  active,
  onClick,
}: {
  kind: VoteChoice;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    className={`h-10 rounded-2xl border text-sm font-medium tracking-wide transition sm:h-12 ${
      kind === 'keep' ? 'keep-btn' : 'cut-btn'
    } ${
      active
        ? 'border-transparent'
        : 'border-[rgba(243,234,216,0.14)] bg-transparent text-[#f3ead8] hover:border-[rgba(243,234,216,0.35)]'
    }`}
    data-active={active ? 'true' : 'false'}
    aria-pressed={active}
    onClick={onClick}
  >
    {kind === 'keep' ? 'Keep' : 'Cut'}
  </button>
);

const LockedCard = ({
  choice,
  prediction,
}: {
  choice: VoteChoice;
  prediction: number;
}) => (
  <section className="room-card mt-6 rounded-3xl px-5 py-5">
    <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#e4b65c]">
      Locked
    </p>
    <p className="mt-2 font-serif text-2xl text-[#f3ead8]">
      You said {choice === 'keep' ? 'Keep' : 'Cut'}, and guessed {percentLabel(prediction)} Keep.
    </p>
    <p className="mt-3 text-sm leading-relaxed text-[#c9bfae]">{lockedWait}</p>
  </section>
);

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
    <section className="room-card mt-6 rounded-3xl px-5 py-5">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#e4b65c]">
        The room
      </p>
      <p className="mt-2 font-serif text-3xl text-[#f3ead8]">{percentLabel(keep)} said Keep</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(243,234,216,0.12)]">
        <div
          className="h-full rounded-full bg-[#8fb57a] transition-[width] duration-700"
          style={{ width: `${keep}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-[#c9bfae]">
        {locksLabel(snapshot.totalVotes)}. {percentLabel(100 - keep)} said Cut.
      </p>
      {yourGuess !== null ? (
        <p className="mt-4 text-sm text-[#f3ead8]">
          You picked {yourChoice === 'keep' ? 'Keep' : 'Cut'} and guessed{' '}
          {percentLabel(yourGuess)}.
          {yourScore !== null ? ` That's a ${yourScore}.` : ''}
        </p>
      ) : null}
      {snapshot.closestGuesser ? (
        <p className="mt-3 text-sm text-[#c9bfae]">
          Closest guess: u/{snapshot.closestGuesser.username}, off by{' '}
          {snapshot.closestGuesser.error}.
        </p>
      ) : null}
    </section>
  );
};

const EarlyReadCard = ({ count }: { count: number }) => (
  <section className="room-card mt-6 rounded-3xl px-5 py-5">
    <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#e4b65c]">
      {earlyReadLabel}
    </p>
    <p className="mt-2 font-serif text-2xl text-[#f3ead8]">{locksLabel(count)}</p>
    <p className="mt-3 text-sm leading-relaxed text-[#c9bfae]">{earlyReadBody}</p>
  </section>
);

const RecapStrip = ({
  recap,
  mostDivided,
}: {
  recap: NonNullable<GameStateResponse['recap']>;
  mostDivided: GameStateResponse['mostDivided'];
}) => (
  <section className="mb-2 rounded-xl border border-[rgba(243,234,216,0.1)] px-3 py-1.5 text-xs leading-snug text-[#c9bfae] sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm">
    <p>
      <span className="font-medium uppercase tracking-[0.16em] text-[#e4b65c]">Yesterday</span>
      {' · '}
      <span className="text-[#f3ead8]">{recap.prompt.title}</span>
      {recap.snapshot.status === 'early_read'
        ? `. ${earlyReadLabel}, ${locksLabel(recap.snapshot.totalVotes)}.`
        : `. ${percentLabel(recap.snapshot.keepPercent ?? 0)} of ${locksLabel(recap.snapshot.totalVotes)} said Keep.${
            recap.yourScore !== null ? ` You scored ${recap.yourScore}.` : ''
          }`}
      {mostDivided && mostDivided.dayId !== recap.dayId
        ? ` Most divided: ${mostDivided.promptTitle} at ${percentLabel(mostDivided.keepPercent)} Keep.`
        : ''}
    </p>
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
    <section className="min-h-0 flex-1 overflow-y-auto">
      <button className="text-xs text-[#e4b65c] underline-offset-4 hover:underline" onClick={onBack}>
        Back to today
      </button>
      <h1 className="font-serif mt-3 text-3xl text-[#f3ead8]">Archive</h1>
      <p className="mt-2 text-sm text-[#c9bfae]">
        Play closed days against their frozen real split. This never changes the official room.
      </p>
      {state.fixture ? (
        <p className="mt-3 text-xs text-[#e4b65c]">{FIXTURE_BANNER}</p>
      ) : null}
      {queue.length > 0 ? (
        <button
          className="mt-4 rounded-full bg-[#e4b65c] px-4 py-2 text-sm font-medium text-[#0c0b0a]"
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
        <p className="room-card mt-6 rounded-3xl px-5 py-6 text-sm leading-relaxed text-[#c9bfae]">
          {emptyArchive}
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {state.archive.map((day) => (
            <li key={day.dayId} className="room-card rounded-2xl px-4 py-4">
              <p className="text-xs text-[#9b9084]">{formatDayLabel(day.dayId)}</p>
              <p className="mt-1 font-serif text-xl text-[#f3ead8]">{day.prompt.title}</p>
              {day.status === 'early_read' ? (
                <p className="mt-2 text-sm text-[#c9bfae]">
                  {earlyReadLabel}. {locksLabel(day.totalVotes)}. No official split.
                </p>
              ) : (
                <p className="mt-2 text-sm text-[#c9bfae]">
                  {percentLabel(day.keepPercent ?? 0)} Keep, {locksLabel(day.totalVotes)}.
                  {day.played ? ` Your score: ${day.yourScore}.` : ''}
                </p>
              )}
              {day.status === 'revealed' && !day.played ? (
                <button
                  className="mt-3 text-sm text-[#e4b65c] underline-offset-4 hover:underline"
                  onClick={() => onPlay(day)}
                >
                  Play this day
                </button>
              ) : null}
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
  <section className="min-h-0 flex-1 overflow-y-auto">
    <button className="text-xs text-[#e4b65c] underline-offset-4 hover:underline" onClick={onBack}>
      Back to archive
    </button>
    <p className="mt-3 text-xs text-[#9b9084]">{formatDayLabel(day.dayId)}</p>
    <h1 className="font-serif mt-1 text-3xl text-[#f3ead8]">{day.prompt.title}</h1>
    <p className="mt-3 text-sm leading-relaxed text-[#ddd3c2]">{day.prompt.scenario}</p>
    <PlayControls
      canLock={!busy}
      choice={choice}
      prediction={prediction}
      busy={busy}
      onChoice={onChoice}
      onPrediction={onPrediction}
      onLock={onSubmit}
    />
    {error ? <p className="mt-3 text-sm text-[#d37a66]">{error}</p> : null}
  </section>
);
