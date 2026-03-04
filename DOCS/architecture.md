# Architecture

## Game State Machine
```
Lobby (/game/:code)
  → admin clicks PLAY
  → server: reset all users' clicks/current_page → emit startRound
  → all clients navigate to /wiki/:startPage

Race (/wiki/:page)
  → player clicks link → WikiPage.js intercepts → emits updatePage
  → server: increment clicks, update current_page, check win
  → if winner: emit endRound (winner snapshot) + immediately randomize pages for next round
  → winner overlay shown → player clicks CONTINUE → back to Lobby
```

---

## Target Backend: Node.js + Fastify + Socket.IO

### File Structure
```
/backend
  index.js      Fastify server + all socket event handlers
  rooms.js      State module — ONLY place that reads/writes room state
  data.js       Page pairs + emoji pool (ported from Python data.py)
  package.json
```

### State Design — `rooms.js`
All room state is ephemeral in-memory Maps. No database.

```js
// rooms.js — these are the only exported functions
// Swap Redis in here later without changing anything in index.js
getRoom(roomCode)                   → room object or undefined
setRoom(roomCode, room)             → void
deleteRoom(roomCode)                → void
roomExists(roomCode)                → boolean
roomFromSocket(socketId)            → roomCode or undefined   ← reverse index
setSocketRoom(socketId, roomCode)   → void
deleteSocketRoom(socketId)          → void
```

Room shape (mirrors old MongoDB document, `_id` renamed to `room_code`):
```js
{
  room_code: Number,        // 4-digit int
  users: {
    [socketId]: {
      user_id:      String,        // same as socketId for now
      username:     String,
      admin:        Boolean,
      current_page: String | null,
      clicks:       Number,        // starts at -1; first updatePage brings it to 0
      wins:         Number,
      time:         Number,
      emoji:        String
    }
  },
  start_page:  String,
  target_page: String,
  round:       Number,
  emojis:      String[]    // remaining pool; pop one per user join
}
```

### Socket Event Map (Flask → Node.js)

| Flask | Node.js |
|---|---|
| `@socketio.on('event')` | `socket.on('event', handler)` inside `io.on('connection')` |
| `request.sid` | `socket.id` |
| `join_room(code)` | `socket.join(code)` |
| `leave_room(code)` | `socket.leave(code)` |
| `emit('e', d, broadcast=True, room=code)` | `io.to(code).emit('e', d)` |
| `emit('e', d)` — sender only | `socket.emit('e', d)` |
| `@socketio.on('disconnect')` | `socket.on('disconnect', handler)` |

### Handler Logic to Preserve Exactly

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
io.to(roomCode).emit('chatMSG', { username:'Bot', emoji:'🤖', message:`${deletedUser.username} left.` })
```

**`updatePage`:**
```
room.users[socketId].clicks += 1
room.users[socketId].current_page = page
setRoom(roomCode, room)
socket.emit('updatePage', { target: room.target_page })    ← sender only!
if page.toLowerCase() === room.target_page.toLowerCase():
    winnerSnapshot = { ...room.users[socketId] }           ← snapshot before incrementing
    room.users[socketId].wins += 1
    room.round += 1
    randomize pages
    setRoom(roomCode, room)
    io.to(roomCode).emit('endRound', winnerSnapshot)
```

**`startRound`:**
```
for each userId in room.users:
    room.users[userId].clicks = -1
    room.users[userId].current_page = room.start_page
