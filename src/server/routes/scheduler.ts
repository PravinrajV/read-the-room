import { Hono } from 'hono';
import { createRedditGameService } from '../service';

export const scheduler = new Hono();

scheduler.post('/day-close', async (c) => {
  try {
    await createRedditGameService().ensureClosedDays(new Date());
    return c.json({ status: 'ok' }, 200);
  } catch (error) {
    console.error('day-close job failed', error);
    return c.json({ status: 'error' }, 500);
  }
});
