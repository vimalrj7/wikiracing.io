# Architecture

## Game State Machine
```
Lobby (/game/:code)
  → admin clicks PLAY
  → server: set isRoundActive=true, record roundStartedAt, reset all users' clicks/current_page
  → emit startRound to all
  → all clients navigate to /wiki/:startPage

Race (/wiki/:page)
  → player clicks link → WikiPage.jsx intercepts → emits updatePage
  → server: guard on isRoundActive, increment clicks, update current_page, check win
  → if winner:
      compute elapsed = Date.now() - roundStartedAt
      set isRoundActive=false
      emit endRound (winner snapshot + elapsed time) to room
      randomize pages for next round
  → winner overlay shown → player clicks CONTINUE → back to Lobby
```

---

## Backend: Node.js + Fastify + Socket.IO

### File Structure
```
/backend
  index.js      Fastify server + all socket event handlers
  rooms.js      State module — ONLY place that reads/writes room state
  data.js       Page pairs + emoji pool
  package.json  "type": "module" (ESM)
```

### State Design — `rooms.js`
All room state is ephemeral in-memory Maps. Designed for Redis swap (only change `rooms.js`).

```js
// Exported functions — only interface to state
getRoom(roomCode)                   → room object or undefined
setRoom(roomCode, room)             → void
deleteRoom(roomCode)                → void
roomExists(roomCode)                → boolean
roomFromSocket(socketId)            → roomCode or undefined   ← reverse index
setSocketRoom(socketId, roomCode)   → void
deleteSocketRoom(socketId)          → void
```

### Current Room Shape
```js
{
  room_code:    Number,        // 4-digit int
  users: {
    [socketId]: {
      user_id:      String,    // same as socketId (limitation: breaks on reconnect)
      username:     String,
      admin:        Boolean,
      current_page: String | null,
      clicks:       Number,    // starts at -1; first updatePage on start page brings to 0
      wins:         Number,
      time:         Number,    // set by client-emitted updateTime (being replaced)
      emoji:        String
    }
  },
  start_page:   String,
  target_page:  String,
  round:        Number,
  emojis:       String[]       // remaining emoji pool; pop one per user join
}
```

```

Current room shape also includes:
```js
  isRoundActive:  Boolean,     // true between startRound and endRound; gates updatePage clicks
  roundStartedAt: Number,      // Date.now() set on startRound; elapsed computed on endRound
  // user.clicks starts at 0; user.time removed (server computes elapsed)
```

### Socket Event Map

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | client→server | Join or re-join a room |
| `disconnect` | server internal | Clean up user, transfer admin |
| `startRound` | client→server | Admin starts the race |
| `updateRoom` | server→room | Broadcast full room state (also sent after every `updatePage`) |
| `randomizePages` | client→server | Admin picks new random pages |
| `updatePage` | client→server + server→sender | Player navigated to new page |
| `chatMSG` | bidirectional | Chat message |
| `endRound` | server→room | Round over, winner announced (includes `allGaveUp: true` if applicable) |
| `gameError` | server→sender | Room not found, full, etc. |
| `giveUp` | client→server | Player gives up; backend marks DNF, sends bot message, ends round if all gave up |
| `setPages` | client→server | Admin sets custom start/target pages (admin-only, blocked if `isRoundActive`) |

### Handler Logic

**`join`:**
```
guard: if !username → return
if room doesn't exist → create: pick random page pair, sample 8 emojis, room_code, round=1
if socketId already in room.users → skip add (idempotent), still emit updateRoom
else: pop emoji from room.emojis, add user (admin = Object.keys(users).length === 0)
socket.join(roomCode)
setSocketRoom(socketId, roomCode)
io.to(roomCode).emit('updateRoom', roomExport)
io.to(roomCode).emit('chatMSG', { username:'Bot', emoji:'🤖', message:`${username} joined.` })
```

**`disconnect`** — most critical:
```
roomCode = roomFromSocket(socketId)
if not found → return
deletedUser = room.users[socketId]
delete room.users[socketId]
deleteSocketRoom(socketId)
if Object.keys(room.users).length === 0 → deleteRoom(roomCode) and return
if deletedUser.admin → room.users[Object.keys(room.users)[0]].admin = true
setRoom(roomCode, room)
io.to(roomCode).emit('updateRoom', roomExport)
io.to(roomCode).emit('chatMSG', { ..., message:`${deletedUser.username} left.` })
```

**`updatePage`:**
```
[Phase 3: guard on isRoundActive — if !room.isRoundActive return]
room.users[socketId].clicks += 1
room.users[socketId].current_page = page
setRoom(roomCode, room)
socket.emit('updatePage', { target: room.target_page })    ← sender only!
if page.toLowerCase() === room.target_page.toLowerCase():
    winnerSnapshot = { ...room.users[socketId] }           ← snapshot before wins++
    room.users[socketId].wins += 1
    room.isRoundActive = false
    room.round += 1
    randomize pages
    setRoom(roomCode, room)
    io.to(roomCode).emit('endRound', winnerSnapshot)
```

**`startRound`:**
```
room.isRoundActive = true
room.roundStartedAt = Date.now()
for each userId in room.users:
    room.users[userId].clicks = 0    [Phase 3: was -1]
    room.users[userId].current_page = room.start_page