setRoom(roomCode, room)
io.to(roomCode).emit('startRound', { startPage: room.start_page })
```

**`randomizePages`:**
```
pick new [start, target] pair from data.js
setRoom(roomCode, room)
io.to(roomCode).emit('updateRoom', roomExport)
```

**`updateTime`:**
```
room.users[socketId].time = data.time
setRoom(roomCode, room)
```

**`chatMSG`:**
```
clean message with bad-words Filter
emoji = room.users[socketId].emoji
io.to(roomCode).emit('chatMSG', { username, emoji, message })
```

### Migration Gotchas

1. **No race conditions** — Node is single-threaded; in-memory Map mutations are atomic. No mutex needed.

2. **`clicks` starts at -1** — `updatePage` fires on the start page load too, so the first real link click shows clicks=0. Preserve this intentional behavior.

3. **`endRound` sends pre-increment snapshot** — capture `{ ...room.users[socketId] }` before `wins += 1`, emit the snapshot. This is what Flask does (reads user, then increments).

4. **`updatePage` emits to sender only** — `socket.emit` not `io.to(room).emit`. Only the navigating player receives the target confirmation.

5. **Admin transfer uses insertion order** — `Object.keys(room.users)[0]` gives the first-joined remaining user, matching Python's `next(iter(self.users))`.

6. **roomCode type normalization** — Frontend sends roomCode as string (from URL params). Normalize: `const code = parseInt(data.roomCode, 10)`. Use Number as Map key consistently.

7. **Profanity filter** — Replace Python `better-profanity` with npm `bad-words`: `new Filter().clean(message)`.

8. **REST endpoint** — Replace `/validation_data` (returns ALL rooms — a security/perf problem) with `GET /rooms/:code/exists` → `{ exists: Boolean }`. Update `NewGame.js` + `JoinGame.js`.

9. **ROOM_LIMIT** — cap at 8 users. Check on join: `if Object.keys(room.users).length >= 8 → emit error to sender, return`.

---

## Target Frontend: Vite + React

### CRA → Vite Migration Steps
1. Remove `react-scripts` from `package.json`
2. Install `vite` + `@vitejs/plugin-react`
3. Add `frontend/vite.config.js`:
   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   export default defineConfig({ plugins: [react()] })
   ```
4. Move `frontend/public/index.html` → `frontend/index.html`
5. Replace CRA `%PUBLIC_URL%` and script tag in `index.html`:
   ```html
   <script type="module" src="/src/index.jsx"></script>
   ```
6. Rename `src/index.js` → `src/index.jsx`
7. Update `package.json` scripts:
   ```json
   "dev": "vite",
   "build": "vite build",
   "preview": "vite preview"
   ```
8. Update `.claude/launch.json` frontend port to 5173, command to `npm run dev`

### Do Not Touch During Migration
- All `src/components/` files — zero logic changes
- Wikipedia fetch in `WikiPage.js`
- Link interception `replace` function in `WikiPage.js`
- All socket event names and payloads
- `src/App.js` routing structure

### Frontend State Shape (unchanged)
- `App.js` — `userName`, `roomCode` held at top level, passed as props
- `Game.js` — `roomData` from `updateRoom` events; note `.data` nesting: `roomData.data.users`, `roomData.data.start_page`
- `WikiPage.js` — `pageData` (HTML), `userData` (target), `time`, `winner`
- `Socket.js` — singleton, connects on import; change `backend_url` here; post-Vite use `import.meta.env.VITE_BACKEND_URL`

### Known Frontend Bugs (fix after migration)
- `Game.js:33` + `WikiPage.js:55` — popstate listener never cleaned up (arrow fn ref mismatch)
- `Game.js` — socket reconnect doesn't re-emit `join`; user silently leaves room
- `WikiPage.js` — stale `time` closure in `endRound`; `updateTime` always sends 1
- `WikiPage.js` — `node.children[0].data` crashes on nested `<a><span>` children
- `Game.js:14` — **FIXED**: optional chaining on `socket.id` admin lookup

---

## HTML Parsing in WikiPage.js (unchanged)
`html-react-parser` replace function handles:
- `<a title="...">` → `<Link to="/wiki/{href}">` (internal wiki links become game navigation)
- `<a class="external text">` → `<span>` (strips external links of interactivity)
- `<base>` → clears href
- `<link rel="stylesheet">` → prepends `//en.wikipedia.org/` to load Wikipedia CSS from CDN

---

## Deployment
- **Backend**: Railway, single Node process. `process.env.PORT` (Railway sets this automatically).
- **Frontend**: `npm run build` → `/dist` → Vercel or Netlify
- **Env vars (backend)**: `PORT` (Railway auto-sets), no others needed for in-memory state
- **Env vars (frontend)**: `VITE_BACKEND_URL` pointing to Railway URL
