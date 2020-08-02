import React from 'react';


function Users({ roomData }) {
    
    const usersHTML = roomData['data'] ? Object.values(roomData['data']['users']).map((user) => {
        return <li key={user['username']}>{user['username']} <i>(wins: {user['wins']}</i>)</li>
        }) : null

    return (
        <div>

        <h2>Users:</h2>
        <ul>
            {usersHTML}
        </ul>

        </div>

    )
    
}

export default Users;