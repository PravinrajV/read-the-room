import { useEffect, useState } from 'react';

const prefersReducedMotion = () => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
};

/** Eases a number from 0 up to the real target. Jumps straight there with reduced motion. */
export function useCountUp(target: number, duration = 1100, delay = 250): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    let frame = 0;
    if (prefersReducedMotion()) {
      frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) {
        start = now;
      }
      const elapsed = now - start - delay;
      const t = Math.min(1, Math.max(0, elapsed / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay]);

  return value;
}

/** False on the first frame, then true, so CSS transitions can run from zero. */
export function useArrived(): boolean {
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setArrived(true)));
    return () => cancelAnimationFrame(frame);
  }, []);
  return arrived;
}
