# Read the Room

A daily game that runs inside a Reddit post, built on Devvit Web for Reddit's Game of the Day Hackathon.

Every day there's one real rule, taken from an official source: an airline regulation, a TSA policy, a national park rule, a museum guideline, a store return policy. You decide whether to **Keep** it or **Cut** it. Then you guess what share of the subreddit will say Keep. At midnight US Eastern the room reveals, and you're scored on how close your guess was.

There's no right answer to Keep or Cut. The skill is reading the room. The crowd itself is the answer key.

## How to play

1. Open today's post and tap **Play today's call**.
2. Read the rule. Tap **More** if it's cut off. The official source is linked right under it.
3. Pick **Keep** or **Cut**.
4. Drag the slider to guess what percent of the room will say Keep.
5. Tap **Lock in your call**. Your vote and your guess lock together, and you can't change them.
6. Tell the room why in the comments.
7. Come back after midnight ET. The first time you open the game each day, it shows **Yesterday's room**: the real Keep share counting up, a split bar filling to it with a marker where your guess landed, how many locks it came from, your call, how far off your guess was, your score, and the closest guesser. Tap **Play today's call** to move on. It folds into a one-line recap you can replay.

Scoring is simple: `100 - |your guess - the real Keep percent|`, never below 0. A perfect read scores 100. Every point you're off costs one point.

## How a day works

- **The day is an Eastern day.** Days run midnight to midnight in `America/New_York`, DST included. Everyone on the sub plays the same prompt that day, wherever they are.
- **One lock per person per day.** The lock is written to Redis inside a watched transaction, so a double tap or a second device can't vote twice.
- **The split stays hidden while the day is open.** You can see how many people have locked in, but not which way they went.
- **The day closes on the hour.** An hourly scheduled job (`0 * * * *`) closes any day that has ended. Every read also runs the same close first, so a late or skipped cron run never leaves a stale day open.
- **10 locks for an official reveal.** If at least 10 people locked in, the day reveals. Its Keep percent, lock count, and the closest guesser (ties go to the earlier lock, then username) are frozen into a snapshot, and every lock is scored against it.
- **Under 10 it's an Early read.** The real vote count is shown, but there's no official split and no score. A split from three people isn't a room, so we don't pretend it is.
- **Yesterday's recap.** The next day opens with the Yesterday's room card, then keeps a one-line recap above the prompt, for example "58% of 14 locks said Keep. You scored 91." If yesterday was an Early read, the card says "Early read, N locks" and shows no split and no score. The recap also names the most-divided call so far: the revealed day closest to 50/50, and only if it landed between 35% and 65% Keep. A 90/10 day isn't divided, so it never gets that label.
- **Archive.** Closed days that revealed can be replayed, scored against their frozen real split. Archive plays never change the official result and don't count toward your streak. Early-read days are listed but can't be scored.
- **Streak.** Lock in on consecutive Eastern days to build a streak. Miss a day and it resets to 1 on your next lock. It sits in the header as a small badge.
- **The 10-lock rule is enforced on read too.** Any stored day marked revealed with fewer than 10 locks is shown as an Early read, with no split, no closest guesser and no score. The check runs every time a day is read and doesn't rewrite storage, so it's safe to repeat. It also covers a day closed by an old test build.
- **Evergreen post titles.** A post always shows whichever day's prompt is live when it's opened, so new posts are titled "Read the Room: one real rule a day. Keep it or cut it?" with no date. The mod menu still makes at most one post per Eastern day.

## Look and feel

- Dark warm black, cream and gold is the house look, with Geist and IBM Plex Serif. There's a full light theme too, warm paper rather than plain white. Both pass WCAG AA contrast.
- The game follows your Reddit or device theme through `prefers-color-scheme`. Most Reddit app players run dark, so dark is also the fallback. The sun or moon button in the header overrides it, and switching back to your device's theme goes back to following it.
- The feed card has original SVG art of a lit stage with the room in rows facing it. There are no stock images and no AI images.
- The reveal animates: the Keep share counts up and the split bar fills to the real number. Everything respects `prefers-reduced-motion`.
- Layout is checked from 320px to 1024px wide, including Reddit's narrow expanded modal and the 512px inline post.

## Where the prompts come from

The catalog is 30 hand-written prompts in `src/shared/prompts.ts`, frozen in order. Day N of the calendar (starting 2026-11-11) shows prompt `N mod 30`.

