import React from 'react';
import { Trophy, Layers, Settings, LogOut, Calendar, User, Globe } from 'lucide-react';
import { translations } from '../data/translations';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, lang, setLang }) {
  const t = translations[lang];

  return (
    <nav style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('daily')}>
        <span style={{ fontSize: '1.75rem' }}>⚽</span>
        <div>
          <h1 className="glow-gold" style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-gold)', letterSpacing: '1px', margin: 0 }}>
            FUT 26
          </h1>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase', margin: 0 }}>
            Ultimate Team
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      {user && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('daily')}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <Calendar size={16} />
            <span>{t.dailyDraw}</span>
          </button>
          
          <button 
            className={activeTab === 'collection' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('collection')}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <Layers size={16} />
            <span>{t.collection}</span>
          </button>

          <button 
            className={activeTab === 'squad' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('squad')}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <Trophy size={16} />
            <span>{t.squadBuilder}</span>
          </button>

          <button 
            className={activeTab === 'api' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('api')}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <Settings size={16} />
            <span>{t.apiSettings}</span>
          </button>
        </div>
      )}

      {/* User Actions & Language Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Language Switcher */}
        <button 
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            transition: 'border-color var(--transition-speed) ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <Globe size={12} color="var(--accent-gold)" />
          <span>{lang === 'tr' ? 'EN' : 'TR'}</span>
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {user.username}
              </span>
            </div>

            <button 
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem',
                borderRadius: '4px',
                transition: 'background var(--transition-speed)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title={t.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
