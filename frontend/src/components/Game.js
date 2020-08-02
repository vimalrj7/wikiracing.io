import React, { useState, useEffect } from "react";
import { Redirect, Link, useHistory } from "react-router-dom";
import Chat from "./Chat"
import Wiki from "./WikiPage"
import Users from "./Users"
import Settings from "./Settings"
import {socket} from "./Socket"

function Game({ userName, roomCode }) {


  const [roomData, setRoomData] = useState({});
  const history = useHistory()


  useEffect(() => {

    socket.emit('join', { userName, roomCode });
    console.log('Joined Room', roomCode)

    socket.on("updateRoom", (data) => {
      console.log('Update Room call', data)
      setRoomData({...roomData, data});
    });

    socket.on("startRound", (data) => {
      console.log('Recived startRound with redirect to', data['startPage'])
      history.push(`/wiki/${data['startPage']}`)
  
    })

  }, []);

  function handleStart(e) {
    console.log('Emitting startRound')
    socket.emit("startRound", {roomCode})

  }


  return userName === "" ? (
    <Redirect to="/" />
  ) : (
      
      <div>
        <h1>Game Page</h1>
        <h2>
          {userName} {roomCode}
        </h2>
      <Users roomData={roomData}/>
      <Chat userName={userName} roomCode={roomCode}/>
      <Settings roomData={roomData}/>
      <button onClick={handleStart}>Start Game!</button>



       
    </div>
  );
}

export default Game;
