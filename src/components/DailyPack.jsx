import React, { useState, useEffect } from 'react';
import PlayerCard from './PlayerCard';
import { translations } from '../data/translations';
import { Sparkles, Clock, RefreshCw, ShoppingCart } from 'lucide-react';
import fallbackPlayers from '../data/fallbackPlayers.json';

export default function DailyPack({ user, onCardsDrawn, lang, coins, onUpdateCoins }) {
  const t = translations[lang];
  
  const [canDraw, setCanDraw] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [drawnCards, setDrawnCards] = useState([]);
  const [activePackType, setActivePackType] = useState('free');
  
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const checkCooldown = () => {
    const lastDraw = localStorage.getItem(`last_draw_${user.username.toLowerCase()}`);
    if (!lastDraw) {
      setCanDraw(true);
      setTimeRemaining('');
      return;
    }

    const elapsed = Date.now() - parseInt(lastDraw, 10);
    if (elapsed >= COOLDOWN_MS) {
      setCanDraw(true);
      setTimeRemaining('');
    } else {
      setCanDraw(false);
      const remaining = COOLDOWN_MS - elapsed;
      const hours = Math.floor(remaining / (3600 * 1000));
      const minutes = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  };

  const handleOpenPack = (packType) => {
    let cost = 0;
    if (packType === 'bronze') cost = 150;
    else if (packType === 'gold') cost = 500;
    else if (packType === 'mega') cost = 1500;

    if (packType === 'free' && !canDraw) return;
    if (packType !== 'free' && coins < cost) return;

    setIsOpening(true);
    setShaking(true);
    setActivePackType(packType);

    if (packType !== 'free') {
      onUpdateCoins(coins - cost);
    }

    // Shake pack for 1.5s
    setTimeout(() => {
      setShaking(false);
      setShowExplosion(true);
      drawCards(packType);
    }, 1500);

    // Clear explosion flash
    setTimeout(() => {
      setShowExplosion(false);
    }, 2500);
  };

  const drawCards = (packType) => {
    const customPlayers = JSON.parse(localStorage.getItem(`custom_players_${user.username.toLowerCase()}`) || '[]');
    const pool = [...fallbackPlayers, ...customPlayers];

    let count = 3;
    if (packType === 'mega') count = 5;

    const selectRarity = () => {
      const rand = Math.random() * 100;
      if (packType === 'bronze') {
        if (rand < 1) return 'icon';
        if (rand < 3) return 'toty';
        return 'gold';
      } else if (packType === 'mega') {
        if (rand < 15) return 'icon';
        if (rand < 45) return 'toty';
        return 'gold';
      } else { // free or gold
        if (rand < 10) return 'icon';
        if (rand < 30) return 'toty';
        return 'gold';
      }
    };

    const pickPlayer = (rarity) => {
      let subPool = pool.filter(p => p.rarity.toLowerCase() === rarity.toLowerCase());
      
      if (packType === 'bronze' && rarity === 'gold') {
        const lowGold = subPool.filter(p => p.rating < 84);
        if (lowGold.length > 0) subPool = lowGold;
      }

      if (subPool.length === 0) {
        subPool = pool;
      }
      return subPool[Math.floor(Math.random() * subPool.length)];
    };

    const drawn = [];
    for (let i = 0; i < count; i++) {
      const r = selectRarity();
      let picked = pickPlayer(r);
      let attempts = 0;
      while (drawn.some(p => p.id === picked.id) && attempts < 15) {
        picked = pickPlayer(r);
        attempts++;
      }
      drawn.push(picked);
    }

    // Mega Pack Guarantee: at least one card >= 88 OVR
    if (packType === 'mega') {
      const hasHighRating = drawn.some(p => p.rating >= 88);
      if (!hasHighRating) {
        const highPool = pool.filter(p => p.rating >= 88);
        if (highPool.length > 0) {
          drawn[drawn.length - 1] = highPool[Math.floor(Math.random() * highPool.length)];
        }
      }
    }

    setDrawnCards(drawn);

    const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    
    if (userIndex !== -1) {
      const activeCollection = users[userIndex].collection || [];
      const updatedCollection = [...activeCollection];
      drawn.forEach(player => {
        updatedCollection.push({
          ...player,
          instanceId: `${player.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        });
      });
      
      users[userIndex].collection = updatedCollection;
      localStorage.setItem('fut_users', JSON.stringify(users));
      
      if (packType === 'free') {
        const drawTime = Date.now();
        localStorage.setItem(`last_draw_${user.username.toLowerCase()}`, String(drawTime));
      }

      onCardsDrawn(updatedCollection);
    }
  };

  const resetDrawnState = () => {
    setIsOpening(false);
    setDrawnCards([]);
    checkCooldown();
  };

  const devResetTimer = () => {
    localStorage.removeItem(`last_draw_${user.username.toLowerCase()}`);
    setCanDraw(true);
    setTimeRemaining('');
    setDrawnCards([]);
    setIsOpening(false);
  };

  return (
    <div className="pack-container" style={{ padding: '2rem 1rem' }}>
      
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
        <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
          <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            {t.dailyDraw}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {t.claimThreeCards}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="pack-wrapper">
              <button 
                className={`pack-button-card ${shaking && activePackType === 'free' ? 'pack-shaking' : ''}`}
                onClick={() => handleOpenPack('free')}
                disabled={!canDraw}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <div className="pack-logo-glow">🎒</div>
                <h3 style={{ color: 'var(--accent-gold)', fontWeight: '900', letterSpacing: '2px', fontSize: '1.25rem' }}>
                  FREE DAILY PACK
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
              gap: '0.35rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                <Clock size={14} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  {t.nextDrawIn}
                </span>
              </div>
              <span className="glow-gold" style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                {timeRemaining}
              </span>
            </div>
          )}

          {/* Jeton Mağazası / Pack Store */}
          <div style={{ margin: '2rem 0 1rem 0', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left', width: '100%' }}>
            <h3 className="glow-gold" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <ShoppingCart size={18} />
              <span>{lang === 'tr' ? 'Jeton Mağazası' : 'Pack Store'}</span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {lang === 'tr' ? 'Kazandığın jetonlarla istediğin kadar paket al!' : 'Buy as many packs as you want using your earned coins!'}
            </p>
          </div>

          {/* Store Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', width: '100%' }}>
            
            {/* Bronze Pack */}
            <div className="glass-panel" style={{ textAlign: 'center', border: '1px solid #78350f', padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '160px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🟫</div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '800', margin: 0 }}>BRONZE</h4>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>3 Cards (Low Gold)</span>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => handleOpenPack('bronze')}
                disabled={coins < 150}
                style={{ width: '100%', fontSize: '0.7rem', padding: '0.35rem', justifyContent: 'center', background: 'linear-gradient(135deg, #b45309, #78350f)', color: '#fff', boxShadow: 'none' }}
              >
                🪙 150
              </button>
            </div>

            {/* Gold Pack */}
            <div className="glass-panel" style={{ textAlign: 'center', border: '1px solid var(--accent-gold)', padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '160px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🟨</div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-gold)', margin: 0 }}>GOLD</h4>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>3 Cards (10% Icon)</span>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => handleOpenPack('gold')}
                disabled={coins < 500}
                style={{ width: '100%', fontSize: '0.7rem', padding: '0.35rem', justifyContent: 'center' }}
              >
                🪙 500
              </button>
            </div>

            {/* Mega Pack */}
            <div className="glass-panel" style={{ textAlign: 'center', border: '1px solid #047857', padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '160px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🔥</div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', margin: 0 }}>MEGA</h4>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>5 Cards (88+ Guar.)</span>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => handleOpenPack('mega')}
                disabled={coins < 1500}
                style={{ width: '100%', fontSize: '0.7rem', padding: '0.35rem', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #047857)', color: '#fff', boxShadow: 'none' }}
              >
                🪙 1500
              </button>
            </div>

          </div>
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
