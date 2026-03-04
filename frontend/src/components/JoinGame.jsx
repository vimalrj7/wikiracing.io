import React from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useNavigate } from "react-router-dom";
import { backend_url } from "./Socket";
import "./LoginPage.css";

function JoinGame({ setUserName, setRoomCode }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  async function onSubmit(data) {
    setUserName(data.userName);
    const roomCode = data.roomCode;
    setRoomCode(String(roomCode));
    navigate(`/game/${roomCode}`);
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
              {...register("userName", {
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
              {...register("roomCode", {
                required: "Room Code is required.",
                pattern: {
                  value: /^\d{4}$/,
                  message: "Room Code must be a 4 digit number.",
                },
                validate: async (roomCode) => {
                  const res = await fetch(`${backend_url}rooms/${roomCode}/exists`);
                  const { exists } = await res.json();
                  if (!exists) return "This room does not exist.";
                  return true;
                },
              })}
            />
            <ErrorMessage errors={errors} name="roomCode" as="p" />
          </div>

          <div className="button-container">
            <button className="home-btn main-button" type="submit">
              JOIN GAME
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinGame;
