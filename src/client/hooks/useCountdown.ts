import { useEffect, useState } from 'react';

export function useCountdown(isoDate: string | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isoDate) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isoDate]);

  if (!isoDate) {
    return '';
  }
  const remaining = Date.parse(isoDate) - now;
  if (remaining <= 0) {
    return 'Revealing';
  }
  const totalMinutes = Math.floor(remaining / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}m ${seconds}s left`;
}
