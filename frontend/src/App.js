import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import Game from "./components/Game";
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
                </Switch>
            </div>
        </Router>
  );
}

export default App;
