import React from 'react';

function Users({ userData }) {

    const userItems = userData.map((element) => (
        <li key={element.sid}>{element.username}</li>
      ));

    return (
        <div>

        <h2>Users:</h2>
        <ul>{userItems}</ul>
        </div>

    )
    
}

export default Users;