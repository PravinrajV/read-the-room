import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { zonedMidnight } from '../shared/calendar.ts';
import { formatTodayPostTitle } from './game-service.ts';
import {
  ensureTodayPost,
  pickExistingTodayPost,
  postCommentsUrl,
  type PostRef,
  type TodayPostBoard,
} from './core/post.ts';

const noonEt = (dayId: string) => new Date(zonedMidnight(dayId).getTime() + 12 * 60 * 60 * 1000);

class MemoryBoard implements TodayPostBoard {
  stored = new Map<string, string>();
  posts = new Map<string, PostRef>();
  submits = 0;
  nextId = 1;

  async getStoredPostId(dayId: string): Promise<string | null> {
    return this.stored.get(dayId) ?? null;
  }

  async storePostId(dayId: string, postId: string): Promise<void> {
    this.stored.set(dayId, postId);
  }

  async getPost(id: string): Promise<PostRef | null> {
    return this.posts.get(id) ?? null;
  }

  async findPostsByTitle(title: string): Promise<PostRef[]> {
    return [...this.posts.values()].filter((post) => post.title === title);
  }

  async submitPost(title: string): Promise<PostRef> {
    this.submits += 1;
    const post: PostRef = {
      id: `t3_new${this.nextId}`,
      title,
      permalink: `/r/readtheroomgame_dev/comments/new${this.nextId}/today/`,
      removed: false,
      createdAt: new Date('2026-11-13T16:00:00.000Z'),
    };
    this.nextId += 1;
    this.posts.set(post.id, post);
    return post;
  }

  add(post: PostRef): void {
    this.posts.set(post.id, post);
  }
}

describe('ensureTodayPost', () => {
  it('creates one post for the Eastern day and reuses it the next time', async () => {
    const board = new MemoryBoard();
    const now = noonEt('2026-11-13');
    const first = await ensureTodayPost(board, now);
    const second = await ensureTodayPost(board, now);
    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(first.post.id, second.post.id);
    assert.equal(board.submits, 1);
    assert.equal(first.post.title, formatTodayPostTitle());
    assert.equal(board.stored.get('2026-11-13'), first.post.id);
  });

  it('returns an existing same-title post when the index is empty', async () => {
    const board = new MemoryBoard();
    const title = formatTodayPostTitle();
    board.add({
      id: 't3_1xvacve',
      title,
      permalink: '/r/readtheroomgame_dev/comments/1xvacve/today/',
      removed: false,
      createdAt: new Date('2026-11-13T15:20:00.000Z'),
    });
    const result = await ensureTodayPost(board, noonEt('2026-11-13'));
    assert.equal(result.created, false);
    assert.equal(result.post.id, 't3_1xvacve');
    assert.equal(board.submits, 0);
    assert.equal(board.stored.get('2026-11-13'), 't3_1xvacve');
  });

  it('keeps the oldest of two same-day posts and does not make a third', async () => {
    const board = new MemoryBoard();
    const title = formatTodayPostTitle();
    board.add({
      id: 't3_1xvaw1h',
      title,
      permalink: '/r/readtheroomgame_dev/comments/1xvaw1h/today/',
      removed: false,
      createdAt: new Date('2026-11-13T15:30:00.000Z'),
    });
    board.add({
      id: 't3_1xvacve',
      title,
      permalink: '/r/readtheroomgame_dev/comments/1xvacve/today/',
      removed: false,
      createdAt: new Date('2026-11-13T15:20:00.000Z'),
    });
    const result = await ensureTodayPost(board, noonEt('2026-11-13'));
    assert.equal(result.post.id, 't3_1xvacve');
    assert.equal(result.created, false);
    assert.equal(board.submits, 0);
  });

  it('creates a new post if the stored one was removed', async () => {
    const board = new MemoryBoard();
    const title = formatTodayPostTitle();
    board.add({
      id: 't3_gone',
      title,
      removed: true,
      createdAt: new Date('2026-11-13T15:00:00.000Z'),
    });
    board.stored.set('2026-11-13', 't3_gone');
    const result = await ensureTodayPost(board, noonEt('2026-11-13'));
    assert.equal(result.created, true);
    assert.equal(result.post.id, 't3_new1');
    assert.equal(board.submits, 1);
  });

  it('builds a comments URL from a permalink or a post id', () => {
    assert.equal(
      postCommentsUrl(
        { id: 't3_1xvacve', permalink: '/r/readtheroomgame_dev/comments/1xvacve/today/' },
        'readtheroomgame_dev'
      ),
      'https://www.reddit.com/r/readtheroomgame_dev/comments/1xvacve/today/'
    );
    assert.equal(
      postCommentsUrl({ id: 't3_1xvacve' }, 'readtheroomgame_dev'),
      'https://www.reddit.com/r/readtheroomgame_dev/comments/1xvacve'
    );
  });

  it('ignores removed posts when picking an existing one', () => {
    const title = formatTodayPostTitle();
    const kept = pickExistingTodayPost([
      { id: 't3_old', title, removed: true, createdAt: new Date('2026-11-13T15:00:00.000Z') },
      { id: 't3_ok', title, removed: false, createdAt: new Date('2026-11-13T16:00:00.000Z') },
    ]);
    assert.equal(kept?.id, 't3_ok');
  });

  it('uses an evergreen title with no date and no em dash', () => {
    const title = formatTodayPostTitle();
    assert.equal(title, 'Read the Room: one real rule a day. Keep it or cut it?');
    assert.doesNotMatch(title, /\d{4}|Nov|\u2014/);
  });

  it("does not reuse yesterday's same-title post for a new day", async () => {
    const board = new MemoryBoard();
    board.add({
      id: 't3_yesterday',
      title: formatTodayPostTitle(),
      removed: false,
      createdAt: new Date('2026-11-12T16:00:00.000Z'),
    });
    const result = await ensureTodayPost(board, noonEt('2026-11-13'));
    assert.equal(result.created, true);
    assert.notEqual(result.post.id, 't3_yesterday');
    assert.equal(board.submits, 1);
  });
});
