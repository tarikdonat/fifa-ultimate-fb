import React, { useState, useEffect } from 'react';
import PlayerCard from './PlayerCard';
import { translations } from '../data/translations';
import { Sparkles, Clock, RefreshCw } from 'lucide-react';
import fallbackPlayers from '../data/fallbackPlayers.json';

export default function DailyPack({ user, onCardsDrawn, lang }) {
  const t = translations[lang];
  
  const [canDraw, setCanDraw] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [drawnCards, setDrawnCards] = useState([]);
  
  // Cooldown is 24 hours (86400000 ms)
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const checkCooldown = () => {
    setCanDraw(true);
    setTimeRemaining('');
  };

  const handleOpenPack = () => {
    if (!canDraw || isOpening) return;
    
    setIsOpening(true);
    setShaking(true);
    
    // Step 1: Shake pack for 1.5s
    setTimeout(() => {
      setShaking(false);
      setShowExplosion(true);
      
      // Step 2: Draw cards and trigger reveal
      drawThreeCards();
    }, 1500);

    // Step 3: Clear explosion flash
    setTimeout(() => {
      setShowExplosion(false);
    }, 2500);
  };

  const drawThreeCards = () => {
    // Combine fallback players and any custom players added by this user
    const customPlayers = JSON.parse(localStorage.getItem(`custom_players_${user.username.toLowerCase()}`) || '[]');
    const pool = [...fallbackPlayers, ...customPlayers];

    // Probability weights for draw: Icon (10%), TOTY (20%), Gold (70%)
    const selectRandomRarity = () => {
      const rand = Math.random() * 100;
      if (rand < 10) return 'icon';
      if (rand < 30) return 'toty';
      return 'gold';
    };

    const drawn = [];
    // Helper to select player matching a rarity or fallback to any if pool for that rarity is empty
    const pickPlayerForRarity = (targetRarity) => {
      let subPool = pool.filter(p => p.rarity.toLowerCase() === targetRarity.toLowerCase());
      if (subPool.length === 0) {
        subPool = pool; // Fallback to entire pool
      }
      const index = Math.floor(Math.random() * subPool.length);
      return subPool[index];
    };

    for (let i = 0; i < 3; i++) {
      const rarity = selectRandomRarity();
      let picked = pickPlayerForRarity(rarity);
      
      // Try to avoid duplicates in the same pack draw
      let attempts = 0;
      while (drawn.some(p => p.id === picked.id) && attempts < 10) {
        picked = pickPlayerForRarity(rarity);
        attempts++;
      }
      drawn.push(picked);
    }

    setDrawnCards(drawn);

    // Persist to user's collection in localStorage
    const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    
    if (userIndex !== -1) {
      const activeCollection = users[userIndex].collection || [];
      // Add drawn players, keeping count if duplicate (or just adding them as unique instances)
      // We'll give each unique collection item a unique instance ID so the user can collect duplicates!
      const updatedCollection = [...activeCollection];
      drawn.forEach(player => {
        updatedCollection.push({
          ...player,
          instanceId: `${player.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        });
      });
      
      users[userIndex].collection = updatedCollection;
      localStorage.setItem('fut_users', JSON.stringify(users));
      
      // Update last draw time (disabled for testing)
      // const drawTime = Date.now();
      // localStorage.setItem(`last_draw_${user.username.toLowerCase()}`, String(drawTime));
      
      // Propagate collection changes to parent App
      onCardsDrawn(updatedCollection);
    }
  };

  const resetDrawnState = () => {
    setIsOpening(false);
    setDrawnCards([]);
    checkCooldown();
  };

  // Helper for testing so the user doesn't have to wait 24h
  const devResetTimer = () => {
    localStorage.removeItem(`last_draw_${user.username.toLowerCase()}`);
    setCanDraw(true);
    setTimeRemaining('');
    setDrawnCards([]);
    setIsOpening(false);
  };

  return (
    <div className="pack-container">
      {/* Dev Mode Timer Override */}
      <button 
        onClick={devResetTimer}
        style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '4px',
          padding: '0.25rem 0.5rem',
          fontSize: '0.7rem',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          zIndex: 10
        }}
      >
        <RefreshCw size={10} />
        <span>Dev: Reset Timer</span>
      </button>

      {!isOpening && drawnCards.length === 0 && (
        <div style={{ textAlign: 'center', maxWidth: '450px', width: '100%' }}>
          <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            {t.dailyDraw}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
            {t.claimThreeCards}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div className="pack-wrapper">
              <button 
                className={`pack-button-card ${shaking ? 'pack-shaking' : ''}`}
                onClick={handleOpenPack}
                disabled={!canDraw}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <div className="pack-logo-glow">🎒</div>
                <h3 style={{ color: 'var(--accent-gold)', fontWeight: '900', letterSpacing: '2px', fontSize: '1.25rem' }}>
                  GOLD PACK
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Sparkles size={12} color="var(--accent-gold)" />
                  <span>3 RARE CARDS</span>
                </div>
              </button>
            </div>
          </div>

          {!canDraw && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                <Clock size={16} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  {t.nextDrawIn}
                </span>
              </div>
              <span className="glow-gold" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                {timeRemaining}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Opening Animations Overlay */}
      {isOpening && drawnCards.length === 0 && (
        <div className="pack-opening-overlay">
          {showExplosion && <div className="pack-explosion-glow"></div>}
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <div style={{ fontSize: '4rem', animation: 'spin 1.5s ease-in-out infinite' }}>⚽</div>
            <h2 className="glow-gold" style={{ color: 'var(--accent-gold)', fontWeight: '900', fontSize: '1.75rem', marginTop: '1.5rem', letterSpacing: '1px' }}>
              {t.packOpening}
            </h2>
          </div>
        </div>
      )}

      {/* Reveal Drawn Cards */}
      {drawnCards.length > 0 && (
        <div className="pack-opening-overlay" style={{ background: 'radial-gradient(circle, #0f172a 0%, #030712 100%)' }}>
          <h2 className="glow-gold" style={{ color: 'var(--accent-gold)', fontWeight: '900', fontSize: '1.5rem', marginBottom: '2rem', textTransform: 'uppercase', textAlign: 'center', padding: '0 1rem' }}>
            {t.congrats}
          </h2>

          <div className="reveal-cards-container">
            {drawnCards.map((player, idx) => (
              <div key={idx} className="revealed-card-item">
                <PlayerCard player={player} />
              </div>
            ))}
          </div>

          <button 
            className="btn-primary" 
            onClick={resetDrawnState}
            style={{ marginTop: '3rem', padding: '1rem 2.5rem', fontSize: '1rem', textTransform: 'uppercase' }}
          >
            <Sparkles size={18} />
            <span>Koleksiyona Ekle / Add to Club</span>
          </button>
        </div>
      )}
    </div>
  );
}
