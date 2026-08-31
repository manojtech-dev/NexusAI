import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registered successfully! Please login.');
        setIsRegistering(false);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      alert('Server connection failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setIsLoggedIn(true);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      alert('Server connection failed');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, username })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Error connecting to server.' }]);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '10px', width: '350px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <h1 style={{ textAlign: 'center', color: '#3b82f6', fontSize: '24px', marginBottom: '5px' }}>NexusAI</h1>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', color: '#94a3b8' }}>{isRegistering ? 'Create Account' : 'Login'}</h2>
          {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
            />
            <button type="submit" style={{ padding: '10px', borderRadius: '5px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', cursor: 'pointer', color: '#60a5fa' }} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '15px 20px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
        <h3 style={{ margin: 0, color: '#3b82f6' }}>NexusAI College Assistant</h3>
        <button onClick={() => setIsLoggedIn(false)} style={{ padding: '8px 15px', background: '#ef4444', border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer' }}>Logout</button>
      </header>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chatHistory.map((chat, index) => (
          <div key={index} style={{ alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start', background: chat.sender === 'user' ? '#3b82f6' : '#1e293b', padding: '10px 15px', borderRadius: '10px', maxWidth: '70%' }}>
            {chat.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '15px', background: '#1e293b', borderTop: '1px solid #334155' }}>
        <input 
          type="text" 
          placeholder="Ask about admission, exams, hostel..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          style={{ flex: 1, padding: '10px', borderRadius: '5px 0 0 5px', border: '1px solid #475569', background: '#0f172a', color: '#fff', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '0 5px 5px 0', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
      </form>
    </div>
  );
    }
    
