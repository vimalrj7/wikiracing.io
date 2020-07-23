import React, { useState, useEffect } from "react";
import { Redirect, Link } from "react-router-dom";
import Chat from "./Chat"
import Wiki from "./WikiPage"
import Users from "./Users"
//import Settings from "./Settings"
import {socket} from "./Socket"

function Game({ userName, roomCode }) {


  const [roomData, setRoomData] = useState({});
  

  useEffect(() => {
    
    console.log('Mounted')
    socket.emit('join', { userName, roomCode });
    //socket.emit('updateRoom', {roomCode});

    socket.on("updateRoom", (room_data) => {
      console.log(room_data)
      setRoomData(room_data);
    });

  }, []);




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
      <Link to="/wiki/Soup">Start Page</Link>

       
    </div>
  );
}

export default Game;
