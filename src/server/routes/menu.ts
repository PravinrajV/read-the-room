import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { ensureTodayRedditPost, postCommentsUrl } from '../core/post';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
  try {
    const result = await ensureTodayRedditPost();
    const subredditName = context.subredditName;
    if (!subredditName) {
      return c.json<UiResponse>({ showToast: "Could not create today's post" }, 400);
    }
    return c.json<UiResponse>(
      {
        navigateTo: postCommentsUrl(result.post, subredditName),
        showToast: result.created
          ? { text: "Posted today's Read the Room", appearance: 'success' }
          : "Today's post is already up",
      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>({ showToast: "Could not create today's post" }, 400);
  }
});
