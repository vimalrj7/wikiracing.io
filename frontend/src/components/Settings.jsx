import React from "react";
import { socket } from "./Socket";
import WikiSearch from "./WikiSearch";
import "./Settings.css";

function Settings({ roomData }) {
  const data = roomData["data"];
  if (!data) return <div className="options-container" />;

  const startPage  = data.start_page;
  const targetPage = data.target_page;
  const roomCode   = data.room_code;
  const roundNum   = data.round;
  const admin      = data.users[socket.id]?.admin ?? false;

  function handleStartSelect(page) {
    socket.emit("setPages", { roomCode, startPage: page });
  }

  function handleTargetSelect(page) {
    socket.emit("setPages", { roomCode, targetPage: page });
  }

  function handleRandomize() {
    socket.emit("randomizePages", { roomCode });
  }

  return (
    <div className="options-container">
      <h2>OPTIONS</h2>
      <h3 className="round-heading">ROUND #{roundNum}</h3>

      <div className="pages-grid">
        {/* START */}
        <div className="page-col">
          <p className="page-label">START</p>
          <WikiSearch
            value={startPage}
            onSelect={handleStartSelect}
            disabled={!admin}
            placeholder="Search start page…"
          />
        </div>

        {/* TARGET */}
        <div className="page-col">
          <p className="page-label">TARGET</p>
          <WikiSearch
            value={targetPage}
            onSelect={handleTargetSelect}
            disabled={!admin}
            placeholder="Search target page…"
          />
        </div>
      </div>

      <div className="random-btn-container">
        <button className="random-btn main-button" disabled={!admin} onClick={handleRandomize}>
          RANDOMIZE
        </button>
      </div>
    </div>
  );
}

export default Settings;
