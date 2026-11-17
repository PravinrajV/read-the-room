import { createServer as createViteServer } from 'vite';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { GameService } from '../src/server/game-service.ts';
import { MemoryStore } from '../src/server/memory-store.ts';
import { seedDevFixture } from './dev-fixture.ts';
import type { ArchivePlayRequest, LockRequest } from '../src/shared/api.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRequested =
  process.env.READTHEROOM_FIXTURE === '1' || process.argv.includes('--fixture');

const store = new MemoryStore();
if (fixtureRequested) {
  seedDevFixture(store, new Date());
}

const actorFromRequest = (request: Request) => {
  const user = request.headers.get('x-preview-user')?.trim() || 'local-preview';
  return { userId: user, username: user };
};

const serviceFor = (request: Request) => {
  const url = new URL(request.url);
  const fixture = fixtureRequested || url.searchParams.get('fixture') === '1';
  if (fixture && store.closedDayIds.length === 0) {
    seedDevFixture(store, new Date());
  }
  return new GameService({
    store,
    fixture,
    localPreview: true,
    commentUrl: null,
  });
};

const api = new Hono();

api.get('/state', async (c) => {
  const state = await serviceFor(c.req.raw).getState(new Date(), actorFromRequest(c.req.raw));
  return c.json(state);
});

api.post('/lock', async (c) => {
  try {
    const body = await c.req.json<LockRequest>();
    const state = await serviceFor(c.req.raw).lockToday(
      new Date(),
      actorFromRequest(c.req.raw),
      body.choice,
      body.prediction
    );
    return c.json({ type: 'lock', state });
  } catch (err) {
    return c.json(
      { status: 'error', message: err instanceof Error ? err.message : 'Could not lock' },
      400
    );
  }
});

api.post('/archive-play', async (c) => {
  try {
    const body = await c.req.json<ArchivePlayRequest>();
    const result = await serviceFor(c.req.raw).playArchive(
      new Date(),
      actorFromRequest(c.req.raw),
      body.dayId,
      body.choice,
      body.prediction
    );
    return c.json({ type: 'archive-play', play: result.play, state: result.state });
  } catch (err) {
    return c.json(
      { status: 'error', message: err instanceof Error ? err.message : 'Could not play that day' },
      400
    );
  }
});

const app = new Hono();
app.route('/api', api);

const apiPort = Number(process.env.READTHEROOM_API_PORT ?? 8787);
const clientPort = Number(process.env.READTHEROOM_CLIENT_PORT ?? 5173);

serve({ fetch: app.fetch, port: apiPort }, (info) => {
  console.log(`Local API: http://127.0.0.1:${info.port}`);
});

const vite = await createViteServer({
  configFile: path.join(root, 'vite.local.config.ts'),
  server: { port: clientPort, host: '127.0.0.1' },
});
await vite.listen();
vite.printUrls();
console.log(
  fixtureRequested
    ? 'Fixture mode is on. Splits are labeled and not real.'
    : 'Archive starts empty. Pass --fixture or READTHEROOM_FIXTURE=1 to review labeled fake splits.'
);
console.log(`Open http://127.0.0.1:${clientPort}/src/client/preview.html`);