Every prompt links to its source, with the publisher and an as-of date, and says only what that source says. Sources include TSA, the eCFR and govinfo (14 CFR and 36 CFR), the National Park Service, Yosemite and Yellowstone park pages, the National Gallery of Art, Amtrak, WMATA, the NFL, Apple, IKEA, and New York Education Law. Each one was read and checked on November 13, 2026. The check notes are in `docs/source-verification.md`.

Prompts stay away from fees, money, investing, crypto, and gambling. The hook is a rule and whether it's fair, not a price.

The app makes no outside network calls at runtime (`http.enable` is `false` in `devvit.json`) and doesn't use an LLM. `npm run verify:sources` is a separate script you run from your own machine to confirm each source URL still loads.

## Architecture

| Layer | What it uses |
| --- | --- |
| Post UI | Devvit Web, React 19, Tailwind CSS 4, Vite. `splash.html` is the inline feed card, `game.html` is the expanded game. |
| Server | Devvit Web serverless Node with Hono routes: `/api/state`, `/api/lock`, `/api/archive-play`, plus internal menu, trigger, and scheduler endpoints. |
| Storage | Devvit Redis. One JSON record per Eastern day (`day:YYYY-MM-DD`), plus per-user streak and archive-play keys and a closed-day index. |
| Scheduler | `day-close` task, hourly. |
| Mod tools | A subreddit menu item, **Post today's Read the Room**. It reuses today's post if one already exists, under a short Redis lock, so two mods can't create duplicates. |
| Fonts | Geist and IBM Plex Serif, both SIL Open Font License, shipped in `public/fonts`. |

Game rules live in `src/shared` as pure TypeScript: calendar and ET day math, scoring, reveal and early read, closest guesser, most-divided call, streaks, and archive scoring. The server talks to storage through a `GameStore` interface. Production uses `RedisStore`, and tests and the local preview use an in-memory `MemoryStore`.

```
src/
  client/   React UI (splash + expanded game), hooks, copy
  server/   Hono routes, GameService, Redis and memory stores, post creation
  shared/   types, prompts, and pure game logic with unit tests
tools/      local preview server, dev fixture, source checker
```

The key constant is `MIN_REVEAL_VOTES = 10` in `src/shared/constants.ts`.

## Run it locally

You need Node 24 or newer.

```bash
npm ci
npm test              # unit tests
npm run test:types    # TypeScript project build
npm run lint
npm run preview:local # UI + game logic, no Reddit login
```

Then open http://127.0.0.1:5173/src/client/preview.html

The local preview uses an in-memory store and shows a banner saying nothing there is a live vote. Its archive starts empty, same as production. To review the reveal and archive screens with fake splits, run `npm run preview:local -- --fixture` or add `?fixture=1` to the URL. Fixture data is labeled on screen as not real, and the production server never imports it.

## Run it on Reddit

1. `npm ci`
2. `npx devvit login`
3. Change `dev.subreddit` in `devvit.json` to a subreddit you moderate with fewer than 200 members.
4. `npm run dev` to playtest, or `npx devvit upload` then `npx devvit install <subreddit>`.
5. On the subreddit, open the mod menu and pick **Post today's Read the Room**.

The app's meant to stay private for the hackathon, so this repo has no publish step in its instructions.

## Test status

45 unit tests cover ET day boundaries and DST, prompt rotation, scoring, the 10-lock threshold and the read-side check for under-10 reveals, closest-guesser ties, the most-divided call, streaks, archive scoring, the Yesterday's room data, evergreen post titles and same-day post reuse, and the service flow from lock to close, recap, and archive, all against the in-memory store.

The app is uploaded privately and installed on r/readtheroomgame_dev, where it's been played since November 13, 2026. Being straight about the numbers: every lock there so far is a real lock from the developer's own test account. No votes were seeded or scripted.

- **Nov 13:** closed as an Early read with 1 lock, which is the correct result under the 10-lock rule.
- **Nov 16:** a reveal test. To see the reveal path work on Reddit before the room had 10 players, a private test build dropped the threshold to 1 lock for that one day. The day closed at midnight ET and revealed from the single test lock, the next day's recap showed the score, and the archive offered the day for replay. That's a test of the code path, not a community result.
- The threshold was set back to 10 right after that test, and 10 is what ships. Since the read-side check went in, Nov 16 shows on Reddit as "Early read, 1 lock", with no split and no score, the same as any other day under 10.

## License

Game code: MIT, Copyright (c) 2026 Pravinraj Vincent. See `LICENSE`.

This project started from Reddit's official Devvit Web React template, which is BSD-3-Clause, Copyright (c) 2025 Reddit Inc. That notice is kept in `LICENSE-devvit-template`. The fonts in `public/fonts` are under the SIL Open Font License, and their license files sit next to them.
