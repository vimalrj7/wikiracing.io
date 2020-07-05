import React from 'react'
import './LoginPage.css'

function LoginPage() {
    return (
        <div class='wrapper'>
            <h1>WikiRacing.io</h1>
            <input placeholder='Username' label="Username" />
            <br></br>
            <input placeholder="Room Code" />
            <br></br>
            <button>
                Start new game
            </button>
            <button>
                Join exisiting game
            </button>
        </div>
    )
}




export default LoginPage;
