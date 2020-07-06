import React, { useState } from 'react';
import {Redirect} from "react-router-dom";

function Game({userName, roomCode}) {


    //connect socket.io properly
    //timer stuff
    //design the page
    //divide into components
    //work on wiki stuff

    

    return userName === '' ? <Redirect to="/"/> :
        (
        <div>
            <h1>Game Page</h1>
            <h2>{userName} {roomCode}</h2>
        </div>
    );
}



export default Game;