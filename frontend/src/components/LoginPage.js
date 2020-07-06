import React from 'react'
import './LoginPage.css'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function LoginPage({userName, setUserName, roomCode, setRoomCode}) {

    //animations + route + button change
    //connect to api to check room+users
    //validation functions to ensure username is unique
    //and room is 4 digit + unique
    //if not valid, stay, otherwise redirect
    //react-css-transitions
    
    
    return (
        <div class='wrapper'>
            <h1>WikiRacing.io</h1>
            <br></br>

            <Router>

            <Route path="/startnewgame">
                <div>
                    <input 
                        placeholder='Username' 
                        name='userName'
                        value={userName} 
                        onChange={e => setUserName(e.target.value)}
                    />
                </div>
            </Route>

            <Route exact path="/joingame">
                <div>
                    <input 
                        placeholder='Username' 
                        name='userName'
                        value={userName} 
                        onChange={e => setUserName(e.target.value)}
                    />
                    <br></br>
                    <input 
                        placeholder="Room Code" 
                        name="roomCode" 
                        value={roomCode} 
                        onChange={e => setRoomCode(e.target.value)}
                    />
                    <br></br>
                </div>
            </Route>


            <Link to="/startnewgame" onClick={() => setRoomCode(Math.floor(1000 + Math.random() * 9000))}>
            <button>
                Start new game
            </button>
            </Link>

            <Link to="/joingame">
            <button>
                Join exisiting game
            </button>
            </Link>

            </Router>
            
        </div>
    )
}




export default LoginPage;
