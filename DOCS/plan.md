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

## Phase 1 — Frontend Migration (CRA → Vite)

Do this after Phase 0 so the frontend works against the new backend immediately.

### 1a. Vite migration
- [ ] Remove `react-scripts` from `package.json`
- [ ] Install `vite`, `@vitejs/plugin-react`
- [ ] Add `vite.config.js`
- [ ] Move `public/index.html` → `index.html`, update script tag
- [ ] Rename `src/index.js` → `src/index.jsx`
- [ ] Update `package.json` scripts: `dev` / `build` / `preview`
- [ ] Update `.claude/launch.json` frontend to port 5173
- [ ] Update `NewGame.js` + `JoinGame.js` to call `GET /rooms/:code/exists` instead of `/validation_data`
- [ ] Smoke test all game flows
- [ ] Commit: `feat: migrate frontend from CRA to Vite`

---

## Phase 2 — Bug Fixes

Fix the known frontend bugs now that both servers are running.

- [ ] **Popstate listener leak** (`Game.js:33` + `WikiPage.js:55`) — extract handlers to named consts
- [ ] **Socket reconnect** (`Game.js`) — remove popstate disconnect/reconnect; listen for `socket.on('connect')` and re-emit `join`
- [ ] **Stale time closure** (`WikiPage.js`) — use `useRef` for `time` in `endRound` handler
- [ ] **Nested `<a>` crash** (`WikiPage.js`) — guard `node.children[0]` before accessing `.data`
- [ ] Commit: `fix: frontend socket lifecycle and html-parser crash guards`

---

## Phase 3 — UX Polish

- [ ] **Loading states** — spinner while Wikipedia page fetches; "joining..." skeleton in Game.js lobby
- [ ] **Disable PLAY after click** — prevent double-starts
- [ ] **Live race progress** — show `current_page` and `clicks` per player in Users leaderboard during round
- [ ] **Room code copy button** — one-click copy to clipboard
- [ ] **Winner overlay** — show full leaderboard (all players' clicks + time), auto-return countdown
- [ ] **Give Up button** — emit `giveUp` event; backend marks DNF; if all give up, end round
- [ ] **Error toasts** — surface backend errors (room full, room not found) via MUI Snackbar
- [ ] **Custom MUI theme** — brand colors, dark mode toggle, better typography
- [ ] Commit per feature area

---

## Phase 4 — Features

- [ ] **Ranked scoring** — 3/2/1 pts for 1st/2nd/3rd finishers; separate `score` field from `wins`
- [ ] **Path replay** — track click history array per user; show on round-end screen
- [ ] **Custom page selection** — admin can type custom Wikipedia pages; validate via summary API
- [ ] **Win detection via canonical titles** — hit `https://en.wikipedia.org/api/rest_v1/page/summary/{page}` to resolve redirects before comparing to target
- [ ] **Mobile layout** — responsive CSS for the game grid

---

## Future Considerations (not planned yet)
- Redis swap-in: only requires changes to `rooms.js` + Socket.IO adapter in `index.js`
- Persistent player profiles (wins across sessions) — would need a DB back
- Spectator mode
- Playwright E2E tests
