import React from 'react';
import {socket} from "./Socket"
import "./Settings.css"

function Settings({ roomData }) {


    const startPage = roomData['data'] ? roomData['data']['start_page'] : null
    const targetPage = roomData['data'] ? roomData['data']['target_page'] : null
    const roomCode = roomData['data'] ? roomData['data']['room_code'] : null

    function handleRandomize(e) {
        console.log('Emitting Randomize', roomCode)
        socket.emit("randomizePages", {roomCode})
      }

    return (
        <div className="options-container">       
        <h2>OPTIONS</h2>
        <div className="title-row">
        <h3>START</h3>
        <h3>TARGET</h3>
        </div>
        <div className="page-row">
        <div className="page-container start-page">
        <h3>{startPage}</h3>
        </div>
        <div className="page-container target-page">
        <h3>{targetPage}</h3>
        </div>
        </div>
        <div className="random-btn-container">
        <button className="random-btn main-button" onClick={handleRandomize}>RANDOMIZE</button>
        </div>
        </div>
    )
}

export default Settings;

