# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

wikiracing.io is a multiplayer browser game where players race to reach a target Wikipedia page from a starting page using only internal Wikipedia links.

- **Full plan & roadmap**: `memory/plan.md`
- **Architecture reference**: `memory/architecture.md`

## Target Stack (migration in progress)

| Layer | Current | Target |
|-------|---------|--------|
| Backend | Python Flask + python-socketio | Node.js + Fastify + socket.io |
| State | MongoDB Atlas (dead cluster) | In-memory Map via `rooms.js` |
| Frontend | Create React App | Vite + React |
| Backend deploy | Heroku + Gunicorn | Railway |
| Frontend deploy | Netlify | Vercel or Netlify |

## Commands

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server on port 5173 (after migration)
npm run build    # Production build to /dist
npm run preview  # Preview production build locally
npm test         # Run Jest tests (React Testing Library)
```
> Currently still CRA — `npm start` until Vite migration is done.

### Backend (`/backend`)
```bash
# After Node.js migration:
npm install
npm run dev      # nodemon on port 3001
npm start        # node index.js (production)

# Current Flask (broken — MongoDB cluster is dead):
backend/venv/bin/python app.py
```

## Dev Server (Claude Preview)
Configs are in `.claude/launch.json`. Start with:
```
preview_start("frontend")
preview_start("backend")   # after Node migration
```

## Repo Layout
```
/frontend          React app (CRA → Vite migration pending)
  /src/components  All game UI components — do not restructure
  index.html       Move here (from /public) during Vite migration
/backend           Server (Flask → Node.js rewrite pending)
  rooms.js         [NEW] State module — getRoom/setRoom/deleteRoom
  data.js          [NEW] Page pairs + emoji pool (ported from data.py)
  index.js         [NEW] Fastify + Socket.IO server
/memory            Detailed docs
  plan.md          Phased migration + feature roadmap
  architecture.md  Architecture decisions, socket event map, migration notes
```

## Key Invariants — Do Not Change
- Socket event names: `join`, `disconnect`, `startRound`, `updateRoom`, `randomizePages`, `updatePage`, `updateTime`, `chatMSG`, `endRound`
- Wikipedia REST API fetch from frontend: `https://en.wikipedia.org/api/rest_v1/page/html/{page}`
- Link interception logic in `WikiPage.js` — converts `<a title="...">` to React Router `<Link>`
- Frontend component structure and game flow

## Git Workflow
Stage and commit after each logical change. Use descriptive messages.
