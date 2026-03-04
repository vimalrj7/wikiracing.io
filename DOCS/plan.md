# Plan

## Principles
- Use latest stable tools
- Commit with git after each logical change
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

## Phase 3 — Architecture & Performance Fixes ✅

### 3a. Wikipedia rendering (on feature/wikipedia-rendering-overhaul branch)
- [x] Switch to MediaWiki Action API (`action=parse`) — clean JSON body, no html/head/body stripping
- [x] Parallel fetch: parse API + `rest_v1/page/summary` for thumbnail + description
- [x] `useMemo` for parser options + parsed content (no re-parse on timer ticks)
- [x] `AbortController` on fetch — cancels on wikiPage change
- [x] Fix `Watch.jsx` timer — `[gameOver]` dep + functional updater
- [x] Wikipedia Vector CSS in `index.html`; `MediaWiki:Common.css` rules in `WikiPage.css`
- [x] Dev preview route `/preview/:wikiPage` (no room guard, links stay in `/preview/`)
- [x] Improved link interception: `/wiki/` prefix, namespace filtering, anchor strip

### 3b. Socket lifecycle ✅
- [x] **Lazy connect** — `Socket.js` uses `autoConnect: false`; `Game.jsx` calls `socket.connect()` on mount only when socket isn't already connected
- [x] **`gameError` event handler** — `Game.jsx` listens for `gameError` (renamed from reserved `error` event); displays inline error banner

### 3c. Room state improvements ✅
- [x] **`isRoundActive` boolean** — set `true` on `startRound`, `false` on `endRound`; `updatePage` still sends target back to player for display, but only counts clicks/checks win when active
- [x] **`roundStartedAt` timestamp** — `Date.now()` recorded on `startRound`; elapsed time computed server-side on win: `Math.floor((Date.now() - roundStartedAt) / 1000)`
- [x] **Server-computed time** — `endRound` payload includes `time: elapsed`; client uses `winner.time` in overlay; `updateTime` client emit removed
- [x] Commit: `feat: isRoundActive, server-side time, lazy socket connect, gameError event`

### 3d. Server error events ✅ (basic)
- [x] **Rename `error` → `gameError`** — Socket.IO reserves `error`; renamed in both backend and frontend
- [x] **Error banner in `Game.jsx`** — inline red banner for room-full and similar errors

---

## Phase 4 — UX Polish ✅

- [x] **Disable PLAY after click** — prevent double-starts; re-enable on `updateRoom`
- [x] **Live race progress** — `updateRoom` broadcast in `updatePage` handler; `WikiPage` shows live compact scoreboard
- [x] **Room code copy button** — one-click copy to clipboard in `Game.jsx`
- [x] **Winner overlay** — full leaderboard (all players' clicks + time), auto-return 10s countdown
- [x] **Give Up button** — `giveUp` socket event; backend marks DNF with bot chat message; if all give up, end round with `allGaveUp: true`
- [x] Commit: `feat: phase 4 UX polish — give up, winner overlay, live scoreboard, copy code`

---

## Phase 5 — Custom Page Selection ✅

- [x] **`WikiSearch` component** — debounced (280ms) Wikipedia `action=query&list=search` API, AbortController, live scrollable dropdown with `searchmatch` span highlighting
- [x] **Settings.jsx** rewritten — two `WikiSearch` pickers for admin; non-admin sees disabled inputs
- [x] **`setPages` backend event** — admin-only, blocked if `isRoundActive`, updates start/target, broadcasts `updateRoom`
- [x] Commit: `feat: phase 5 custom page selection with live Wikipedia search`

---

## Phase 6 — Wikipedia Page Polish ✅

- [x] **Removed Vector CDN CSS** — it applied `display:grid` to `.mw-body`, misplacing content off-screen. All needed styles now in `WikiPage.css`
- [x] **White background** — `body:has(.wiki-page)` overrides global cyan; article wrapper is `#fff`
- [x] **Sticky game bar** (48px, `#9575cd` purple) — Give Up left, target centered, compact player chips + timer right
- [x] **TOC injection** — `sections` prop added to parse API call; `buildTocHtml()` injects TOC HTML before first `<h2` so it appears after intro/infobox, before first section (just like real Wikipedia)
- [x] **`#anchor` links** allowed through html-react-parser (TOC clicks + footnote refs)
- [x] **Infobox CSS** — `width: 22em`, `border-collapse: collapse`, `infobox-label` centered, `infobox-title`/`infobox-above` centered bold, `infobox-image`/`infobox-caption` centered
- [x] **Image thumbnails** — both old `.thumb/.thumbinner` and new `<figure>/<figcaption>` formats: border box, `#f8f9fa` background, caption contained to image width, text wrapping float
- [x] **Wikipedia-style links** — `color: #0645ad`, no underline, underline on hover, visited `#0b0080`
- [x] **Hidden [edit] links** — `.mw-editsection { display: none }`
- [x] **Body margin reset** — `margin: 0; padding: 0` on body prevents whitespace around game bar
- [x] Commit: `feat: phase 6 wikipedia page polish`

---

## Phase 7 — UI Redesign

- [ ] Retro Wikipedia font-inspired UI, mobile-first
- [ ] Responsive grid (sidebar collapses on small screens)
- [ ] Dark mode toggle

---

## Future Considerations (not planned yet)
- Redis swap-in: only requires changes to `rooms.js` + Socket.IO adapter in `index.js`
- Persistent player profiles (wins across sessions) — would need a DB back
- Spectator mode
- Playwright E2E tests
