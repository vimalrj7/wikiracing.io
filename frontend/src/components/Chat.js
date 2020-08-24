import React, { useEffect, useState } from "react";
import {useForm} from "react-hook-form";
import {socket} from "./Socket"
import './Chat.css'
import ReactHTMLParser from "react-html-parser";
import Send from '@material-ui/icons/Send';

function Chat({userName, roomCode}) {

    const [chatMSGS, setchatMSGS] = useState([]);
    const { register, handleSubmit } = useForm();


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
      <div className='message'><p key={msg['message']}><span>{ReactHTMLParser(msg['emoji'])}</span> <b>{msg['username']}:</b> {ReactHTMLParser(msg['message'])}</p></div>
          ));


  return(
      <div className='chat-container'>
      <h2>CHAT</h2>
      <div className="messages-container">
          {msgItems}
      </div>
      <div className="chat-form-container">
      <form onSubmit={handleSubmit(onChat)}>
        <input 
            autoComplete='off'
            name="chatMSG"
            placeholder="Send message"
            ref={register({
                required: true})}
            />
        <button type="submit"><Send/></button>
      </form>
      </div>
      </div>
  )
}

export default Chat;
