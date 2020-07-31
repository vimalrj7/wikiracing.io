import React, { useState, useEffect } from "react";
import { socket } from "./Socket";
import { useParams, Redirect, Link } from "react-router-dom";
import ReactHTMLParser, { convertNodeToElement } from "react-html-parser";

function WikiPage({ roomCode }) {


  const [pageData, setPageData] = useState({});
  let { wikiPage } = useParams();

  useEffect(() => {
    console.log("Parameter: ", wikiPage);
    socket.emit("updatePage", { roomCode, wikiPage });

    socket.on("updatePage", (pageData) => {
      console.log("Recived updatePage");
      setPageData(pageData);
    });
  }, [wikiPage]);

  function transform(node, index) {
    if (node.type === "tag" && node.name === "a") {
      let text = node.children[0] ? node.children[0].data : 'NOT FOUND'
    return <Link to={node.attribs.href}>{text}</Link>

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
