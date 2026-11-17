import { requestExpandedMode } from '@devvit/web/client';
import { formatDayLabel } from '../../shared/calendar';
import { FIXTURE_BANNER, LOCAL_PREVIEW_BANNER } from '../../shared/constants';
import { CATEGORY_LABEL, keepCutPrompt } from '../copy';
import { useCountdown } from '../hooks/useCountdown';
import { useGame } from '../hooks/useGame';

export const SplashApp = () => {
  const { state, loading, error } = useGame();
  const remaining = useCountdown(state?.status === 'open' ? state.closesAt : null);

  if (loading && !state) {
    return (
      <div className="room-shell flex h-full items-center justify-center px-6">
        <p className="text-[#c9bfae]">Lighting the room…</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="room-shell flex h-full items-center justify-center px-6">
        <p className="text-center text-[#d37a66]">{error ?? 'Could not load today.'}</p>
      </div>
    );
  }

  const banner = state.fixture ? FIXTURE_BANNER : state.localPreview ? LOCAL_PREVIEW_BANNER : null;

  return (
    <div className="room-shell flex h-full items-center justify-center px-4 py-4">
      <div className="room-card flex w-full max-w-[34rem] flex-col gap-5 rounded-3xl px-5 py-5">
        <div>
          {banner ? (
            <p className="mb-3 text-center text-[0.7rem] tracking-wide text-[#e4b65c]">{banner}</p>
          ) : null}
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#e4b65c]">
            Read the Room
          </p>
          <p className="mt-1 text-xs text-[#c9bfae]">
            {formatDayLabel(state.dayId)}
            {remaining ? ` · ${remaining}` : ''}
          </p>
          <p className="mt-4 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#9b9084]">
            {CATEGORY_LABEL[state.prompt.category] ?? state.prompt.category}
          </p>
          <h1 className="font-serif mt-1 text-[1.55rem] leading-tight text-[#f3ead8]">
            {state.prompt.title}
          </h1>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#ddd3c2]">
            {state.prompt.scenario}
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm text-[#c9bfae]">{keepCutPrompt}</p>
          <button
            className="w-full rounded-full bg-[#e4b65c] px-5 py-3 text-sm font-medium text-[#0c0b0a] hover:bg-[#f0c56f]"
            onClick={(event) => requestExpandedMode(event.nativeEvent, 'game')}
          >
            {state.player.lock
              ? state.status === 'open'
                ? "See your locked call"
                : 'See the reveal'
              : "Play today's call"}
          </button>
        </div>
      </div>
    </div>
  );
};
