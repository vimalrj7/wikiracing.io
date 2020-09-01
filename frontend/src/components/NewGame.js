import React from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useHistory } from "react-router-dom";
import "./LoginPage.css";

function NewGame({ setUserName, setRoomCode }) {
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm();

  function onSubmit(data) {
    setUserName(data.userName);

    //generate a new, unique room code and go to new room
    fetch("http://localhost:5000/validation_data")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let room = Math.floor(1000 + Math.random() * 9000);
        while (room in Object.keys(data)) {
          room = Math.floor(1000 + Math.random() * 9000);
        }
        setRoomCode(String(room))
        history.push(`/game/${room}`);
      });

  }

  return (
    <div className="wrapper">
      <div className="wrapper centered">
        <div className="title-container">
          <h1 className="title">wikiracing.io</h1>
        </div>

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
                  value: 15,
                  message: "You need less than 15 characters.",
                },
              })}
            />
            <ErrorMessage errors={errors} name="userName" as="p" />
          </div>
          <div className="button-container">
            <button className="home-btn main-button" type="submit">
              START GAME
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default NewGame;
