import React, { useEffect, useState } from "react";
import {useForm, appendErrors} from "react-hook-form";
import {socket} from "./Socket"
import './Chat.css'

function Chat({userName, roomCode}) {

    const [chatMSGS, setchatMSGS] = useState([]);
    const { register, handleSubmit, errors, reset } = useForm();


    useEffect(() => {
        socket.on("chatMSG", (msg) => {
            setchatMSGS((prev) => [...prev, msg]);
          });
    }, [])
    

    function onChat(data, e) {
        socket.emit('chatMSG', {userName, roomCode, 'message': data.chatMSG})
        console.log(chatMSGS)
        e.target.reset()
      }

      const msgItems = chatMSGS.map((msg) => (
      <div className='msgContainer'><p key={msg['message']}><b>{msg['username']}:</b> {msg['message']}</p></div>
          ));


  return(
      <div>
      <h1>Chat</h1>
      <div className="chatContainer">
          {msgItems}
        </div>
      <form autocomplete = 'off' onSubmit={handleSubmit(onChat)}>
        <input 
            autocomplete = 'off'
            name="chatMSG"
            placeholder="Send message"
            ref={register({
                required: true})}
            />
        <button type="submit">Send</button>
      </form>
      </div>
  )
}

export default Chat;
