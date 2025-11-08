import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import ChatPage from './ChatPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Mock authentication function
  const handleLogin = (username?: string, password?: string) => {
    // In a real app, you'd validate credentials
    if (username && password) {
      setIsAuthenticating(true);
      setTimeout(() => setIsAuthenticated(true), 500); // Simulate network delay and allow fade-out
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAuthenticating(false);
  }

  return (
    <div className={`h-full font-sans text-slate-100 transition-opacity duration-500 ${isAuthenticating && !isAuthenticated ? 'opacity-0' : 'opacity-100'}`}>
      {isAuthenticated ? <ChatPage onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </div>
  );
};

export default App;