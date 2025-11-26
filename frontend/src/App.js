import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import KpiDetail from './components/KpiDetail';
import ObjectiveEditor from './components/ObjectiveEditor';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const onLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    navigate('/dashboard');
  };

  const onLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (!token) navigate('/login');
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
  <Route path="/dashboard" element={token ? <Dashboard token={token} onLogout={onLogout} /> : <Navigate to="/login" />} />
  <Route path="/kpi/:id" element={token ? <KpiDetail token={token} /> : <Navigate to="/login" />} />
  <Route path="/objectives/new" element={token ? <ObjectiveEditor /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;
