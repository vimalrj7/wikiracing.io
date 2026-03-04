# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

wikiracing.io is a multiplayer browser game where players race to reach a target Wikipedia page from a starting page using only internal Wikipedia links.

- **Full plan & roadmap**: `DOCS/plan.md`
- **Architecture reference**: `DOCS/architecture.md`

## Stack (migration complete)

| Layer | Status |
|-------|--------|
| Backend | Node.js + Fastify v5 + Socket.IO v4, in-memory Map state |
| Frontend | Vite 5 + React 18 + React Router v6 |
| Backend deploy | Railway (`process.env.PORT`) |
| Frontend deploy | Vercel or Netlify (`VITE_BACKEND_URL`) |

## Commands

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server on port 5173
npm run build    # Production build to /dist
npm run preview  # Preview production build locally
```

### Backend (`/backend`)
```bash
npm install
npm run dev   # nodemon on port 3001
npm start     # node index.js (production)
```

## Dev Server (Claude Preview)
Configs are in `.claude/launch.json`. Start with:
```
preview_start("frontend")
preview_start("backend")
```

## Repo Layout
```
/frontend
  index.html           Root HTML (not in /public)
  vite.config.js
  /src
    index.jsx
    App.jsx
    /components        All game UI — do not restructure
      Socket.js        Singleton socket — connects on import (planned: lazy connect)
      Game.jsx         Lobby — roomData state, admin controls
      WikiPage.jsx     Race screen — Wikipedia HTML rendering, timer, win detection
      Chat.jsx         In-lobby chat
      Users.jsx        Leaderboard
      Settings.jsx     Page randomizer, round settings
      Watch.jsx        Countdown timer
      NewGame.jsx      Home screen — create room
      JoinGame.jsx     Home screen — join room
/backend
  index.js      Fastify server + all socket event handlers
  rooms.js      State module — only place that reads/writes room state
  data.js       Page pairs + emoji pool
  package.json  "type": "module" (ESM)
/DOCS
  plan.md       Phased roadmap
  architecture.md  Architecture decisions, socket event map, audit findings
```

## Key Invariants — Do Not Change Without Updating DOCS
- Socket event names: `join`, `disconnect`, `startRound`, `updateRoom`, `randomizePages`, `updatePage`, `updateTime`, `chatMSG`, `endRound`
- Frontend component structure and game flow (no restructuring)
- `rooms.js` is the only place that reads/writes room state

## Things That Will Change (planned)
- Wikipedia API endpoint: `rest_v1/page/html/{page}` → `rest_v1/page/mobile-sections/{page}` (Phase 3)
- Socket lifecycle: connects on import → lazy connect in Game.jsx (Phase 3)
- `updateTime` event: client-push → server-computed via `roundStartedAt` (Phase 3)

## Git Workflow
- Commit after each logical change with descriptive messages
- **Always commit doc updates in the same commit as the code changes they describe**
