import { context, reddit, redis } from '@devvit/web/server';
import { dayIdFromInstant } from '../../shared/calendar';
import { formatTodayPostTitle } from '../game-service';

const TEXT_FALLBACK =
  'Read the Room is a daily Keep or Cut game. Open the post to lock your call and guess what share of the room will say Keep.';

export const todayPostKey = (dayId: string) => `meta:todayPost:${dayId}`;
const todayPostLockKey = (dayId: string) => `meta:todayPostLock:${dayId}`;

export type PostRef = {
  id: string;
  title: string;
  permalink?: string;
  removed?: boolean;
  createdAt?: Date;
};

export type TodayPostBoard = {
  getStoredPostId(dayId: string): Promise<string | null>;
  storePostId(dayId: string, postId: string): Promise<void>;
  getPost(id: string): Promise<PostRef | null>;
  findPostsByTitle(title: string): Promise<PostRef[]>;
  submitPost(title: string): Promise<PostRef>;
};

export type EnsureTodayPostResult = {
  post: PostRef;
  created: boolean;
};

export function pickExistingTodayPost(posts: PostRef[]): PostRef | null {
  const usable = posts.filter((post) => !post.removed);
  if (usable.length === 0) {
    return null;
  }
  const sorted = [...usable].sort((a, b) => {
    const aTime = a.createdAt?.getTime() ?? 0;
    const bTime = b.createdAt?.getTime() ?? 0;
    if (aTime !== bTime) {
      return aTime - bTime;
    }
    return a.id.localeCompare(b.id);
  });
  return sorted[0] ?? null;
}

export async function ensureTodayPost(
  board: TodayPostBoard,
  now: Date = new Date()
): Promise<EnsureTodayPostResult> {
  const dayId = dayIdFromInstant(now);
  const title = formatTodayPostTitle();

  const storedId = await board.getStoredPostId(dayId);
  const stored = storedId ? await board.getPost(storedId) : null;
  if (stored && !stored.removed) {
    return { post: stored, created: false };
  }

  // The title is evergreen, so only a same-title post created on this Eastern day counts.
  const sameDay = (await board.findPostsByTitle(title)).filter(
    (post) => post.createdAt !== undefined && dayIdFromInstant(post.createdAt) === dayId
  );
  const existing = pickExistingTodayPost(sameDay);
  if (existing) {
    await board.storePostId(dayId, existing.id);
    return { post: existing, created: false };
  }

  const created = await board.submitPost(title);
  await board.storePostId(dayId, created.id);
  return { post: created, created: true };
}

export function postCommentsUrl(post: PostRef, subredditName: string): string {
  if (post.permalink) {
    if (post.permalink.startsWith('http://') || post.permalink.startsWith('https://')) {
      return post.permalink;
    }
    return `https://www.reddit.com${post.permalink}`;
  }
  const id = post.id.replace(/^t3_/, '');
  return `https://www.reddit.com/r/${subredditName}/comments/${id}`;
}

function asT3(id: string): `t3_${string}` {
  return (id.startsWith('t3_') ? id : `t3_${id}`) as `t3_${string}`;
}

function toRef(post: {
  id: string;
  title: string;
  permalink: string;
  removed: boolean;
  createdAt: Date;
}): PostRef {
  return {
    id: post.id,
    title: post.title,
    permalink: post.permalink,
    removed: post.removed,
    createdAt: post.createdAt,
  };
}

export function createRedditTodayPostBoard(subredditName: string): TodayPostBoard {
  return {
    async getStoredPostId(dayId) {
      return (await redis.get(todayPostKey(dayId))) ?? null;
    },
    async storePostId(dayId, postId) {
      await redis.set(todayPostKey(dayId), postId);
    },
    async getPost(id) {
      try {
        return toRef(await reddit.getPostById(asT3(id)));
      } catch {
        return null;
      }
    },
    async findPostsByTitle(title) {
      const posts = await reddit
        .getNewPosts({ subredditName, limit: 50, pageSize: 25 })
        .all();
      return posts.filter((post) => post.title === title).map(toRef);
    },
    async submitPost(title) {
      const post = await reddit.submitCustomPost({
        title,
        entry: 'default',
        textFallback: { text: TEXT_FALLBACK },
      });
      return toRef(post);
    },
  };
}

async function withTodayPostLock<T>(dayId: string, run: () => Promise<T>): Promise<T> {
  const lockKey = todayPostLockKey(dayId);
  const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    await redis.set(lockKey, token, {
      nx: true,
      expiration: new Date(Date.now() + 20_000),
    });
    if ((await redis.get(lockKey)) === token) {
      try {
        return await run();
      } finally {
        if ((await redis.get(lockKey)) === token) {
          await redis.del(lockKey);
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Today's post is still being created. Try once more.");
}

export async function ensureTodayRedditPost(
  now: Date = new Date()
): Promise<EnsureTodayPostResult> {
  const subredditName = context.subredditName;
  if (!subredditName) {
    throw new Error('Missing subreddit');
  }
  const dayId = dayIdFromInstant(now);
  const board = createRedditTodayPostBoard(subredditName);
  return withTodayPostLock(dayId, () => ensureTodayPost(board, now));
}
