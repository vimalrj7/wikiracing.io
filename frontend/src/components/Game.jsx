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
  const navigate = useNavigate();

  const admin = roomData["data"] ? roomData["data"]["users"][socket.id]['admin'] : null;

  useEffect(() => {
    socket.emit("join", { userName, roomCode });
    console.log("Joined Room", roomCode);

    const onUpdateRoom = (data) => {
      console.log("Update Room call", data);
      setRoomData({ ...roomData, data });
    };

    const onStartRound = (data) => {
      console.log("Received startRound with redirect to", data["startPage"]);
      navigate(`/wiki/${data["startPage"]}`);
    };

    // Re-emit join if socket reconnects (e.g. after a brief network drop)
    const onConnect = () => socket.emit("join", { userName, roomCode });

    socket.on("updateRoom", onUpdateRoom);
    socket.on("startRound", onStartRound);
    socket.on("connect", onConnect);

    return () => {
      socket.off("updateRoom", onUpdateRoom);
      socket.off("startRound", onStartRound);
      socket.off("connect", onConnect);
    };
  }, []);

  function handleStart(e) {
    console.log("Emitting startRound");
    socket.emit("startRound", { roomCode });
  }

  return userName === "" ? (
    <Navigate to="/" />
  ) : (
    <div className="game-wrapper">
      <div className="grid-container grid-header">
        <div className="logo">
          <Link to="/"><img className='logo-img' src={logo}/></Link>
        </div>
        <div className="heading">
          <h1 className="room-code">ROOM #{roomCode}</h1>
        </div>
        <div className="start-btn-container">
          <button className="play-btn main-button" disabled={!admin}  onClick={handleStart}>
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
