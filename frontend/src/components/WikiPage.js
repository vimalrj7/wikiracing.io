import React, { useState, useEffect } from "react";
import { socket } from "./Socket";
import { useParams, Redirect, Link, useHistory } from "react-router-dom";
import ReactHTMLParser, { convertNodeToElement } from "react-html-parser";
import Watch from "./Watch";
import "./wiki-resources/common.css";
import "./wiki-resources/vector.css";
import "./WikiPage.css";

function WikiPage({ roomCode }) {
  const [pageData, setPageData] = useState({});
  const [time, setTime] = useState(0);
  const [winner, setWinner] = useState({});
  const [gameOver, setGameOver] = useState(false);
  let { wikiPage } = useParams();
  const history = useHistory();

  useEffect(() => {
    socket.emit("updatePage", { roomCode, wikiPage });

    socket.on("updatePage", (pageData) => {
      console.log("Received updatePage");
      setPageData(pageData);
      window.scrollTo(0, 0);
    });

    socket.on("endRound", (winnerData) => {
      console.log("Receving endRound call, emitting time");
      setGameOver(true);
      setWinner(winnerData);
      socket.emit("updateTime", { roomCode, time: time + 1 });
      /* let navigateHome = setTimeout(() => {
        history.push(`/game/${roomCode}`);
      }, 5000); */
    });

    window.addEventListener("popstate", () => {
      history.go(1);
    });
  }, [wikiPage]);

  function transform(node, index) {
    if (
      node.type === "tag" &&
      node.name === "a" &&
      node.children[0] &&
      node.attribs.title
    ) {
      return <Link to={node.attribs.href}>{node.children[0].data}</Link>;
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds/60)
    const rem_seconds = seconds % 60;

    function str_pad_left(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    }

    return str_pad_left(minutes,'0',2)+':'+str_pad_left(rem_seconds,'0',2)
  }


  return roomCode === "" ? (
    <Redirect to="/" />
  ) : (
    <div className="wiki-container">
      {gameOver ? (
        <div className="winner-overlay">
          <h1 className="winner-name">&#127942;{winner["username"]} won!</h1>
          <p className="winner-time"><b>&#128336;Time</b>	{formatTime(time)}</p>
          <p className="winner-clicks"><b>&#128433;Clicks</b> {winner["clicks"]}</p>
        </div>
      ) : null}

      <Watch time={time} setTime={setTime} gameOver={gameOver} />
      <div className="target-container">Target: {pageData["target"]}</div>
      <div className="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject mw-editables skin-vector action-view skin-vector-legacy minerva--history-page-action-enabled">
        <div id="content" className="mw-body-content" role="main">
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
                {ReactHTMLParser(pageData["html"], { transform: transform })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WikiPage;
