import React from 'react';
import { Trophy, Layers, Settings, LogOut, Calendar, User, Globe, Play } from 'lucide-react';
import { translations } from '../data/translations';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, lang, setLang, coins }) {
  const t = translations[lang];

  return (
    <nav className="app-navbar" style={{
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
        <div className="nav-links" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            className={activeTab === 'match' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('match')}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <Play size={16} style={{ color: '#10b981' }} />
            <span>{t.playMatch || 'Play Match'}</span>
          </button>
          
          <button 
            className={activeTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('leaderboard')}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <Trophy size={16} style={{ color: 'var(--accent-gold)' }} />
            <span>{t.leaderboard || 'Leaderboard'}</span>
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
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(226,183,75,0.15)', padding: '0.25rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(226,183,75,0.3)', marginRight: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem' }}>🪙</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-gold)' }}>{coins}</span>
            </div>
            
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