setRoom(roomCode, room)
io.to(roomCode).emit('startRound', { startPage: room.start_page })
```

---

## Frontend: Vite + React

### Component Tree
```
App.jsx
  ├── NewGame.jsx      (userName, roomCode state setters)
  ├── JoinGame.jsx     (userName, roomCode state setters)
  ├── Game.jsx         (roomData from updateRoom events)
  │     ├── Users.jsx  (leaderboard — shows current_page + clicks during round)
  │     ├── Settings.jsx  (WikiSearch pickers for admin; RANDOMIZE button)
  │     └── Chat.jsx
  ├── WikiSearch.jsx   (debounced Wikipedia search dropdown, used in Settings)
  └── WikiPage.jsx     (Wikipedia rendering, inline timer, win detection, give-up)
        └── (Watch.jsx removed — timer interval inlined in WikiPage)
```

### Socket Lifecycle (current vs planned)

**Current**: `Socket.js` creates singleton and connects on import — socket is live before user enters username. Re-connect re-emits `join` via `socket.on('connect')` in `Game.jsx`.

**Planned (Phase 3)**: Socket connects lazily when user enters a game. `Socket.js` exports `socket` with `autoConnect: false`; `Game.jsx` calls `socket.connect()` on mount and `socket.disconnect()` on unmount.

### Wikipedia Rendering (current — post Phase 6)

`WikiPage.jsx` uses **two parallel fetches** per page navigation:

1. **`w/api.php?action=parse&prop=text|displaytitle|sections&origin=*`** — returns JSON with `parse.text["*"]` (clean article HTML) and `parse.sections` (array of `{toclevel, number, line, anchor}` for TOC).

2. **`api/rest_v1/page/summary/{title}`** — returns `description`, `titles.normalized` for the article header.

**TOC injection**: `buildTocHtml(sections)` builds a TOC HTML string from the sections data and splices it into the article HTML immediately before the first `<h2` — so it appears after the intro paragraphs and floated infobox, exactly like real Wikipedia.

`html-react-parser` options (memoized via `useRef` + `useMemo`):
- `<a href="/wiki/Page">` → `<Link to="/wiki/Page">` (game navigation) or `<Link to="/preview/Page">` (dev mode)
- `<a href="#anchor">` → kept as-is (TOC clicks, footnote refs)
- Skip `File:`, `Help:`, `Wikipedia:`, `Special:`, `Template:`, `Category:`, `Talk:`, `Portal:`, `User:`, `Draft:` namespaces → `<span>`
- All other `<a>` → `<span>` (strips external links)

Parsed content is **memoized**: `useMemo([html])` — only re-parses when html string changes, not on every timer tick.

**CSS** (`WikiPage.css`): Wikipedia Vector CDN CSS was **removed** (it applied `display:grid` to `.mw-body`, misplacing content). All article styles live in `WikiPage.css`:
- Infobox: `width:22em`, `border-collapse:collapse`, `infobox-label` centered, title/image/caption rows centered
- Images: both old `.thumb/.thumbinner` and new `<figure>/<figcaption>` — border box, `#f8f9fa` bg, text-wrapping float, caption contained to image width
- TOC: `wiki-toc` class, injected into HTML, styled to match Wikipedia
- Links: `color:#0645ad`, no underline, underline on hover
- `[edit]` links: hidden via `.mw-editsection { display:none }`

Note: `rest_v1/page/mobile-sections` is **decommissioned** (HTTP 403, Phabricator T328036).

---

## Architectural Audit Findings

Findings from the audit conducted after Phase 2, informing Phase 3+ work.

### Critical (affecting correctness)

| Issue | Impact | Fix |
|-------|--------|-----|
| `clicks: -1` implicit contract | Confusing leaderboard during lobby; breaks if start-page `updatePage` fires after win | Gate on `isRoundActive`, start at 0 |
| No `isRoundActive` guard on `updatePage` | Extra clicks counted in lobby; clicks counted after round ends | Add `isRoundActive` boolean, gate server-side |
| `updateTime` client-push | Stale closure risk (patched with `useRef`, but fragile); client can spoof time | Server records `roundStartedAt`, computes elapsed on `endRound` |
| No AbortController on Wikipedia fetch | In-flight fetch resolves after user navigates away; sets state on unmounted component | Add `AbortController`, abort in cleanup |

### Performance

| Issue | Impact | Fix |
|-------|--------|-----|
| Full Wikipedia HTML document (`rest_v1/page/html`) | ~2–5× larger payload; includes scripts, full stylesheet links | Switch to `mobile-sections` |
| Re-parse entire HTML every second (timer re-render) | CPU on every tick; jank on large articles | `useMemo` on `options` and `parse` result |
| `options` object recreated every render | `html-react-parser` gets new options ref on each parse | `useMemo` |
| No page cache | Navigating back re-fetches same page | Client-side `Map` cache (Phase 6) |

### Scalability / Modularity

| Issue | Impact | Fix |
|-------|--------|-----|
| `user_id = socketId` | User identity resets on reconnect; no persistent identity across rooms | Acceptable for now; document limitation |
| Emoji pool can empty | 8 emojis pre-sampled; 9th join has no emoji | Expand pool or cycle through all emojis |
| Socket connects on import | Socket open before user enters username | Lazy connect in `Game.jsx` |
| Recursive room code picker | Unlikely but theoretically infinite loop | Replace with loop + fallback |

### Bundle Size

| Issue | Impact | Fix |
|-------|--------|-----|
| MUI for `SendIcon` only | ~300KB added to bundle for one icon | Inline SVG or lightweight icon lib |

---

## Deployment

- **Backend**: Railway, single Node process. `process.env.PORT` auto-set by Railway.
- **Frontend**: `npm run build` → `/dist` → Vercel or Netlify
- **Env vars (backend)**: `PORT` (auto), no others needed for in-memory state
- **Env vars (frontend)**: `VITE_BACKEND_URL` pointing to Railway URL
- **No race conditions** in state — Node is single-threaded; in-memory Map mutations are atomic
