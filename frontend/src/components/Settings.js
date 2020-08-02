import React from 'react';
import {socket} from "./Socket"

function Settings({ roomData }) {


    const startPage = roomData['data'] ? roomData['data']['start_page'] : null
    const targetPage = roomData['data'] ? roomData['data']['target_page'] : null
    const roomCode = roomData['data'] ? roomData['data']['room_code'] : null

    function handleRandomize(e) {
        console.log('Emitting Randomize', roomCode)
        socket.emit("randomizePages", {roomCode})
      }

    return (
        <div>
        <h2> Settings</h2>

        <h3>Start Page: {startPage}</h3>
        <h3>Target Page: {targetPage}</h3>
        <button onClick={handleRandomize}>Randomize Pages</button>

        </div>
    )
}

export default Settings;

