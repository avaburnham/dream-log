import React, { useState } from 'react';
import Login from './components/Login';
import AddDream from './components/AddDream';
import DreamList from './components/DreamList';
import AnalyzeDream from './components/AnalyzeDream';
import './App.css';

const LOGOUT_HEIGHT = 60; // px; adjust to match your button/user info height

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'analyze'>('add');

  const handleLogin = (jwt: string, userId: number, email: string) => {
    setToken(jwt);
    setUserId(userId.toString());
    setEmail(email);
    localStorage.setItem('token', jwt);
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('email', email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    setToken(null);
    setUserId(null);
    setEmail('');
  };

  const handleAdd = () => setRefresh(!refresh);

  return (
    <div className="min-vh-100 bg-purple-gradient" style={{ minHeight: '100dvh', width: '100vw' }}>
      <div className="main-content-wrapper p-3" style={{ minHeight: '100dvh' }}>
        {/* Fixed-height logout/user info area */}
        <div
          style={{
            minHeight: LOGOUT_HEIGHT,
            height: LOGOUT_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            marginBottom: '0.5rem'
          }}
        >
          {token ? (
            <>
              <button className="btn btn-outline-secondary mb-1" onClick={handleLogout}>
                Logout
              </button>
              <div className="small text-secondary">
                {email && <>Logged in as: <span className="fw-semibold">{email}</span></>}
              </div>
            </>
          ) : null}
        </div>

        {/* Dream Log header always in same spot */}
        <h1 className="display-5 fw-bold text-primary text-center mt-3 mb-4">
          Dream Log 🌙
        </h1>

        {!token ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
                  onClick={() => setActiveTab('add')}
                  type="button"
                >
                  <strong>Add Dream</strong>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                  onClick={() => setActiveTab('list')}
                  type="button"
                >
                  <strong>Dreams</strong>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'analyze' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analyze')}
                  type="button"
                >
                  <strong>Analyze Dream</strong>
                </button>
              </li>
            </ul>

            {/* Tab content */}
            <div>
              {activeTab === 'add' && <AddDream refresh={refresh} onAdd={handleAdd} />}
              {activeTab === 'list' && <DreamList refresh={refresh} />}
              {activeTab === 'analyze' && <AnalyzeDream refresh={refresh} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
