import type { ReactNode } from 'react';
import { useArrived } from '../hooks/useCountUp';
import { useTheme } from '../theme';

type IconProps = { className?: string };

const iconBase = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const KeepIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...iconBase}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.3 12.3 2.5 2.5 5-5.3" />
  </svg>
);

export const CutIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...iconBase}>
    <circle cx="6.5" cy="7" r="2.6" />
    <circle cx="6.5" cy="17" r="2.6" />
    <path d="M8.7 8.4 19 16.5M8.7 15.6 19 7.5" />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...iconBase}>
    <rect x="5.5" y="10.5" width="13" height="9" rx="2.2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);

export const ArchiveIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...iconBase}>
    <rect x="3.5" y="4.5" width="17" height="4.5" rx="1.2" />
    <path d="M5.5 9v8.8A1.7 1.7 0 0 0 7.2 19.5h9.6a1.7 1.7 0 0 0 1.7-1.7V9M10 13h4" />
  </svg>
);

export const FlameIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...iconBase}>
    <path d="M12 21c3.6 0 6-2.5 6-5.8 0-3.6-2.6-5.4-3.6-8.7-.3 1.9-1.3 3-2.4 3.6.3-2.9-1-5.7-3.5-7.1.3 3.3-2.5 5.3-2.5 9.7C6 18.2 8.4 21 12 21Z" />
  </svg>
);

const SunIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...iconBase}>
    <circle cx="12" cy="12" r="3.8" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </svg>
);

const MoonIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...iconBase}>
    <path d="M19.5 14.6A7.6 7.6 0 0 1 9.4 4.5a7.6 7.6 0 1 0 10.1 10.1Z" />
  </svg>
);

/** Follows the Reddit or device theme. Tapping overrides it for this browser. */
export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="btn-ghost grid h-8 w-8 shrink-0 place-items-center rounded-full"
    >
      {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </button>
  );
};

/** Small ring mark: a split circle, the game in one glyph. */
export const RingMark = ({ className }: IconProps) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
    <circle cx="10" cy="10" r="7.2" fill="none" stroke="var(--line-strong)" strokeWidth="2.2" />
    <path
      d="M10 2.8a7.2 7.2 0 0 1 0 14.4"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export const Wordmark = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => (
  <span className="inline-flex items-center gap-1.5">
    <RingMark className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
    <span className="eyebrow">Read the Room</span>
  </span>
);

type Seat = { x: number; y: number; r: number; o: number; delay: number; lit: boolean };

const SEATS: Seat[] = (() => {
  const seats: Seat[] = [];
  const cx = 180;
  const cy = 10;
  const rows = [26, 41, 56, 71, 86];
  rows.forEach((radius, row) => {
    const count = Math.round(radius / 5.6);
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = ((22 + t * 136) * Math.PI) / 180;
      const x = cx + Math.cos(angle) * radius * 1.7;
      const y = cy + Math.sin(angle) * radius;
      const fromCenter = Math.abs(t - 0.5) * 2;
      seats.push({
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        r: 2.1 + row * 0.42,
        o: Math.max(0.16, 0.78 - row * 0.12 - fromCenter * 0.22),
        delay: row * 90 + Math.round(fromCenter * 160),
        lit: row === 0 && fromCenter < 0.5,
      });
    }
  });
  return seats;
})();

/** Original art: a lit stage and the room in rows, facing it. Decorative only. */
export const RoomArt = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 360 112"
    className={className}
    preserveAspectRatio="xMidYMin meet"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="rtr-stage" cx="50%" cy="0%" r="60%">
        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
        <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="rtr-seam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.7" />
        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <ellipse className="stage-pulse" cx="180" cy="6" rx="150" ry="100" fill="url(#rtr-stage)" />
    <path d="M180 22 V104" stroke="url(#rtr-seam)" strokeWidth="1" />
    <path
      d="M166 10 a14 14 0 0 0 28 0"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M150 10 H210" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
    <circle cx="180" cy="10" r="3" fill="var(--accent)" />
    {SEATS.map((seat, index) => (
      <circle
        key={index}
        className="seat"
        cx={seat.x}
        cy={seat.y}
        r={seat.r}
        fill={seat.lit ? 'var(--accent)' : 'var(--seat)'}
        opacity={seat.lit ? 0.9 : seat.o}
        style={{ animationDelay: `${seat.delay}ms` }}
      />
    ))}
  </svg>
);

/**
 * Keep fills from the left and Cut from the right, both from zero to the real share.
 * The optional marker shows where a guess landed.
 */
export const SplitBar = ({
  keepPercent,
  marker,
  markerLabel,
  height = 'md',
}: {
  keepPercent: number;
  marker?: number | null | undefined;
  markerLabel?: string | undefined;
  height?: 'sm' | 'md';
}) => {
  const arrived = useArrived();
  const keep = Math.max(0, Math.min(100, keepPercent));
  const cut = 100 - keep;
  const bar = height === 'sm' ? 'h-1.5' : 'h-3';
  const hasMarker = marker !== null && marker !== undefined;
  const markerAlign =
    hasMarker && marker < 12 ? 'translate-x-0' : hasMarker && marker > 88 ? '-translate-x-full' : '-translate-x-1/2';
  return (
    <div className={hasMarker && markerLabel ? 'relative pt-5' : 'relative'}>
      {hasMarker ? (
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-10"
          style={{ left: `${marker}%` }}
        >
          {markerLabel ? (
            <span
              className={`tabular absolute top-0 whitespace-nowrap text-[0.66rem] font-medium text-fg ${markerAlign}`}
            >
              {markerLabel}
            </span>
          ) : null}
          <span className="absolute bottom-[-3px] h-[calc(100%-1rem)] min-h-4 w-0.5 -translate-x-1/2 rounded-full bg-fg shadow-[0_0_0_2px_var(--surface-flat)]" />
        </div>
      ) : null}
      <div className={`flex ${bar} w-full gap-[3px] overflow-hidden rounded-full`}>
        {keep > 0 ? (
          <div className="h-full overflow-hidden rounded-full" style={{ width: `${keep}%` }}>
            <div
              className="split-fill h-full w-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, color-mix(in srgb, var(--keep) 75%, transparent), var(--keep))',
                transform: `scaleX(${arrived ? 1 : 0})`,
              }}
            />
          </div>
        ) : null}
        {cut > 0 ? (
          <div className="h-full overflow-hidden rounded-full" style={{ width: `${cut}%` }}>
            <div
              className="split-cut h-full w-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--cut), color-mix(in srgb, var(--cut) 75%, transparent))',
                transform: `scaleX(${arrived ? 1 : 0})`,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const Stat = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0 rounded-xl border border-line bg-[var(--highlight)] px-2.5 py-2">
    <p className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-faint">{label}</p>
    <p className="tabular mt-0.5 truncate text-sm font-medium text-fg">{children}</p>
  </div>
);
