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
        <div className="page-row">
        <div className="page-container">
        <h3>Start Page: {startPage}</h3>
        </div>
        <div className="page-container">
        <h3>Target Page: {targetPage}</h3>
        </div>
        </div>
        <div className="random-btn-container">
        <button className="random-btn" onClick={handleRandomize}>Randomize Pages</button>
        </div>
        </div>
    )
}

export default Settings;

