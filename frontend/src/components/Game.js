import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import Chat from "./Chat"
import {socket} from "./Socket"

function Game({ userName, roomCode }) {
  //connect socket.io properly
  //timer stuff
  //design the page
  //divide into components
  //work on wiki stuff

  

  const [users, setUsers] = useState([]);
  

  useEffect(() => {
    
    socket.emit("join", { userName, roomCode });
    socket.on("updateUsers", (userlist) => {
      console.log(Object.values(userlist))
      setUsers(Object.values(userlist));
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  const userItems = users.map((element) => (
    <li key={element.sid}>{element.username}</li>
  ));

  return userName === "" ? (
    <Redirect to="/" />
  ) : (
    <div>
      <h1>Game Page</h1>
      <h2>
        {userName} {roomCode}
      </h2>
      <h2>Users:</h2>
      <ul>{userItems}</ul>
      <Chat />
      
    </div>
  );
}

export default Game;
