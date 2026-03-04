import React, { useState, useEffect, useRef } from "react";
import { socket } from "./Socket";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import parse, { domToReact } from 'html-react-parser';
import Watch from "./Watch";
import "./WikiPage.css";


function WikiPage({ roomCode }) {
  const [pageData, setPageData] = useState({});
  const [userData, setUserData] = useState({});
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);   // mirrors time state; avoids stale closure in endRound
  const [winner, setWinner] = useState({});
  const [gameOver, setGameOver] = useState(false);
  let { wikiPage } = useParams();
  const navigate = useNavigate();

  // Keep timeRef in sync so endRound always sees the current elapsed time
  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${wikiPage}`);
        const data = await response.text();
        setPageData({
          title: wikiPage.replaceAll("_", " "),
          html: data
        });
        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error);
      }
    }

    fetchPageData();

    const onUpdatePage = (data) => {
      console.log(data);
      setUserData(data);
    };

    const onEndRound = (winnerData) => {
      console.log("Receving endRound call, emitting time");
      setGameOver(true);
      setWinner(winnerData);
      // Use timeRef.current — time state is stale in this closure
      socket.emit("updateTime", { roomCode, time: timeRef.current });
    };

    // Block back button: navigate forward instead
    const onPopstate = () => navigate(1);

    socket.on("updatePage", onUpdatePage);
    socket.emit("updatePage", { roomCode, wikiPage });
    socket.on("endRound", onEndRound);
    window.addEventListener("popstate", onPopstate);

    return () => {
      window.removeEventListener("popstate", onPopstate);
      socket.off("updatePage", onUpdatePage);
      socket.off("endRound", onEndRound);
    };

  }, [wikiPage]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds/60)
    const rem_seconds = seconds % 60;

    function str_pad_left(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    }

    return str_pad_left(minutes,'0',2)+':'+str_pad_left(rem_seconds,'0',2)
  }

  // html-react-parser options — defined here so domToReact can reference options recursively
  const options = {
    replace: node => {
      if (node.type !== "tag") return;

      // Wikipedia sends a full HTML document — drop <head>, unwrap <html>/<body>
      if (node.name === "head") return <></>;
      if (node.name === "html" || node.name === "body") {
        return <>{domToReact(node.children, options)}</>;
      }

      // Internal wiki links → React Router Link
      // Use domToReact for children to handle nested elements (fixes <a><span> crash)
      if (node.name === "a" && node.attribs.title) {
        return (
          <Link to={`/wiki/${node.attribs.href?.slice(2)}`}>
            {domToReact(node.children, options)}
          </Link>
        );
      }

      // External links → strip interactivity, render as plain text span
      if (node.name === "a" && node.attribs.class === "external text") {
        return <span>{domToReact(node.children, options)}</span>;
      }

      // Clear base href (Wikipedia relative URL anchor)
      if (node.name === "base") {
        node.attribs.href = "";
      }

      // Prefix relative stylesheet hrefs with Wikipedia CDN
      if (node.name === "link" && node.attribs.rel === "stylesheet") {
        node.attribs.href = `//en.wikipedia.org/${node.attribs.href}`;
      }
    }
  };

  return roomCode === "" ? (
    <Navigate to="/" />
  ) : (
    <div className="wiki-container">
      {gameOver ? (
        <div className="winner-overlay">
          <h1 className="winner-name">&#127942;{winner["username"]} won!</h1>
          <p className="winner-time"><b>&#128336; Time</b>	{formatTime(time)}</p>
          <p className="winner-clicks"><b>&#128433;&#65039; Clicks</b> {winner["clicks"]}</p>
          <Link to={`/game/${roomCode}`}><button className="overlay-btn">CONTINUE</button></Link>
        </div>
      ) : null}

      <div className="stats-container">
        <Watch time={time} setTime={setTime} gameOver={gameOver} />
        <div className="target-container">Target: {userData["target"]}</div>
      </div>

      <div className="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject mw-editables skin-vector action-view skin-vector-legacy minerva--history-page-action-enabled">
        <div id="content" className="mw-body-content background" role="main">
          <div id="content" className="mw-body" role="main">
            <h1 id="firstHeading" className="firstHeading" lang="en">
              {pageData["title"]}
            </h1>

            <div id="bodyContent" className="mw-body-content"></div>
            <div id="siteSub" className="noprint">
              From Wikipedia, the free encyclopedia
            </div>
            <div id="contentSub"></div>
            <div
              id="mw-content-text"
              lang="en"
              dir="ltr"
              className="mw-content-ltr"
            >
              <div>
                {parse(String(pageData["html"]), options)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WikiPage;
