import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('fut_cookies_accepted');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('fut_cookies_accepted', 'true');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('fut_cookies_accepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '460px',
      zIndex: 2000,
      backgroundColor: 'rgba(18, 24, 36, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--accent-gold)',
      borderRadius: '12px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 20px var(--accent-gold-glow)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <ShieldCheck size={24} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
            {lang === 'tr' ? 'Çerez ve Veri Depolama' : 'Cookies & Data Storage'}
          </h4>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {lang === 'tr' 
              ? 'Takım dizilişlerinizi, jeton bakiyenizi ve kart koleksiyonlarınızı bu cihazda saklayıp size özel bir FUT deneyimi sunmak için yerel tarayıcı depolamasını (Local Storage) kullanıyoruz.' 
              : 'We use local browser storage (Local Storage) to save your custom squads, coins balance, and card collection to provide a personalized FUT experience on this device.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
        <button className="btn-secondary" onClick={handleDecline} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
          {lang === 'tr' ? 'Reddet' : 'Decline'}
        </button>
        <button className="btn-primary" onClick={handleAccept} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: '#000', boxShadow: 'none' }}>
          {lang === 'tr' ? 'Kabul Et' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
