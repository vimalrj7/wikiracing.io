import io from "socket.io-client";

export const backend_url = "http://127.0.0.1:3001/";

// autoConnect: false — socket connects explicitly in Game.jsx on game entry,
// not on app load before the user has even entered their name.
export const socket = io(backend_url, { autoConnect: false });
