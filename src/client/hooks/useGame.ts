import { useCallback, useEffect, useState } from 'react';
import type { GameStateResponse } from '../../shared/api';
import type { VoteChoice } from '../../shared/types';

type GameHook = {
  state: GameStateResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lock: (choice: VoteChoice, prediction: number) => Promise<void>;
  playArchive: (
    dayId: string,
    choice: VoteChoice,
    prediction: number
  ) => Promise<void>;
};

function previewHeaders(): HeadersInit {
  const params = new URLSearchParams(window.location.search);
  const headers: Record<string, string> = {};
  const user = params.get('as');
  if (user) {
    headers['x-preview-user'] = user;
  }
  return headers;
}

function apiUrl(path: string): string {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) {
    return path;
  }
  return `${path}?${params.toString()}`;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export function useGame(): GameHook {
  const [state, setState] = useState<GameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(apiUrl('/api/state'), { headers: previewHeaders() });
    if (!response.ok) {
      throw new Error(await readError(response));
    }
    const data = (await response.json()) as GameStateResponse;
    setState(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await refresh();
        if (!cancelled) {
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load today');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const lock = useCallback(
    async (choice: VoteChoice, prediction: number) => {
      setError(null);
      const response = await fetch(apiUrl('/api/lock'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...previewHeaders() },
        body: JSON.stringify({ choice, prediction }),
      });
      if (!response.ok) {
        throw new Error(await readError(response));
      }
      const data = (await response.json()) as { state: GameStateResponse };
      setState(data.state);
    },
    []
  );

  const playArchive = useCallback(
    async (dayId: string, choice: VoteChoice, prediction: number) => {
      setError(null);
      const response = await fetch(apiUrl('/api/archive-play'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...previewHeaders() },
        body: JSON.stringify({ dayId, choice, prediction }),
      });
      if (!response.ok) {
        throw new Error(await readError(response));
      }
      const data = (await response.json()) as { state: GameStateResponse };
      setState(data.state);
    },
    []
  );

  return { state, loading, error, refresh, lock, playArchive };
}
