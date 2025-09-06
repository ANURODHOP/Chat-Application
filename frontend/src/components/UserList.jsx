import React from 'react';

const UserList = ({ users, onSelectUser, activeReceiverId }) => {
  // ... (imports)

return (
  <div className="user-list">
    <h3>Direct</h3>  {/* Instagram-like header */}
    <ul>
      {users.map(user => (
        <li
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          className={user.id === activeReceiverId ? 'active' : ''}
        >
          <div className="avatar">
            <img src="https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png" alt="Profile" />  
          </div>  {/* Placeholder; add <img src={user.avatar} /> if available */}
          <div className="user-info">
            <div className="name">{user.username}</div>
            <div className="last-message">Active now</div>  {/* Placeholder; fetch real last message if needed */}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

};

export default UserList;
