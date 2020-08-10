import React from 'react';
import "./Users.css";


function Users({ roomData }) {
    
     const usersHTML = roomData['data'] ? Object.values(roomData['data']['users']).map((user) => {
        return (
        <div className='player'>
        <div className="emoji"><p>&#129409;</p></div>
        <div className="text">
        <p className="username">{user['username']}</p>
        <p className="wins">{user['wins']}<span className="tool-tip">wins</span></p>
        </div>
        </div>
        )
        }) : null 

    return (
        <div className='users-container'>

        <h2>LEADERBOARD</h2>
        <div className='players-container'>
            {usersHTML}
        </div>

        </div>

    )
    
}

export default Users;