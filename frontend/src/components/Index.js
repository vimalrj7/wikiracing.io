import React from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

function Index() {
  return (
    <div className="wrapper">
      <div className="wrapper centered">
        <div className="title-container">
          <h1 className="title">wikiracing.io</h1>
        </div>

        <div className="button-container">
          <Link to="/new_game">
            <button className="home-btn main-button">START GAME</button>
          </Link>
          <Link to="/join_game">
            <button className="home-btn main-button">JOIN GAME</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Index;
