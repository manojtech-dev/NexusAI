import { useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [authInput, setAuthInput] = useState({ username: "", password: "" });
  const [isRegister, setIsRegister] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    const endpoint = isRegister ? "/api/register" : "/api/login";
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authInput)
      });
      const data = await res.json();
      if (res.ok) {
        if (!isRegister) {
          setToken(data.token);
          setUsername(data.username);
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
        } else {
          alert("Registration successful! Please login.");
          setIsRegister(false);
        }
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (err) {
      alert("Server connection failed");
    }
  };

  const logout = () => {
    setToken("");
    setUsername("");
    localStorage.clear();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, username })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "Error connecting to AI server." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.badge}>AgentFlow AI</div>
          <h2 style={styles.authTitle}>{isRegister ? "Create Account" : "Welcome Back"}</h2>
          <p style={styles.authSubtitle}>{isRegister ? "Sign up to start chatting" : "Please sign in to continue"}</p>
          
          <input 
            style={styles.input} 
            placeholder="Username" 
            onChange={e => setAuthInput({...authInput, username: e.target.value})} 
          />
          <input 
            style={styles.input} 
            type="password" 
            placeholder="Password" 
            onChange={e => setAuthInput({...authInput, password: e.target.value})} 
          />
          
          <button style={styles.primaryButton} onClick={handleAuth}>
            {isRegister ? "Register" : "Sign In"}
          </button>
          
          <p style={styles.switchText} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <div style={styles.brandContainer}>
          <div style={styles.logoDot}></div>
          <h2 style={styles.brandTitle}>NexusAI</h2>
        </div>
        <div style={styles.userSection}>
          <span style={styles.welcomeText}>Hello, <b>{username}</b></span>
          <button style={styles.logoutButton} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={styles.chatBox}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <h3>How can I help you today?</h3>
            <p>Ask me anything about technology, coding, or college subjects.</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} style={{display: 'flex', justifyContent: m.sender === "user" ? "flex-end" : "flex-start", margin: "12px 0"}}>
            <div style={m.sender === "user" ? styles.userBubble : styles.botBubble}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display: 'flex', justifyContent: 'flex-start', margin: '12px 0'}}>
            <div style={styles.botBubble}>Thinking...</div>
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <input 
          style={styles.chatInput} 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything (e.g. Artificial Intelligence, Python)..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.sendButton} onClick={sendMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
}

const styles = {
  authContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  authCard: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '40px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    color: '#fff',
    textAlign: 'center'
  },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  authTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  authSubtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '24px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.2s'
  },
  switchText: {
    marginTop: '20px',
    color: '#818cf8',
    fontSize: '14px',
    cursor: 'pointer'
  },
  chatContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#fff',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    marginBottom: '20px'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoDot: {
    width: '12px',
    height: '12px',
    background: '#6366f1',
    borderRadius: '50%',
    boxShadow: '0 0 10px #6366f1'
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
    background: 'linear-gradient(to right, #fff, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  welcomeText: {
    fontSize: '14px',
    color: '#cbd5e1'
  },
  logoutButton: {
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  chatBox: {
    flex: 1,
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    overflowY: 'auto',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  emptyState: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#64748b',
    textAlign: 'center'
  },
  userBubble: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: '16px 16px 4px 16px',
    maxWidth: '75%',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
  },
  botBubble: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#e2e8f0',
    padding: '12px 18px',
    borderRadius: '16px 16px 16px 4px',
    maxWidth: '75%',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(12px)',
    padding: '10px 16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    alignItems: 'center'
  },
  chatInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    padding: '8px'
  },
  sendButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
  }
};

export default App;

