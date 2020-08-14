import React, { useState, useEffect } from "react";
import { Redirect, Link, useHistory } from "react-router-dom";
import Chat from "./Chat"
import Wiki from "./WikiPage"
import Users from "./Users"
import Settings from "./Settings"
import {socket} from "./Socket"
import "./Game.css";

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

      /*<div>
      <h1 className="room-code">Room #{roomCode}</h1>
      <Users roomData={roomData}/>
      <Chat userName={userName} roomCode={roomCode}/>
      <Settings roomData={roomData}/>
      <button onClick={handleStart}>Start Game!</button>
      </div>*/

      <div className='game-wrapper'>

      <div className='grid-container grid-header'>
      <div className='heading'>
      <h1 className='room-code'>ROOM #{roomCode}</h1>
      </div>
      <div className='start-btn-container'>
      <button className='main-button' onClick={handleStart}>PLAY</button>
      </div>
      </div>
      <div className='grid-container grid-users'>
      <Users roomData={roomData}/>
      </div>
      <div className='grid-container grid-settings'>
      <Settings roomData={roomData}/>
      </div>
      <div className='grid-container grid-chat'>
      <Chat userName={userName} roomCode={roomCode}/>
      </div>

      </div>

  );

}

export default Game;
