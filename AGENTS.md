# Read the Room, Devvit Web

You are writing a Devvit web application that will run inside a Reddit post.

## Tech stack

- Frontend: React 19, Tailwind CSS 4, Vite
- Backend: Node.js serverless (Devvit), Hono
- Shared: pure TypeScript modules for scoring, day close, early-read, calendar, streaks, flair, and archive
- Persistence: Devvit Redis, behind `GameStore`. Local preview uses `MemoryStore`.
- Do not use `@devvit/public-api` or Blocks. This is Devvit Web only.
- Do not enable HTTP fetch, payments, or LLMs.
- Do not run `devvit login`, `devvit upload`, `devvit playtest`, or `devvit publish` unless the user has a Reddit account ready and asked for that step.

## Layout

- `src/shared`: types and pure game logic, unit-tested
- `src/server`: Hono routes, Redis store, scheduled day close
- `src/client`: `splash.html` is the inline feed view. `game.html` is the expanded view.
- `tools/local-preview.ts`: local Vite plus in-memory API, no Reddit login
- `tools/dev-fixture.ts`: labeled fake splits for local UI review only. Never import it from `src/server/index.ts`.

## Frontend rules

- Use `navigateTo` from `@devvit/web/client` instead of `window.location` for Reddit links.
- Use `requestExpandedMode` to open the expanded game from the splash view.
- Prefer type aliases over interfaces.
- Prefer named exports.
- User-facing copy uses contractions and does not use em dashes.

## Commands

- `npm test`: unit tests
- `npm run test:types`: TypeScript project build
- `npm run lint`
- `npm run preview:local`: local UI preview
- `npm run verify:sources`: live check of prompt source URLs
