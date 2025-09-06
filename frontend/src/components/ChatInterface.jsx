import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './UserList';

const ChatInterface = ({ token, username, onLogout }) => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState(null);

  // Fetch users on mount
  useEffect(() => {
    if (token) {
      axios.get(`${import.meta.env.BACKEND_URL}/api/users/`, {
        headers: { 'Authorization': `Token ${token}` }
      }).then(res => setUsers(res.data))
        .catch(err => console.error('Failed to fetch users:', err));
    }
  }, [token]);

  // Set up WebSocket
  useEffect(() => {
    if (token) {
      const websocket = new WebSocket(`ws://${import.meta.env.BACKEND_URL}/ws/chat/?token=${token}`);

      websocket.onopen = () => {
        console.log('WebSocket connected');
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket data:', data);  // Debug: See incoming messages
        if (data.type === 'chat_message') {
          setMessages(prev => [...prev, data]);
        } else if (data.type === 'notification') {
          alert(data.message);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    }
  }, [token]);

  // Fetch historical messages when receiverId changes
  useEffect(() => {
    if (token && receiverId) {
      axios.get(`${import.meta.env.BACKEND_URL}/api/messages/?receiver=${receiverId}`, {
        headers: { 'Authorization': `Token ${token}` }
      }).then(res => {
        console.log('Fetched messages:', res.data);  // Debug: Check data structure here
        setMessages(res.data);
      })
        .catch(err => console.error('Failed to fetch messages:', err));
    } else {
      setMessages([]);
    }
  }, [receiverId, token]);

  const sendMessage = (e) => {
    if (e) e.preventDefault();  // Prevent form reload
    if (!ws || !receiverId || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not ready for sending');
      return;
    }
    if (!message && !photo) return;

    if (photo) {
      const formData = new FormData();
      formData.append('photo', photo);

      axios.post(`${import.meta.env.BACKEND_URL}/api/upload-photo/`, formData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      }).then(res => {
        const relativePath = res.data.url.replace('/media/', '');
        ws.send(JSON.stringify({
          message,
          photo: relativePath,
          receiver_id: receiverId
        }));
        console.log('Message with photo sent');  // Debug
        setMessage('');
        setPhoto(null);
      }).catch(err => {
        console.error('Photo upload failed:', err);
        alert('Failed to upload photo');
      });
    } else {
      ws.send(JSON.stringify({
        message,
        receiver_id: receiverId
      }));
      console.log('Text message sent');  // Debug
      setMessage('');
    }
  };


  //Format Date as required
  function formatDateRelative(dateString) {
    const date = new Date(dateString);
    const today = new Date();

    // Remove time for comparison
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = (targetDateOnly - todayDateOnly) / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      return "today";
    } else if (diffDays === 1) {
      return "tomorrow";
    } else if (diffDays === -1) {
      return "yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    }
  }

  return (
    <>
      <center><h2>Welcome, {username}!</h2></center>
      <div className="chat-container">
        <UserList users={users} onSelectUser={setReceiverId} activeReceiverId={receiverId} />
        <div className="chat-area">
          {receiverId ? (
            <>
              <div className="chat-header">
                <span className="back-btn" onClick={() => setReceiverId(null)}>&larr;</span>
                <div className="avatar"></div>
                <div className="user-info">
                  <div className="name">{users.find(u => u.id === receiverId)?.username || receiverId}</div>
                  <div className="status">Active now</div>
                </div>
                <div className="icons">
                  {/* Icons as before */}
                </div>
              </div>
              <div className="message-list">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message ${msg.sender === username ? 'sent' : 'received'}`}
                  >
                    <div className="text">{msg.message || msg.content || '(No content)'}</div>
                    {msg.photo && <img src={`${msg.photo}`} alt="chat photo" className='chat-photo'/>}
                    <div className="timestamp">{formatDateRelative(msg.timestamp)}</div>
                  </div>
                ))}
              </div>
              <form className="input-area" onSubmit={sendMessage}>
                <span className="icon">&#x1F600;</span>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Message..."
                />
                <label className="icon">&#x1F4F7; <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} hidden /></label>
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <h2>Select a chat</h2>
          )}
        </div>
        <div>
        </div>
      </div>
      <button className="logout-btn" onClick={onLogout}>Logout</button>

    </>
  );
};

export default ChatInterface;
