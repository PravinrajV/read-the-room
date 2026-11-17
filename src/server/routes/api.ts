import { Hono } from 'hono';
import type { ArchivePlayRequest, ErrorResponse, LockRequest } from '../../shared/api';
import { actorFromContext } from '../context-actor';
import { createRedditGameService } from '../service';

export const api = new Hono();

api.get('/state', async (c) => {
  try {
    const service = createRedditGameService();
    const actor = actorFromContext();
    const state = await service.getState(new Date(), actor);
    return c.json(state);
  } catch (err) {
    console.error('GET /api/state failed', err);
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: err instanceof Error ? err.message : 'Could not load today',
      },
      400
    );
  }
});

api.post('/lock', async (c) => {
  try {
    const body = await c.req.json<LockRequest>();
    const service = createRedditGameService();
    const actor = actorFromContext();
    const state = await service.lockToday(new Date(), actor, body.choice, body.prediction);
    return c.json({ type: 'lock' as const, state });
  } catch (err) {
    console.error('POST /api/lock failed', err);
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: err instanceof Error ? err.message : 'Could not lock your call',
      },
      400
    );
  }
});

api.post('/archive-play', async (c) => {
  try {
    const body = await c.req.json<ArchivePlayRequest>();
    const service = createRedditGameService();
    const actor = actorFromContext();
    const result = await service.playArchive(
      new Date(),
      actor,
      body.dayId,
      body.choice,
      body.prediction
    );
    return c.json({ type: 'archive-play' as const, play: result.play, state: result.state });
  } catch (err) {
    console.error('POST /api/archive-play failed', err);
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: err instanceof Error ? err.message : 'Could not play that day',
      },
      400
    );
  }
});
