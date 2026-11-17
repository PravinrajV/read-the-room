import { Hono } from 'hono';
import type { OnAppInstallRequest, TriggerResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createRedditGameService } from '../service';

export const triggers = new Hono();

// Do not auto-post on install. That created a second Nov 13 post in
// r/readtheroomgame_dev when a mod later used the menu. Mods post with
// "Post today's Read the Room", which reuses today's post if it exists.
triggers.post('/on-app-install', async (c) => {
  try {
    await createRedditGameService().ensureClosedDays(new Date());
    const input = await c.req.json<OnAppInstallRequest>();
    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Read the Room is ready in ${context.subredditName}. Use the mod menu to post today. (trigger: ${input.type})`,
      },
      200
    );
  } catch (error) {
    console.error(`Error on install: ${error}`);
    return c.json<TriggerResponse>(
      { status: 'error', message: 'Installed, but could not finish setup' },
      400
    );
  }
});
