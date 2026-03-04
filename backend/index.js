import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import BadWords from 'bad-words';
import { emojis, pages } from './data.js';
import {
  getRoom,
  setRoom,
  deleteRoom,
  roomExists,
  roomFromSocket,
  setSocketRoom,
  deleteSocketRoom,
} from './rooms.js';

const ROOM_LIMIT = 8;
const PORT = process.env.PORT || 3001;

const fastify = Fastify({ logger: false });
const filter = new BadWords();

await fastify.register(fastifyCors, { origin: '*' });

// --- Helpers ---

/** Pick a random element from an array */
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffle-sample n items from arr (Fisher-Yates partial) */
function sample(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/** Pick a new random [start, target] pair */
function randomPages() {
  return randomChoice(pages);
}

/** Serialize room for emission — strips the emojis pool (internal only) */
function exportRoom(room) {
  const { emojis: _pool, ...rest } = room;
  return rest;
}

// --- REST endpoints ---

fastify.get('/', async (_req, reply) => {
  reply.send('This is the backend server for wikiracing.io.');
});

fastify.get('/rooms/:code/exists', async (req, reply) => {
  const code = parseInt(req.params.code, 10);
  reply.send({ exists: roomExists(code) });
});

// --- Start HTTP server, then attach Socket.IO ---

await fastify.listen({ port: PORT, host: '0.0.0.0' });
console.log(`wikiracing backend listening on port ${PORT}`);

const io = new SocketIOServer(fastify.server, {
  cors: { origin: '*' },
});

// --- Socket.IO events ---

io.on('connection', (socket) => {
  // --------------------------------------------------------------------
  // join
  // --------------------------------------------------------------------
  socket.on('join', (data) => {
    const username = data?.userName;
    const roomCode = parseInt(data?.roomCode, 10);

    if (!username) return;

    let room = getRoom(roomCode);

    if (!room) {
      const [start, target] = randomPages();
      room = {
        room_code: roomCode,
        users: {},
        start_page: start,
        target_page: target,
        round: 1,
        emojis: sample(emojis, ROOM_LIMIT),
        isRoundActive: false,
        roundStartedAt: 0,
      };
      setRoom(roomCode, room);
    }

    // Idempotent — already in room
    if (room.users[socket.id]) {
      socket.join(roomCode);
      setSocketRoom(socket.id, roomCode);
      io.to(roomCode).emit('updateRoom', exportRoom(room));
      return;
    }

    // Room full
    if (Object.keys(room.users).length >= ROOM_LIMIT) {
      socket.emit('gameError', { message: 'Room is full.' });
      return;
    }

    const isAdmin = Object.keys(room.users).length === 0;
    const emoji = room.emojis.pop();

    room.users[socket.id] = {
      user_id: socket.id,
      username,
      admin: isAdmin,
      current_page: null,
      clicks: -1,
      wins: 0,
      time: 0,
      emoji,
    };
    setRoom(roomCode, room);

    socket.join(roomCode);
    setSocketRoom(socket.id, roomCode);

    io.to(roomCode).emit('updateRoom', exportRoom(room));
    io.to(roomCode).emit('chatMSG', {
      username: 'Bot',
      emoji: '🤖',
      message: `${username} joined the room.`,
    });
  });

  // --------------------------------------------------------------------
  // disconnect
  // --------------------------------------------------------------------
  socket.on('disconnect', () => {
    const roomCode = roomFromSocket(socket.id);
    if (roomCode === undefined) return;

    const room = getRoom(roomCode);
    if (!room) return;

    const deletedUser = room.users[socket.id];
    if (!deletedUser) return;

    delete room.users[socket.id];
    deleteSocketRoom(socket.id);

    // Last user left — clean up room entirely
    if (Object.keys(room.users).length === 0) {
      deleteRoom(roomCode);
      return;
    }

    // Transfer admin if the leaving user was admin
    if (deletedUser.admin) {
      const newAdminId = Object.keys(room.users)[0];
      room.users[newAdminId].admin = true;
    }

    setRoom(roomCode, room);

    io.to(roomCode).emit('updateRoom', exportRoom(room));
    io.to(roomCode).emit('chatMSG', {
      username: 'Bot',
      emoji: '🤖',
      message: `${deletedUser.username} left the room.`,
    });
  });

  // --------------------------------------------------------------------
  // startRound
  // --------------------------------------------------------------------
  socket.on('startRound', (data) => {
    const roomCode = parseInt(data?.roomCode, 10);
    const room = getRoom(roomCode);
    if (!room) return;

    room.isRoundActive = true;
    room.roundStartedAt = Date.now();

    for (const userId of Object.keys(room.users)) {
      room.users[userId].clicks = -1;  // -1 so start-page updatePage brings it to 0
      room.users[userId].current_page = room.start_page;
      room.users[userId].time = 0;
      room.users[userId].gaveUp = false;
    }
    setRoom(roomCode, room);

    io.to(roomCode).emit('startRound', { startPage: room.start_page });
  });

  // --------------------------------------------------------------------
  // updateRoom  (admin requesting a fresh broadcast)
  // --------------------------------------------------------------------
  socket.on('updateRoom', (data) => {
    const roomCode = parseInt(data?.roomCode, 10);
    const room = getRoom(roomCode);
    if (!room) return;

    io.to(roomCode).emit('updateRoom', exportRoom(room));
  });

  // --------------------------------------------------------------------
  // randomizePages
  // --------------------------------------------------------------------
  socket.on('randomizePages', (data) => {
    const roomCode = parseInt(data?.roomCode, 10);
    const room = getRoom(roomCode);
    if (!room) return;

    const [start, target] = randomPages();
    room.start_page = start;
    room.target_page = target;
    setRoom(roomCode, room);

    io.to(roomCode).emit('updateRoom', exportRoom(room));
  });

  // --------------------------------------------------------------------
  // updatePage — fires on every Wikipedia page navigation.
  // clicks starts at -1 so the start-page load brings it to 0.
  // Guard on isRoundActive prevents lobby clicks from counting.
  // --------------------------------------------------------------------
  socket.on('updatePage', (data) => {
    const roomCode = parseInt(data?.roomCode, 10);
    const page = data?.wikiPage;
    const room = getRoom(roomCode);
    if (!room || !room.users[socket.id]) return;

    // Always confirm target to the player (needed so they see the target on load)
    socket.emit('updatePage', { target: room.target_page });

    // Only count clicks and check win when a round is active
    if (!room.isRoundActive) return;

    room.users[socket.id].clicks += 1;
    room.users[socket.id].current_page = page;
    setRoom(roomCode, room);

    // Broadcast live race progress to all players
    io.to(roomCode).emit('updateRoom', exportRoom(room));

    // Win check (case-insensitive)
    if (page.toLowerCase() === room.target_page.toLowerCase()) {
      // Compute server-side elapsed time
      const elapsed = Math.floor((Date.now() - room.roundStartedAt) / 1000);

      // Snapshot before incrementing wins — same order as original Flask code
      const winnerSnapshot = {
        ...room.users[socket.id],
        time: elapsed,
      };

      room.users[socket.id].wins += 1;
      room.users[socket.id].time = elapsed;
      room.round += 1;
      room.isRoundActive = false;

      // Pre-randomize pages for next round
      const [start, target] = randomPages();
      room.start_page = start;
      room.target_page = target;
      setRoom(roomCode, room);

      io.to(roomCode).emit('endRound', winnerSnapshot);
    }
  });

  // --------------------------------------------------------------------
  // giveUp — player forfeits; if all players gave up, end the round
  // --------------------------------------------------------------------
  socket.on('giveUp', (data) => {
    const roomCode = parseInt(data?.roomCode, 10);
    const room = getRoom(roomCode);
    if (!room || !room.users[socket.id] || !room.isRoundActive) return;

    room.users[socket.id].gaveUp = true;
    setRoom(roomCode, room);

    io.to(roomCode).emit('updateRoom', exportRoom(room));
    io.to(roomCode).emit('chatMSG', {
      username: 'Bot',
      emoji: '🤖',
      message: `${room.users[socket.id].username} gave up.`,
    });

    // End round if all players gave up
    const allGaveUp = Object.values(room.users).every((u) => u.gaveUp);
    if (allGaveUp) {
      room.isRoundActive = false;
      room.round += 1;
      const [start, target] = randomPages();
      room.start_page = start;
      room.target_page = target;
      // Clear gaveUp flags for next round
      for (const u of Object.values(room.users)) u.gaveUp = false;
      setRoom(roomCode, room);
      io.to(roomCode).emit('endRound', { username: null, allGaveUp: true });
    }
  });

  // --------------------------------------------------------------------
  // updateTime
  // --------------------------------------------------------------------
  socket.on('updateTime', (data) => {
    const roomCode = parseInt(data?.roomCode, 10);
    const time = data?.time;
    const room = getRoom(roomCode);
    if (!room || !room.users[socket.id]) return;

    room.users[socket.id].time = time;
    setRoom(roomCode, room);
  });

  // --------------------------------------------------------------------
  // chatMSG
  // --------------------------------------------------------------------
  socket.on('chatMSG', (data) => {
    const roomCode = parseInt(data?.roomCode, 10);
    const username = data?.userName;
    const room = getRoom(roomCode);
    if (!room || !room.users[socket.id]) return;

    let message;
    try {
      message = filter.clean(data?.message ?? '');
    } catch {
      // bad-words throws on empty strings in some versions
      message = data?.message ?? '';
    }

    const emoji = room.users[socket.id].emoji;

    io.to(roomCode).emit('chatMSG', { username, emoji, message });
  });
});
