import React, { useState, useEffect } from "react";
import { socket } from "./Socket";
import { useParams, Redirect, Link, useHistory } from "react-router-dom";
import ReactHTMLParser, { convertNodeToElement } from "react-html-parser";

function WikiPage({ roomCode }) {


  const [pageData, setPageData] = useState({});
  let { wikiPage } = useParams();
  const history = useHistory()

  useEffect(() => {
    console.log("Parameter: ", wikiPage);
    socket.emit("updatePage", { roomCode, wikiPage });

    socket.on("updatePage", (pageData) => {
      console.log("Received updatePage");
      setPageData(pageData);
      window.scrollTo(0, 0)
    });

    socket.on("endRound", () => {
      console.log('Receving endRound call')
      setTimeout(() => {history.push('/game')}, 2000)
      
    })


  }, [wikiPage]);

  function transform(node, index) {
    if (node.type === "tag" && node.name === "a" && node.children[0] && node.attribs.title) {
        return <Link to={node.attribs.href}>{node.children[0].data}</Link>
    }
  } 

  return roomCode === "" ? (
    <Redirect to="/" />
  ) : (
    <div>
      <div>{ReactHTMLParser(pageData["html"], { transform: transform })}</div>
    </div>
  );
}

export default WikiPage;
