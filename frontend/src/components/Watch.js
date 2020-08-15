import React, { useEffect, useState } from "react";

function Watch( { time, setTime, gameOver } ) {
  
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
    let interval = null;
    if (!gameOver){
    interval = setInterval(() => {
        updateTime();
    }, 1000);
    } else if (gameOver && time !== 0){
      clearInterval(interval)
    }
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
