import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { socket } from "./Socket";
import Chat from "./Chat";
import Users from "./Users";
import Settings from "./Settings";
import "./Game.css";
import logo from '../assets/logo.png'

function Game({ userName, roomCode }) {
  const [roomData, setRoomData] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const admin = roomData["data"] ? roomData["data"]["users"][socket.id]?.['admin'] : null;

  useEffect(() => {
    // Connect lazily — socket has autoConnect:false so it isn't open until here
    if (!socket.connected) socket.connect();

    socket.emit("join", { userName, roomCode });

    const onUpdateRoom = (data) => {
      setRoomData({ ...roomData, data });
      setStarting(false); // re-enable PLAY if updateRoom fires (e.g. admin changed)
    };

    const onStartRound = (data) => {
      navigate(`/wiki/${data["startPage"]}`);
    };

    // Re-emit join on reconnect (e.g. brief network drop)
    const onConnect = () => socket.emit("join", { userName, roomCode });

    // Server-side errors (room full, invalid room, etc.)
    const onGameError = ({ message }) => setErrorMsg(message);

    socket.on("updateRoom", onUpdateRoom);
    socket.on("startRound", onStartRound);
    socket.on("connect", onConnect);
    socket.on("gameError", onGameError);

    return () => {
      socket.off("updateRoom", onUpdateRoom);
      socket.off("startRound", onStartRound);
      socket.off("connect", onConnect);
      socket.off("gameError", onGameError);
    };
  }, []);

  function handleCopyCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleStart() {
    setStarting(true);
    socket.emit("startRound", { roomCode });
  }

  return userName === "" ? (
    <Navigate to="/" />
  ) : (
    <div className="game-wrapper">
      {errorMsg && (
        <div className="game-error-banner">
          ⚠️ {errorMsg}
        </div>
      )}
      <div className="grid-container grid-header">
        <div className="logo">
          <Link to="/"><img className='logo-img' src={logo}/></Link>
        </div>
        <div className="heading">
          <h1 className="room-code">ROOM #{roomCode}</h1>
          <button className="copy-code-btn" onClick={handleCopyCode} title="Copy room code">
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        </div>
        <div className="start-btn-container">
          <button className="play-btn main-button" disabled={!admin || starting} onClick={handleStart}>
            PLAY
          </button>
        </div>
      </div>
      <div className="grid-container grid-users">
        <Users roomData={roomData} />
      </div>
      <div className="grid-container grid-settings">
        <Settings roomData={roomData} />
      </div>
      <div className="grid-container grid-chat">
        <Chat userName={userName} roomCode={roomCode} />
      </div>
      <div className="winner-modal"></div>
    </div>
  );
}

export default Game;
