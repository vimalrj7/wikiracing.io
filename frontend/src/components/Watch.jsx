import React, { useEffect } from "react";

function Watch({ time, setTime, gameOver }) {

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [gameOver]); // functional updater — no dependency on time

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rem = seconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(minutes)}:${pad(rem)}`;
  }

  return (
    <div className="wiki-timer">
      {formatTime(time)}
    </div>
  );
}

export default Watch;
