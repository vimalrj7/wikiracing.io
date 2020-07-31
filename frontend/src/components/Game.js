import React, { useState, useEffect } from "react";
import { Redirect, Link, useHistory } from "react-router-dom";
import Chat from "./Chat"
import Wiki from "./WikiPage"
import Users from "./Users"
//import Settings from "./Settings"
import {socket} from "./Socket"

function Game({ userName, roomCode }) {


  const [roomData, setRoomData] = useState({'user': 'none'});
  const history = useHistory()


  useEffect(() => {
    
    socket.emit('join', { userName, roomCode });
    console.log('Joined Room', roomCode)

    socket.on("updateRoom", (room_data) => {
      console.log('Update Room call', room_data)
      setRoomData(room_data);
    });

    socket.on("startRound", () => {
      console.log('Recived startRound with redirect to', roomData['start_page'])
      history.push(`/wiki/Real_Madrid_CF`)
  
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
      <button onClick={handleStart}>Start Game!</button>
      <Link to={`/wiki/${roomData['target_page']}`}>Start Game!</Link>
  <p>END PAGE: {roomData['target_page']}</p>

       
    </div>
  );
}

export default Game;
