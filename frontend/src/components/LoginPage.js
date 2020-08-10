import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Redirect, useHistory } from "react-router-dom";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { socket } from "./Socket";
import "./LoginPage.css";

function LoginPage({
  routeFlag,
  userName,
  setUserName,
  roomCode,
  setRoomCode,
}) {
  //animations + route + button change
  //connect to api to check room+users
  //validation functions to ensure username is unique
  //and room is 4 digit + unique
  //if not valid, stay, otherwise redirect
  //react-css-transitions

  const history = useHistory();
  const { register, handleSubmit, errors, getValues, setValue } = useForm();
  const [data, setData] = useState({});

  useEffect(() => {
    socket.emit("validateData");

    socket.on("validateData", (validateData) => {
      console.log(validateData);
      setData(validateData);
    });
  }, []);

  function generateRoom() {
    let room = Math.floor(1000 + Math.random() * 9000);
    while (room in Object.keys(data)) {
      room = Math.floor(1000 + Math.random() * 9000);
    }
    return String(room);
  }

  function onSubmit(data) {
    setUserName(data.userName);

    const roomCode = data.roomCode ? data.roomCode : generateRoom();

    setRoomCode(roomCode);
    history.push(`/game/${roomCode}`);
  }

  return (
    <div className='wrapper'>
    <Router>
      <Switch>
        <div className="wrapper centered">
          <div className="title-container">
            <h1 className="title">WikiRacing.io</h1>
          </div>

          <Route exact path="/">
            <div className="button-container">
              <Link to="/new_game">
                <button className="main-button">Start Game</button>
              </Link>
              <Link to="/join_game">
                <button className="main-button">Join Game</button>
              </Link>
            </div>
          </Route>

          <Route exact path="/new_game">
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-container">
                <input
                className="main-input"
                  autoFocus
                  placeholder="Username"
                  name="userName"
                  ref={register({
                    required: "Username is required.",
                    minLength: {
                      value: 3,
                      message: "You need at least 3 characters.",
                    },
                    maxLength: {
                      value: 20,
                      message: "You need less than 20 characters.",
                    },
                  })}

                />
                <ErrorMessage errors={errors} name="userName" as="p" />
              </div>
              <div className="button-container">
                <button className="main-button" type="submit" onClick={generateRoom}>
                  Start Game
                </button>
              </div>
            </form>
          </Route>

          <Route exact path="/join_game">
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-container">
              <input
              className="main-input"
                  autoFocus
                  placeholder="Username"
                  name="userName"
                  ref={register({
                    required: "Username is required.",
                    minLength: {
                      value: 3,
                      message: "You need at least 3 characters.",
                    },
                    maxLength: {
                      value: 20,
                      message: "You need less than 20 characters.",
                    },
                  })}
                />
                <ErrorMessage errors={errors} name="userName" as="p" />

                <input
                className="main-input"
                  placeholder="Room Code"
                  name="roomCode"
                  ref={register({
                    required: "Room Code is required.",
                    pattern: {value: /^\d{4}$/, message: 'Room Code must be a 4 digit number.'},
                    validate: (roomCode) => (Object.keys(data).includes(roomCode)) ? true : 'This room does not exist.'
                  })}
                />
                <ErrorMessage errors={errors} name="roomCode" as="p" />
              </div>

              <div className="button-container">
                <button className="main-button" type="submit">
                  Join a Game
                </button>
              </div>
            </form>
          </Route>
          <div className='footer'>
                <ul className='footer-nav'>
                  <li className='nav-item'>About</li>
                  <li className='nav-item'>How To Play</li>
                </ul>
        </div>
        </div>

      </Switch>
    </Router>
    </div>
  );
}

export default LoginPage;
