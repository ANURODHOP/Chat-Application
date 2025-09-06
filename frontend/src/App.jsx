import './app.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ChatInterface from './components/ChatInterface';

const App = () => {
  const [view, setView] = useState('register');
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [error, setError] = useState('');

  // Auto-set to 'chat' if token exists on load
  useEffect(() => {
    if (token) {
      setView('chat');
    }
  }, [token]);

  const handleRegister = (regUsername, regPassword) => {
    setError('');
    axios.post(`${import.meta.env.BACKEND_URL}/api/register/`, { username: regUsername, password: regPassword })
      .then(res => {
        const newToken = res.data.token;
        localStorage.setItem('authToken', newToken);  // Save to localStorage
        localStorage.setItem('username', regUsername);  // Save username
        setToken(newToken);
        setUsername(regUsername);
        setView('chat');
      })
      .catch(err => setError(err.response?.data?.error || 'Registration failed'));
  };

  const handleLogin = (loginUsername, loginPassword) => {
    setError('');
    axios.post(`${import.meta.env.BACKEND_URL}/api/login/`, { username: loginUsername, password: loginPassword })
      .then(res => {
        const newToken = res.data.token;
        localStorage.setItem('authToken', newToken);  // Save to localStorage
        localStorage.setItem('username', loginUsername);  // Save username
        setToken(newToken);
        setUsername(loginUsername);
        setView('chat');
      })
      .catch(err => setError(err.response?.data?.error || 'Login failed'));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    setView('login');  // Or 'register' if preferred
  };

  return (
    <div>
      {view === 'register' && (
        <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setView('login')} error={error} />
      )}
      {view === 'login' && (
        <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setView('register')} error={error} />
      )}
      {view === 'chat' && <ChatInterface token={token} username={username} onLogout={handleLogout} />}
    </div>
  );
};

export default App;