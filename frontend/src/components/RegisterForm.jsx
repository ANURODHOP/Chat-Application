import React, { useState } from 'react';

const RegisterForm = ({ onRegister, onSwitchToLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onRegister(username, password);
  };

  // ... (state and functions)

return (
  <div className="auth-form">
    {error && <p className="error">{error}</p>}
    <h2>Register</h2>
    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" 
      className='black'
    />
    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" 
      className='black'
    />
    <button onClick={handleSubmit}>Register</button>
    <p>Already have an account? <button onClick={onSwitchToLogin} className='white'>Login</button></p>
  </div>
);

};

export default RegisterForm;
