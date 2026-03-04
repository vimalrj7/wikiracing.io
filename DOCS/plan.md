# Plan

## Principles
- Use latest stable tools
- Commit with git after each logical change (docs in the same commit as code)
- Keep it working at every step — no big-bang rewrites
- Backend and frontend migrations are independent; do them in sequence

---

## Phase 0 — Backend Rewrite (Node.js + Fastify) ✅

The MongoDB Atlas cluster is dead. The Flask backend cannot run. Rewrite first so we have a working backend to test against.

### 0a. Scaffold Node.js backend
- [x] Delete all Python files (`app.py`, `Room.py`, `config.py`, `requirements.txt`, `Procfile`, `runtime.txt`)
- [x] `npm init` in `/backend`, install: `fastify`, `socket.io`, `bad-words`, `nodemon`
- [x] Create `data.js` — port `pages` and `emojis` from `data.py` (fix horse emoji typo `'🐴;'` → `'🐴'`)
- [x] Create `rooms.js` — in-memory Map state module with `getRoom/setRoom/deleteRoom/roomExists/roomFromSocket/setSocketRoom/deleteSocketRoom`
- [x] Create `index.js` — Fastify v5 + Socket.IO (attached directly to `fastify.server`)

### 0b. Implement all socket events
- [x] `join`
- [x] `disconnect`
- [x] `startRound`
- [x] `updateRoom`
- [x] `randomizePages`
- [x] `updatePage`
- [x] `updateTime`
- [x] `chatMSG`

### 0c. REST endpoint
- [x] `GET /` health check
- [x] `GET /rooms/:code/exists` → `{ exists: Boolean }` (replaces `/validation_data`)

### 0d. Wiring + test
- [x] Update `.claude/launch.json` backend to use `npm run dev`, port 3001
- [x] Update `Socket.js` `backend_url` to `http://127.0.0.1:3001/`
- [x] Smoke test: frontend loads, backend health check passes, `/rooms/:code/exists` returns correct JSON
- [x] Commit: `feat: rewrite backend in Node.js + Fastify with in-memory state`

---

## Phase 1 — Frontend Migration (CRA → Vite) ✅

Do this after Phase 0 so the frontend works against the new backend immediately.

### 1a. Vite migration
- [x] Remove `react-scripts` from `package.json`
- [x] Install `vite`, `@vitejs/plugin-react`
- [x] Add `vite.config.js` (clean scaffold + `server.host: true`)
- [x] Move `public/index.html` → `index.html`, update script tag to `src/index.jsx`
- [x] Rename all JSX-containing `.js` → `.jsx` (App + all components except Socket.js)
- [x] Update `package.json` scripts: `dev` / `build` / `preview`
- [x] Update `.claude/launch.json` frontend to port 5173
- [x] Update `NewGame.jsx` + `JoinGame.jsx` to call `GET /rooms/:code/exists` instead of `/validation_data`
- [x] Smoke test: Vite dev server on port 5173, home screen renders, build produces 576 modules in 1.2s
- [x] Commit: `feat: migrate frontend from CRA to Vite`

---

## Phase 2 — Bug Fixes ✅

Fix the known frontend bugs now that both servers are running.

- [x] **Popstate listener leak** (`Game.jsx` + `WikiPage.jsx`) — extract all handlers to named consts; cleanup now removes the correct references
- [x] **Socket reconnect** (`Game.jsx`) — removed disconnect/reconnect on popstate; `socket.on('connect')` re-emits `join` (server handler is idempotent)
- [x] **Stale time closure** (`WikiPage.jsx`) — `useRef` mirrors time state; `endRound` reads `timeRef.current` instead of stale closure
- [x] **Nested `<a>` crash** (`WikiPage.jsx`) — replaced `node.children[0].data` with `domToReact(node.children, options)` for both internal and external link rules
- [x] **`<html>`/`<head>`/`<body>` nesting warning** (`WikiPage.jsx`) — added parser rules to drop `<head>` and unwrap `<html>`/`<body>` (Wikipedia REST API returns a full document)
- [x] **Missing `key` props** (`Users.jsx`, `Chat.jsx`) — added `key={user['user_id']}` and `key={index}` to list items
- [x] Commit: `fix: frontend socket lifecycle and html-parser crash guards`

---

## Phase 3 — Architecture & Performance Fixes ✅ (partial)

Fix the structural issues found in the architectural audit before building new features on top of them.

