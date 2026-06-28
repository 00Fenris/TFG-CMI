import React, { useState } from 'react';
import api from '../lib/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const quickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    await performLogin(quickEmail, quickPassword);
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      onLogin(res.data.token);
    } catch (err) {
      console.error('Login error', err);
      const msg = err?.response?.data?.message || err?.message || 'Error de autenticación';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.3s ease'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '60px', height: '60px', 
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            borderRadius: '16px', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)'
          }}>
            🍕
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Grupo HORECA Demo</h2>
          <p style={{ color: '#94a3b8', margin: '8px 0 0 0', fontSize: '14px' }}>Cuadro de Mando Integral</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
              Correo Electrónico
            </label>
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="tu@correo.com"
              style={{ 
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff', fontSize: '15px',
                outline: 'none', transition: 'border-color 0.2s'
              }} 
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ 
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff', fontSize: '15px',
                outline: 'none', transition: 'border-color 0.2s'
              }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition: 'transform 0.1s, boxShadow 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Accediendo...' : 'Acceder al Sistema'}
          </button>

          {error && (
            <div style={{ 
              marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px',
              color: '#f87171', fontSize: '13px', textAlign: 'center' 
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Acceso Rápido Demo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => quickLogin('admin@demo.local', 'password')}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', padding: '10px', borderRadius: '8px', fontSize: '13px',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                👑 Director General (Global)
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => quickLogin('manager.a@demo.local', 'password')}
                  style={{
                    flex: 1, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#34d399', padding: '10px', borderRadius: '8px', fontSize: '13px',
                    cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                >
                  📍 Salamanca
                </button>
                <button 
                  type="button" 
                  onClick={() => quickLogin('manager.b@demo.local', 'password')}
                  style={{
                    flex: 1, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#34d399', padding: '10px', borderRadius: '8px', fontSize: '13px',
                    cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                >
                  📍 Zamora
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
