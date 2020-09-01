import React, { useState } from "react";
import Index from "./components/Index";
import NewGame from "./components/NewGame";
import JoinGame from "./components/JoinGame";
import Game from "./components/Game";
import WikiPage from "./components/WikiPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./Main.css";

function App() {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  return (
    <Router>
      <div>
        <Switch>
          <Route
            path="/game/:room"
            children={<Game userName={userName} roomCode={roomCode} />}
          />

          <Route exact path="/join_game">
            <JoinGame
              setUserName={setUserName}
              setRoomCode={setRoomCode}
            />
          </Route>

          <Route exact path="/new_game">
            <NewGame
              setUserName={setUserName}
              setRoomCode={setRoomCode}
            />
          </Route>

          <Route
            path="/wiki/:wikiPage"
            children={<WikiPage roomCode={roomCode} />}
          />

          <Route exact path="/">
            <Index />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
