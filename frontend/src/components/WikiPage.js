import React, { useState, useEffect } from 'react';
import { socket } from './Socket';
import { useParams, Redirect } from "react-router-dom";

function WikiPage({roomCode}) {

    const [pageData, setPageData] = useState({});
    let { wikiPage } = useParams();
    console.log(wikiPage)
    console.log(roomCode)

    
  useEffect(() => {

    socket.emit('getWikiPage', { wikiPage })
    console.log(wikiPage)

    socket.on('wikiPage', (wikiPage) => {
        console.log(wikiPage)
        setPageData(wikiPage)
    })

    socket.emit('updateGame', {roomCode})
    console.log(roomCode)

  }, []);
    
  return roomCode === "" ? (
    <Redirect to="/" />
  ) : (
        <div>
            <div dangerouslySetInnerHTML={{ __html: pageData['html'] }} />
        </div>
    )
    
}

export default WikiPage;