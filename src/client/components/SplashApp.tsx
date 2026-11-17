import { requestExpandedMode } from '@devvit/web/client';
import { formatDayLabel } from '../../shared/calendar';
import { FIXTURE_BANNER, LOCAL_PREVIEW_BANNER } from '../../shared/constants';
import { CATEGORY_LABEL, keepCutPrompt } from '../copy';
import { useCountdown } from '../hooks/useCountdown';
import { useGame } from '../hooks/useGame';
import { RoomArt, ThemeToggle, Wordmark } from './ui';

export const SplashApp = () => {
  const { state, loading, error } = useGame();
  const remaining = useCountdown(state?.status === 'open' ? state.closesAt : null);

  if (loading && !state) {
    return (
      <div className="room-shell flex h-full flex-col items-center justify-center gap-4 px-6">
        <RoomArt className="h-16 w-56 opacity-80" />
        <p className="text-sm text-muted">Lighting the room…</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="room-shell flex h-full items-center justify-center px-6">
        <p className="text-center text-cut">{error ?? 'Could not load today.'}</p>
      </div>
    );
  }

  const banner = state.fixture ? FIXTURE_BANNER : state.localPreview ? LOCAL_PREVIEW_BANNER : null;

  return (
    <div className="room-shell flex h-full items-center justify-center px-3 py-3 sm:px-4">
      <div className="room-card flex max-h-full w-full max-w-[34rem] flex-col overflow-hidden rounded-[1.6rem]">
        <div className="hero-art relative -mb-2 shrink-0 px-4 pt-0">
          <RoomArt className="mx-auto block h-[80px] w-full max-w-[22rem]" />
        </div>
        <div className="relative flex min-h-0 flex-col gap-4 px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Wordmark size="md" />
              <p className="tabular mt-1 text-xs text-muted">
                {formatDayLabel(state.dayId)}
                {remaining ? <span className="text-faint"> · {remaining}</span> : null}
              </p>
            </div>
            <ThemeToggle />
          </div>
          {banner ? (
            <p className="-mt-1 text-[0.66rem] leading-snug tracking-wide text-accent">{banner}</p>
          ) : null}
          <div className="min-h-0">
            <p className="eyebrow !text-faint">
              {CATEGORY_LABEL[state.prompt.category] ?? state.prompt.category}
            </p>
            <h1 className="font-serif mt-1.5 text-[1.5rem] leading-[1.15] tracking-[-0.01em] text-fg sm:text-[1.75rem]">
              {state.prompt.title}
            </h1>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-2 min-[400px]:line-clamp-3">
              {state.prompt.scenario}
            </p>
          </div>
          <div>
            <div className="hairline mb-3" />
            <p className="mb-2.5 text-sm text-muted">{keepCutPrompt}</p>
            <button
              className="btn-gold w-full rounded-full px-5 py-3 text-sm font-semibold"
              onClick={(event) => requestExpandedMode(event.nativeEvent, 'game')}
            >
              {state.player.lock
                ? state.status === 'open'
                  ? 'See your locked call'
                  : 'See the reveal'
                : "Play today's call"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
