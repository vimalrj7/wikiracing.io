import React from 'react';

function Users({ roomData }) {

    console.log(roomData['users'])

    //const userItems = Object.values(roomData['users']).map((element) => (
    //   <li key={element.sid}>{element.username}</li>
    //  ));

    return (
        <div>

        <h2>Users:</h2>
        {/* <ul>{userItems}</ul> */}
        </div>

    )
    
}

export default Users;