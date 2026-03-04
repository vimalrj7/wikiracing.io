import React from 'react';
import "./Users.css";

function Users({ roomData }) {
    const data = roomData['data'];
    const isRoundActive = data?.isRoundActive ?? false;

    const usersHTML = data ? Object.values(data['users'])
        .sort((a, b) => {
            // During a round: sort by clicks ascending (fewer clicks = ahead)
            // In lobby: sort by wins descending
            if (isRoundActive) return (a.clicks ?? 0) - (b.clicks ?? 0);
            return b['wins'] - a['wins'];
        })
        .map((user) => {
            const currentPage = user['current_page']?.replaceAll('_', ' ') ?? null;
            return (
                <div key={user['user_id']} className='player'>
                    <div className="emoji"><p><span role="img">{user['emoji']}</span></p></div>
                    <div className="text">
                        <p className="username">{user['username']}</p>
                        {isRoundActive && currentPage ? (
                            <p className="current-page" title={currentPage}>{currentPage}</p>
                        ) : (
                            <p className="wins">{user['wins']}<span className="tool-tip">wins</span></p>
                        )}
                    </div>
                    <div className='info-container'>
                        {isRoundActive && user['clicks'] >= 0 ? (
                            <p className="click-count">{user['clicks']} clicks</p>
                        ) : (
                            <p className="admin">{user['admin'] ? <span role="img">🛡️</span> : null}</p>
                        )}
                    </div>
                </div>
            );
        }) : null;

    return (
        <div className='users-container'>
            <h2>{isRoundActive ? 'RACING' : 'LEADERBOARD'}</h2>
            <div className='players-container'>
                {usersHTML}
            </div>
        </div>
    );
}

export default Users;
