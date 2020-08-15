import React, { useEffect, useState } from "react";
import './Watch.css'

function Watch( { time, setTime } ) {
  
    function updateTime() {
        setTime((time) => time + 1);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds/60)
        const rem_seconds = seconds % 60;

        function str_pad_left(string,pad,length) {
            return (new Array(length+1).join(pad)+string).slice(-length);
        }

        return str_pad_left(minutes,'0',2)+':'+str_pad_left(rem_seconds,'0',2)

    }

  useEffect(() => {
    console.log('time:', time)
    let interval = null;
    interval = setInterval(() => {
        updateTime();
    }, 1000);

    return () => {
        clearInterval(interval)
    };
  }, [time]);

  return (
    <div className="timer-container">
    {formatTime(time)}
    </div>
  );
}

export default Watch;
