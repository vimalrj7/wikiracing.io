import React, { useState, useEffect } from "react";
import { Redirect, Link } from "react-router-dom";
import Chat from "./Chat"
import Wiki from "./WikiPage"
import Users from "./Users"
//import Settings from "./Settings"
import {socket} from "./Socket"

function Game({ userName, roomCode }) {
  //connect socket.io properly
  //design the page
  //divide into components
  //work on wiki stuff

  

  const [userData, setUserData] = useState([]);
  const [gameData, setGameData] = useState({});
  

  useEffect(() => {
    
    console.log('Mounted')
    socket.emit('join', { userName, roomCode });
    socket.emit('updateGame', {roomCode});

    socket.on("updateUsers", (userlist) => {
      console.log(Object.values(userlist))
      setUserData(Object.values(userlist));
    });

    socket.on("updateGame", (gamedata) => {
      console.log(gamedata)
      setGameData(gamedata);
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
      <Users userData={userData}/>
      <Chat/>
      <Link to="/wiki/Soup">Start Page</Link>

       
    </div>
  );
}

export default Game;
