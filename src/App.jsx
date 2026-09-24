import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if session token exists in localStorage
    const savedToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setAdminUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse cached admin user', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = (user, authToken) => {
    setAdminUser(user);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setToken(null);
  };

  if (isInitializing) {
    return (
      <div className="login-wrapper">
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>
          Loading Admin Panel...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {token && adminUser ? (
        <Dashboard adminUser={adminUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
