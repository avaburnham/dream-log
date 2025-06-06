import React, { useState } from 'react';
import Login from './components/Login';
import AddDream from './components/AddDream';
import DreamList from './components/DreamList';
import AnalyzeDream from './components/AnalyzeDream';

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

  if (!token) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div
          className="container p-4 bg-white rounded-4 shadow"
          style={{
            margin: 50,
            width: 'calc(100vw - 100px)',
            height: 'calc(100vh - 100px)',
            maxWidth: 1000,
            minWidth: 300,
            overflow: 'auto',
          }}
        >
          <h1 className="display-5 fw-bold text-primary text-center mb-4">
            Dream Log 🌙
          </h1>
          <Login onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div
        className="container p-4 bg-white rounded-4 shadow"
        style={{
          margin: 50,
          width: 'calc(100vw - 100px)',
          height: 'calc(100vh - 100px)',
          maxWidth: 1000,
          minWidth: 300,
          overflow: 'auto',
        }}
      >
        {/* Header: Title and Logout Button */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h1 className="display-5 fw-bold text-primary text-center m-0">
            Dream Log 🌙
          </h1>
          <div className="text-end">
            <button className="btn btn-outline-secondary mb-1" onClick={handleLogout}>
              Logout
            </button>
            <div className="small text-secondary">
              {email && <>Logged in as: <span className="fw-semibold">{email}</span></>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
              type="button"
            >
              Add Dream
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
              type="button"
            >
              Dreams
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'analyze' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyze')}
              type="button"
            >
              Analyze Dream
            </button>
          </li>
        </ul>

        {/* Tab content */}
        <div>
          {activeTab === 'add' && <AddDream refresh={refresh} onAdd={handleAdd} />}
          {activeTab === 'list' && <DreamList refresh={refresh} />}
          {activeTab === 'analyze' && <AnalyzeDream refresh={refresh} />}
        </div>
      </div>
    </div>
  );
};

export default App;
