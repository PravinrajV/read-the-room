import { context } from '@devvit/web/server';
import type { Actor } from './game-service';

export function actorFromContext(): Actor {
  const userId = context.userId ?? null;
  if (!userId) {
    return { userId: null, username: null };
  }
  return { userId, username: context.username ?? null };
}

export function commentUrlFromContext(): string | null {
  const postId = context.postId?.replace(/^t3_/, '');
  const subreddit = context.subredditName;
  if (!postId || !subreddit) {
    return null;
  }
  return `https://www.reddit.com/r/${subreddit}/comments/${postId}`;
}
