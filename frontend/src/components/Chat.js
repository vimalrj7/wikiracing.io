import React, { useEffect, useState } from "react";
import {useForm, appendErrors} from "react-hook-form";
import {socket} from "./Socket"

function Chat({userName, roomCode}) {

    const [chatMSGS, setchatMSGS] = useState([]);
    const { register, handleSubmit, errors } = useForm();


    useEffect(() => {
        socket.on("chatMSG", (msg) => {
            setchatMSGS((prev) => [...prev, msg]);
          });
    }, [])
    

    function onChat(data) {
        socket.emit('chatMSG', {userName, roomCode, 'message': data.chatMSG})
        console.log(chatMSGS)
      }

      const msgItems = chatMSGS.map((msg) => (
      <li key={msg['message']}><b>{msg['username']}:</b> {msg['message']}</li>
          ));


  return(
      <div>
      <h1>Chat</h1>
      <ul>{msgItems}</ul>
      <form onSubmit={handleSubmit(onChat)}>
        <input 
            name="chatMSG"
            placeholder="Say hi!"
            ref={register({
                required: true})}
            />
        <button type="submit">Send!</button>
      </form>
      </div>
  )
}

export default Chat;
