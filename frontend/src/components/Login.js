import React, { useState } from 'react';
import api from '../lib/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@claunafood.local');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      // Debug log to help troubleshoot failing requests
      // eslint-disable-next-line no-console
      console.log('Attempting login', { email, password }, 'API base:', (api.defaults || {}).baseURL);
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data.token);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Login error', err);
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      setError(msg + (err?.response?.status ? ` (status ${err.response.status})` : ''));
    }
  };

  const quickLogin = async (email, password) => {
    setError(null);
    try {
      // eslint-disable-next-line no-console
      console.log('Quick login', { email }, 'API base:', (api.defaults || {}).baseURL);
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data.token);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Quick login error', err);
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      setError(msg + (err?.response?.status ? ` (status ${err.response.status})` : ''));
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
        </div>
        <button type="submit">Login</button>
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={() => quickLogin('admin@claunafood.local', 'password')}>Login as Admin</button>
          <button type="button" onClick={() => quickLogin('manager.salamanca@claunafood.local', 'password')} style={{ marginLeft: 8 }}>Login as Manager (Ditaly)</button>
          <button type="button" onClick={() => quickLogin('manager.zamora@claunafood.local', 'password')} style={{ marginLeft: 8 }}>Login as Manager (LaRuqa)</button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
}
