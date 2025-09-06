import React, { useState } from 'react';

const LoginForm = ({ onLogin, onSwitchToRegister, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onLogin(username, password);
  };

// ... (state and functions)

return (
  <div className="auth-form">
    {error && <p className="error">{error}</p>}
    <h2>Login</h2>
    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username"
    className="black"
    />
    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" 
    className='black'
    />
    <button onClick={handleSubmit} className='white'>Login</button>
    <p>New user? <button onClick={onSwitchToRegister}>Register</button></p>
  </div>
);

};

export default LoginForm;