### 3a. WikiPage rendering performance ✅
- [x] **Memoize parse result** — `useMemo([html])` so timer re-renders don't re-parse the article
- [x] **Memoize options object** — `useRef` + `useMemo([devMode])` for stable parser options ref (supports recursive `domToReact` via `optionsRef.current`)
- [x] **AbortController on Wikipedia fetch** — aborts in-flight fetches on `wikiPage` param change
- [x] **Switch to MediaWiki Action API** — `rest_v1/page/html` (full document) replaced with `w/api.php?action=parse` (returns clean `div.mw-parser-output` body only; no html/head/body wrappers to strip). Note: `mobile-sections` is **decommissioned** (403, see Phabricator T328036)
- [x] **Dual fetch** — parallel fetch of parse API + `rest_v1/page/summary` for thumbnail and short description
- [x] **Fix Watch.jsx timer** — `useEffect` now depends on `[gameOver]` with functional updater `setTime(prev => prev + 1)`; interval no longer restarts every second
- [x] **Wikipedia article CSS** — load Vector skin CSS once in `index.html`; add infobox/TOC/wikitable/thumb styles in `WikiPage.css` (MediaWiki:Common.css rules that aren't in the skin bundle); reset global `Roboto Mono` font override for article content
- [x] **Dev preview route** — `/preview/:wikiPage` renders `WikiPage` with `devMode=true`; bypasses room guard; links stay within `/preview/` for easy article browsing without joining a game
- [x] **Improved link interception** — detects `/wiki/` prefix (Action API format); strips anchor fragments; skips non-article namespaces (`File:`, `Help:`, `Wikipedia:`, etc.); all other `<a>` tags → `<span>`
- [x] Commit: `feat: wikipedia rendering overhaul — action=parse API, sticky game bar, perf fixes`

### 3b. Socket lifecycle
- [ ] **Lazy connect** — remove `io(backend_url, { autoConnect: false })` style or restructure `Socket.js` so the socket only connects when the user joins a game, not on app load
- [ ] **Error event handler** — add `socket.on('error', ...)` listener in `Game.jsx` and `WikiPage.jsx`; server already should emit errors for room-full, not-found etc.
- [ ] Commit: `fix: lazy socket connect + error event handling`

### 3c. Room state improvements
- [ ] **Add `isRoundActive` boolean** to room shape — server sets `true` on `startRound`, `false` on `endRound`; used to gate `updatePage` clicks server-side (currently clicks are counted even if no round is active)
- [ ] **Replace `updateTime` with `roundStartedAt`** — on `startRound`, server records `roundStartedAt = Date.now()` in room state; on `endRound`, server computes elapsed time from `Date.now() - roundStartedAt` for each user; client never needs to emit `updateTime`; removes stale-closure risk entirely
- [ ] **Fix `clicks: -1` contract** — start at 0, ignore the start-page `updatePage` call server-side when `isRoundActive` just became true, OR gate `updatePage` on `isRoundActive`
- [ ] Commit: `feat: isRoundActive + server-side elapsed time tracking`

### 3d. Server error events
- [ ] Emit `error` event to socket for: room not found on join, room full (8 users), bad roomCode
- [ ] Client: surface these via MUI Snackbar toast in `NewGame.jsx` / `JoinGame.jsx` / `Game.jsx`
- [ ] Commit: `feat: server error events + client error toasts`

---

## Phase 4 — UX Polish

- [ ] **Loading states** — spinner while Wikipedia page fetches; "joining..." skeleton in Game lobby
- [ ] **Disable PLAY after click** — prevent double-starts; re-enable on `updateRoom` callback
- [ ] **Live race progress** — show `current_page` and `clicks` per player in Users leaderboard during round (needs `isRoundActive` from Phase 3c)
- [ ] **Room code copy button** — one-click copy to clipboard
- [ ] **Winner overlay** — show full leaderboard (all players' clicks + time), auto-return countdown
- [ ] **Give Up button** — emit `giveUp` event; backend marks DNF; if all give up, end round
- [ ] Commit per feature area

---

## Phase 5 — Custom Page Selection

- [ ] **Page search UI** — admin can search Wikipedia pages via OpenSearch API (`https://en.wikipedia.org/w/api.php?action=opensearch&search={query}`) for both start and target; random button still present to use curated pairs
- [ ] **Validate via summary API** — `rest_v1/page/summary/{title}` to resolve redirects and confirm page exists before setting it
- [ ] **Win detection via canonical titles** — compare `current_page` against canonical title from summary API to handle redirects (e.g. "US" → "United States")
- [ ] **Update `randomizePages` event** — allow passing explicit `{ startPage, targetPage }` payload; falls back to random pick from `data.js` if not provided
- [ ] Commit: `feat: custom page selection with Wikipedia search + validation`

---

## Phase 6 — Wikipedia Rendering Overhaul

Goal: make the Wikipedia reading experience clean, fast, and game-appropriate.

- [ ] **Parse mobile-sections JSON** — `rest_v1/page/mobile-sections/{page}` returns structured sections with clean HTML per section; render only sections (skip infoboxes if desired, control table-of-contents)
- [ ] **Wikipedia CSS** — scope Wikipedia styles under a `.wiki-content` class rather than injecting global `<link>` tags; prevents style bleed into game UI
- [ ] **Page cache** — memoize last N fetched pages in a `Map` (client-side); instant back-navigation
- [ ] **Improve link interception** — handle section anchors (`/wiki/Page#Section` → strip anchor for game nav), skip non-article namespaces (`File:`, `Help:`, `Wikipedia:`, etc.)
- [ ] **Remove MUI dependency** — replace `SendIcon` with an inline SVG; MUI is ~300KB for one icon
- [ ] Commit: `feat: wikipedia rendering overhaul with mobile-sections + page cache`

---

## Phase 7 — UI Redesign

Goal: lean into the gamey aesthetic, retro Wikipedia font-inspired, mobile-first.

- [ ] **Custom MUI theme** — or replace MUI entirely; use a retro/typewriter font (e.g. `Special Elite`, `Courier Prime`); Wikipedia-style serif for in-game text
- [ ] **Mobile layout** — responsive CSS grid; sidebar collapses to bottom sheet on small screens
- [ ] **Dark mode toggle** — system preference default, persisted in localStorage
- [ ] **Game lobby redesign** — leaderboard + settings as cards; room code prominent with copy button
- [ ] **Race screen redesign** — sticky top bar with timer + target; Wikipedia content below; no scrolled-away controls
- [ ] Commit per design area

---

## Future Considerations (not planned yet)
- Redis swap-in: only requires changes to `rooms.js` + Socket.IO adapter in `index.js`
- Persistent player profiles (wins across sessions) — would need a DB back
- Spectator mode
- Ranked scoring (3/2/1 pts for 1st/2nd/3rd finishers)
- Path replay — track click history array per user; show on round-end screen
- Playwright E2E tests
