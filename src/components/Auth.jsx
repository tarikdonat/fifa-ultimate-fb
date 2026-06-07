import React, { useState } from 'react';
import { translations } from '../data/translations';
import { LogIn, UserPlus, ShieldAlert } from 'lucide-react';
import { syncSquadToOnlineDB } from '../data/onlineSync';

export default function Auth({ onLoginSuccess, lang }) {
  const t = translations[lang];
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t.errorAuth);
      return;
    }

    const users = JSON.parse(localStorage.getItem('fut_users') || '[]');

    if (isRegister) {
      // Check if user already exists
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        setError(t.errorUserExists);
        return;
      }

      const newUser = {
        username: username.trim(),
        password: password, // simple mock auth
        collection: [] // Initial empty collection
      };

      users.push(newUser);
      localStorage.setItem('fut_users', JSON.stringify(users));
      
      // Sync to online database immediately
      try {
        syncSquadToOnlineDB(newUser.username, {}, '4-3-3');
      } catch (e) {
        console.error('Failed to sync registered user online:', e);
      }
      
      // Auto log in
      localStorage.setItem('fut_active_user', JSON.stringify({ username: newUser.username }));
      onLoginSuccess(newUser);
    } else {
      // Login flow
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (!user) {
        setError(t.errorInvalidLogin);
        return;
      }

      localStorage.setItem('fut_active_user', JSON.stringify({ username: user.username }));
      onLoginSuccess(user);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 15px var(--accent-gold-glow)',
        border: '1px solid var(--accent-gold)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>🏆</span>
          <h2 className="glow-gold" style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {isRegister ? t.register : t.login}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.25rem' }}>
            FUT 2026 Ultimate Team
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '0.75rem',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.username}</label>
            <input 
              type="text" 
              className="form-input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. messi10"
              maxLength={15}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">{t.password}</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1.25rem' }}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            <span>{isRegister ? t.register : t.login}</span>
          </button>
        </form>

        {/* Toggle link */}
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span>{isRegister ? t.hasAccount : t.noAccount} </span>
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setUsername('');
              setPassword('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-gold)',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0 0.25rem'
            }}
          >
            {isRegister ? t.login : t.register}
          </button>
        </div>
      </div>
    </div>
  );
}
