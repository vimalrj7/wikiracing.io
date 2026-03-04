// In-memory room state — the only place that reads/writes room state.
// Swap Redis in here later without changing anything in index.js.

/** @type {Map<number, object>} roomCode → room object */
const rooms = new Map();

/** @type {Map<string, number>} socketId → roomCode (reverse index) */
const socketRooms = new Map();

// --- Room CRUD ---

export function getRoom(roomCode) {
  return rooms.get(roomCode);
}

export function setRoom(roomCode, room) {
  rooms.set(roomCode, room);
}

export function deleteRoom(roomCode) {
  rooms.delete(roomCode);
}

export function roomExists(roomCode) {
  return rooms.has(roomCode);
}

// --- Socket → Room reverse index ---

export function roomFromSocket(socketId) {
  return socketRooms.get(socketId);
}

export function setSocketRoom(socketId, roomCode) {
  socketRooms.set(socketId, roomCode);
}

export function deleteSocketRoom(socketId) {
  socketRooms.delete(socketId);
}
