import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import {useForm, appendErrors} from "react-hook-form";
import { Redirect, useHistory } from "react-router-dom";

function LoginPage({ userName, setUserName, roomCode, setRoomCode }) {
  //animations + route + button change
  //connect to api to check room+users
  //validation functions to ensure username is unique
  //and room is 4 digit + unique
  //if not valid, stay, otherwise redirect
  //react-css-transitions

  const history = useHistory()
  const { register, handleSubmit, errors } = useForm()
  const [data, setData] = useState({});

  useEffect(() => {
    fetch('http://127.0.0.1:5000/data').then(res => res.json()).then(data => {
      console.log(data)
      setData(data)
    });
  }, []);


  function onSubmit(data) {
    console.log('submitted')
    setUserName(data.userName)
    setRoomCode(data.roomCode)
    history.push('/game')
    
  }

  return (
    <div className="wrapper">
      <h1>WikiRacing.io</h1>
      <br></br>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            ref={register({
                required: true,
                minLength: 3,
                maxLength: 20,
                validate: (input) => input !== 'bob',
            })}
            placeholder= {errors.userName ? 'Error!': "Username"}
            name="userName"
            className = {errors.userName ? 'error': null}
          />

          <br></br>

          <input
            ref={register({
                pattern: /^\d{4}$/
            })}
            placeholder="Room Code"
            name="roomCode"
            className = {errors.roomCode ? 'error': null}
          />

          <br></br>
          <button type='submit'>Start new game</button>
          <button type='submit'>Join exisiting game</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
