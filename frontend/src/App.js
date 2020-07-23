import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import Game from "./components/Game";
import WikiPage from "./components/WikiPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
    const [userName, setUserName] = useState("");
    const [roomCode, setRoomCode] = useState("");

    return (
        <Router>
            <div>
                <Switch>
                    <Route path="/game">
                        <Game userName={userName} roomCode={roomCode} />
                    </Route>

                    <Route exact path="/">
                        <LoginPage
                            userName={userName}
                            setUserName={setUserName}
                            roomCode={roomCode}
                            setRoomCode={setRoomCode}
                        />
                    </Route>

                    <Route path="/wiki/:wikiPage" children={<WikiPage roomCode={roomCode}/>} />

                </Switch>
            </div>
        </Router>
  );
}

export default App;
