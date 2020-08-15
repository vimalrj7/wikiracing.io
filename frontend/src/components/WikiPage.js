import React, { useState, useEffect } from "react";
import { socket } from "./Socket";
import { useParams, Redirect, Link, useHistory } from "react-router-dom";
import ReactHTMLParser, { convertNodeToElement } from "react-html-parser";
import Watch from './Watch'
import './wiki-resources/common.css'
import './wiki-resources/vector.css'

function WikiPage({ roomCode }) {


  const [pageData, setPageData] = useState({});
  const [time, setTime] = useState(0);
  let { wikiPage } = useParams();
  const history = useHistory()

  useEffect(() => {
    socket.emit("updatePage", { roomCode, wikiPage });

    socket.on("updatePage", (pageData) => {
      console.log("Received updatePage");
      setPageData(pageData);
      window.scrollTo(0, 0)
    });

    socket.on("endRound", () => {
      console.log('Receving endRound call, emitting time')
      socket.emit('updateTime', { roomCode, time })
      setTimeout(() => {history.push(`/game/${roomCode}`)}, 1000)
      
    })

    /* window.addEventListener("popstate", () => {
      history.go(1);
    }); */

  }, [wikiPage]);

  function transform(node, index) {
    if (node.type === "tag" && node.name === "a" && node.children[0] && node.attribs.title) {
        return <Link to={node.attribs.href}>{node.children[0].data}</Link>
    }
  } 

  return roomCode === "" ? (
    <Redirect to="/" />
  ) : (
    
    <div className='wiki-container'>
      <Watch time={time} setTime={setTime} />
      <div className='target-container'>Target: {pageData['target']}</div>
      <div className="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject mw-editables skin-vector action-view skin-vector-legacy minerva--history-page-action-enabled">
      <div id="content" className="mw-body-content" role="main">
        <div id="content" className="mw-body" role="main">
          <h1 id="firstHeading" className="firstHeading" lang="en">{pageData["title"]}</h1>
          <div id="bodyContent" className="mw-body-content"></div>
            <div id="siteSub" className="noprint">
              From Wikipedia, the free encyclopedia
            </div>
            <div id="contentSub"></div>
            <div
              id="mw-content-text"
              lang="en"
              dir="ltr"
              className="mw-content-ltr">
          <div>{ReactHTMLParser(pageData["html"], { transform: transform })}</div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WikiPage;
