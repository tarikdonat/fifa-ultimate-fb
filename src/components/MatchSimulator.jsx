import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Shield, Sparkles } from 'lucide-react';
import { translations } from '../data/translations';
import { fetchOnlineSquads } from '../data/onlineSync';

const DEMO_TEAMS = [
  {
    id: 'demo_gs',
    name: 'Galatasaray Stars',
    manager: 'Okan Buruk',
    ovr: 86,
    chem: 33,
    logo: 'GS',
    color: '#ea580c',
    reward: 1.1,
    stadium: 'Ali Sami Yen Kompleksi',
    players: [
      { name: 'Victor Osimhen', rating: 87, position: 'ST', nation: 'Nigeria' },
      { name: 'Mauro Icardi', rating: 85, position: 'ST', nation: 'Argentina' },
      { name: 'Gabriel Sara', rating: 83, position: 'CM', nation: 'Brazil' },
      { name: 'Barış Alper Yılmaz', rating: 81, position: 'RW', nation: 'Turkey' },
      { name: 'Dries Mertens', rating: 82, position: 'CAM', nation: 'Belgium' },
      { name: 'Lucas Torreira', rating: 84, position: 'CDM', nation: 'Uruguay' },
      { name: 'Abdülkerim Bardakcı', rating: 81, position: 'CB', nation: 'Turkey' },
      { name: 'Davinson Sánchez', rating: 83, position: 'CB', nation: 'Colombia' },
      { name: 'Ismail Jakobs', rating: 79, position: 'LB', nation: 'Senegal' },
      { name: 'Elias Jelert', rating: 78, position: 'RB', nation: 'Denmark' },
      { name: 'Fernando Muslera', rating: 84, position: 'GK', nation: 'Uruguay' }
    ]
  },
  {
    id: 'demo_fb',
    name: 'Fenerbahçe Legends',
    manager: 'José Mourinho',
    ovr: 85,
    chem: 33,
    logo: 'FB',
    color: '#fbbf24',
    reward: 1.0,
    stadium: 'Ülker Stadyumu',
    players: [
      { name: 'Edin Džeko', rating: 82, position: 'ST', nation: 'Bosnia' },
      { name: 'Youssef En-Nesyri', rating: 81, position: 'ST', nation: 'Morocco' },
      { name: 'Dušan Tadić', rating: 83, position: 'LW', nation: 'Serbia' },
      { name: 'Sebastian Szymański', rating: 82, position: 'CAM', nation: 'Poland' },
      { name: 'Fred', rating: 82, position: 'CM', nation: 'Brazil' },
      { name: 'Sofyan Amrabat', rating: 81, position: 'CDM', nation: 'Morocco' },
      { name: 'Ferdi Kadıoğlu', rating: 82, position: 'LB', nation: 'Turkey' },
      { name: 'Alexander Djiku', rating: 80, position: 'CB', nation: 'Ghana' },
      { name: 'Çağlar Söyüncü', rating: 80, position: 'CB', nation: 'Turkey' },
      { name: 'Bright Osayi-Samuel', rating: 79, position: 'RB', nation: 'Nigeria' },
      { name: 'Dominik Livaković', rating: 82, position: 'GK', nation: 'Croatia' }
    ]
  },
  {
    id: 'demo_bjk',
    name: 'Beşiktaş Eagles',
    manager: 'G. van Bronckhorst',
    ovr: 83,
    chem: 30,
    logo: 'BJK',
    color: '#111827',
    reward: 1.0,
    stadium: 'Tüpraş Stadyumu',
    players: [
      { name: 'Ciro Immobile', rating: 83, position: 'ST', nation: 'Italy' },
      { name: 'Rafa Silva', rating: 83, position: 'CAM', nation: 'Portugal' },
      { name: 'Milot Rashica', rating: 80, position: 'RW', nation: 'Kosovo' },
      { name: 'Gedson Fernandes', rating: 82, position: 'CM', nation: 'Portugal' },
      { name: 'Cher Ndour', rating: 77, position: 'CM', nation: 'Italy' },
      { name: 'Al-Musrati', rating: 80, position: 'CDM', nation: 'Libya' },
      { name: 'Arthur Masuaku', rating: 78, position: 'LB', nation: 'DR Congo' },
      { name: 'Felix Uduokhai', rating: 79, position: 'CB', nation: 'Germany' },
      { name: 'Gabriel Paulista', rating: 80, position: 'CB', nation: 'Brazil' },
      { name: 'Jonas Svensson', rating: 77, position: 'RB', nation: 'Norway' },
      { name: 'Mert Günok', rating: 80, position: 'GK', nation: 'Turkey' }
    ]
  },
  {
    id: 'demo_icons',
    name: 'FUT Icons FC',
    manager: 'Zinedine Zidane',
    ovr: 94,
    chem: 28,
    logo: 'IC',
    color: '#ffd700',
    reward: 2.0,
    stadium: 'FUT Icons Arena',
    players: [
      { name: 'Pelé', rating: 95, position: 'ST', nation: 'Brazil' },
      { name: 'Ronaldinho', rating: 93, position: 'LW', nation: 'Brazil' },
      { name: 'Zinédine Zidane', rating: 94, position: 'CAM', nation: 'France' },
      { name: 'Luka Modrić', rating: 87, position: 'CM', nation: 'Croatia' },
      { name: 'Kevin De Bruyne', rating: 91, position: 'CM', nation: 'Belgium' },
      { name: 'Jude Bellingham', rating: 90, position: 'CAM', nation: 'England' },
      { name: 'Theo Hernández', rating: 87, position: 'LB', nation: 'France' },
      { name: 'Virgil van Dijk', rating: 89, position: 'CB', nation: 'Netherlands' },
      { name: 'Rúben Dias', rating: 89, position: 'CB', nation: 'Portugal' },
      { name: 'Achraf Hakimi', rating: 84, position: 'RB', nation: 'Morocco' },
      { name: 'Alisson Becker', rating: 89, position: 'GK', nation: 'Brazil' }
    ]
  }
];

let globalAudioCtx = null;

const getAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

const playSynthesizedSound = (type, volumeEnabled) => {
  if (!volumeEnabled) return;
  
  // Defer execution using setTimeout to prevent blocking the UI thread (resolving INP issue)
  setTimeout(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (type === 'whistle') {
        const playChirp = (delay, duration) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1400, ctx.currentTime + delay);
          osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + delay + duration);
          gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
          gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + duration);
        };
        playChirp(0, 0.1);
        playChirp(0.15, 0.1);
        playChirp(0.35, 0.4);
      } else if (type === 'goal') {
        const bufferSize = ctx.sampleRate * 2.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.5);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 2.0);
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + 2.0);
      } else if (type === 'whistle_short') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.12);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'card_clash') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(180, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.25);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(120, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.35);
        osc2.stop(ctx.currentTime + 0.35);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.error('Failed to play sound: ', e);
    }
  }, 10);
};

const FlagIcon = ({ nation }) => {
  if (!nation) return null;
  const key = nation.toLowerCase().trim();
  
  const flags = {
    turkey: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="2" fill="#E30A17" />
        <circle cx="1" cy="1" r="0.45" fill="#FFFFFF" />
        <circle cx="1.12" cy="1" r="0.36" fill="#E30A17" />
        <polygon points="1.45,0.85 1.45,1.15 1.7,1" fill="#FFFFFF" />
      </svg>
    ),
    brazil: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="2" fill="#009C3B" />
        <polygon points="1.5,0.2 2.7,1 1.5,1.8 0.3,1" fill="#FFDF00" />
        <circle cx="1.5" cy="1" r="0.4" fill="#002776" />
      </svg>
    ),
    france: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="1" height="2" fill="#002395" />
        <rect x="1" width="1" height="2" fill="#FFFFFF" />
        <rect x="2" width="1" height="2" fill="#ED2939" />
      </svg>
    ),
    argentina: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="0.67" fill="#74ACDF" />
        <rect y="0.67" width="3" height="0.67" fill="#FFFFFF" />
        <circle cx="1.5" cy="1" r="0.18" fill="#F6B40E" />
      </svg>
    ),
    portugal: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="1.2" height="2" fill="#006600" />
        <rect x="1.2" width="1.8" height="2" fill="#FF0000" />
        <circle cx="1.2" cy="1" r="0.3" fill="#FFFF00" opacity="0.8" />
      </svg>
    ),
    england: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="2" fill="#FFFFFF" />
        <rect x="1.35" width="0.3" height="2" fill="#C8102E" />
        <rect y="0.85" width="3" height="0.3" fill="#C8102E" />
      </svg>
    ),
    germany: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="0.67" fill="#000000" />
        <rect y="0.67" width="3" height="0.67" fill="#FF0000" />
        <rect y="1.34" width="3" height="0.67" fill="#FFCC00" />
      </svg>
    ),
    belgium: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="1" height="2" fill="#000000" />
        <rect x="1" width="1" height="2" fill="#FFE300" />
        <rect x="2" width="1" height="2" fill="#ED2939" />
      </svg>
    ),
    netherlands: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="0.67" fill="#AE1C28" />
        <rect y="0.67" width="3" height="0.67" fill="#FFFFFF" />
        <rect y="1.34" width="3" height="0.67" fill="#21468B" />
      </svg>
    ),
    uruguay: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="2" fill="#FFFFFF" />
        <rect y="0.22" width="3" height="0.22" fill="#0081C6" />
        <rect y="0.66" width="3" height="0.22" fill="#0081C6" />
        <rect y="1.1" width="3" height="0.22" fill="#0081C6" />
        <rect y="1.54" width="3" height="0.22" fill="#0081C6" />
        <circle cx="0.6" cy="0.44" r="0.22" fill="#F6B40E" />
      </svg>
    ),
    italy: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="1" height="2" fill="#009246" />
        <rect x="1" width="1" height="2" fill="#F1F2F1" />
        <rect x="2" width="1" height="2" fill="#CE2B37" />
      </svg>
    ),
    croatia: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="0.67" fill="#FF0000" />
        <rect y="0.67" width="3" height="0.67" fill="#FFFFFF" />
        <rect y="1.34" width="3" height="0.67" fill="#171796" />
        <polygon points="1.3,0.8 1.7,0.8 1.5,1.1" fill="#FF0000" />
      </svg>
    ),
    serbia: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="0.67" fill="#C8102E" />
        <rect y="0.67" width="3" height="0.67" fill="#0C2340" />
        <rect y="1.34" width="3" height="0.67" fill="#FFFFFF" />
        <polygon points="1.3,0.8 1.6,0.8 1.45,1.1" fill="#C8102E" />
      </svg>
    ),
    morocco: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="2" fill="#C1272D" />
        <polygon points="1.5,0.7 1.6,1.05 1.3,0.85 1.7,0.85 1.4,1.05" fill="#006233" />
      </svg>
    ),
    colombia: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="1" fill="#FCD116" />
        <rect y="1" width="3" height="0.5" fill="#003893" />
        <rect y="1.5" width="3" height="0.5" fill="#CE1126" />
      </svg>
    ),
    nigeria: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="1" height="2" fill="#008751" />
        <rect x="1" width="1" height="2" fill="#FFFFFF" />
        <rect x="2" width="1" height="2" fill="#008751" />
      </svg>
    ),
    poland: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="1" fill="#FFFFFF" />
        <rect y="1" width="3" height="1" fill="#DC143C" />
      </svg>
    ),
    senegal: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="1" height="2" fill="#00853F" />
        <rect x="1" width="1" height="2" fill="#FDEF42" />
        <rect x="2" width="1" height="2" fill="#E31B23" />
        <polygon points="1.5,0.8 1.6,1.1 1.35,0.95 1.65,0.95 1.4,1.1" fill="#00853F" />
      </svg>
    ),
    bosnia: (
      <svg viewBox="0 0 3 2" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="3" height="2" fill="#002F6C" />
        <polygon points="0.8,0 2.2,0 2.2,2" fill="#FECB00" />
      </svg>
    )
  };

  return flags[key] || (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 'bold', backgroundColor: '#334155', color: '#fff' }}>
      {nation.substring(0, 3).toUpperCase()}
    </div>
  );
};

const DuelCard = ({ player, team, role, isClashing }) => {
  if (!player) return null;
  const rating = player.rating;
  const isIcon = team.id === 'demo_icons' || rating >= 90;
  const isGold = rating >= 80;
  
  let cardBg = 'linear-gradient(135deg, #1e293b, #0f172a)';
  let borderColor = '#475569';
  let glowColor = 'transparent';
  let textColor = '#fff';
  let badgeBg = 'rgba(255,255,255,0.07)';

  if (isIcon) {
    cardBg = 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)';
    borderColor = '#ffd700';
    glowColor = '0 0 15px rgba(255, 215, 0, 0.4)';
    textColor = '#111827';
    badgeBg = 'rgba(0,0,0,0.1)';
  } else if (isGold) {
    cardBg = 'linear-gradient(135deg, #e2b74b 0%, #8c6b12 100%)';
    borderColor = '#e2b74b';
    glowColor = '0 0 12px rgba(226, 183, 75, 0.3)';
    textColor = '#fff';
    badgeBg = 'rgba(0,0,0,0.2)';
  } else {
    cardBg = 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)';
    borderColor = '#cbd5e1';
    glowColor = 'transparent';
    textColor = '#fff';
    badgeBg = 'rgba(255,255,255,0.1)';
  }

  return (
    <div 
      className={`duel-card ${role} ${isClashing ? 'clash' : ''}`}
      style={{
        background: cardBg,
        border: `2px solid ${borderColor}`,
        boxShadow: glowColor !== 'transparent' ? `0 10px 25px rgba(0,0,0,0.6), ${glowColor}` : '0 10px 25px rgba(0,0,0,0.6)',
        color: textColor
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '950', lineHeight: 1 }}>{player.rating}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.8, textTransform: 'uppercase' }}>{player.position}</span>
          <div style={{ height: '3px' }} />
          <div className="flag-round">
            <FlagIcon nation={player.nation} />
          </div>
          <div style={{ height: '3px' }} />
          <div style={{ 
            fontSize: '8px', 
            fontWeight: '900', 
            backgroundColor: badgeBg, 
            color: isIcon ? '#111827' : '#fff',
            borderRadius: '50%', 
            width: '16px', 
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isIcon ? '#111827' : 'rgba(255,255,255,0.3)'}`
          }}>
            {team.logo || 'FC'}
          </div>
        </div>

        <div style={{ width: '64px', height: '64px', opacity: 0.85 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="28" r="10" fill={isIcon ? '#5c4308' : '#334155'} />
            <rect x="47" y="36" width="6" height="6" rx="2" fill={isIcon ? '#5c4308' : '#334155'} />
            <path d="M 28 50 C 28 42, 38 40, 50 40 C 62 40, 72 42, 72 50 C 72 65, 78 95, 78 95 L 22 95 Z" fill={isIcon ? '#5c4308' : '#334155'} />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center', borderTop: `1px solid ${isIcon ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`, paddingTop: '0.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.name.split(' ').pop()}
        </div>
        <div style={{ fontSize: '0.55rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {role === 'attacker' ? 'ATTACK' : 'DEFEND'}
        </div>
      </div>
    </div>
  );
};

const calculateUserSquadStats = (squad, formation, username) => {
  if (!squad || !formation) return null;
  
  const rows = formation === '4-3-3' ? [['LW', 'ST', 'RW'], ['CM', 'CAM', 'CDM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']] :
               formation === '4-4-2' ? [['ST1', 'ST2'], ['LM', 'CM1', 'CM2', 'RM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']] :
               formation === '3-5-2' ? [['ST1', 'ST2'], ['LM', 'CM1', 'CAM', 'CM2', 'RM'], ['CB1', 'CB2', 'CB3'], ['GK']] :
               [['ST'], ['LAM', 'CAM', 'RAM'], ['LDM', 'RDM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']]; // 4-2-3-1

  const activeSlots = rows.flat();
  const players = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);
  
  if (players.length < 11) {
    return null;
  }

  // Calculate rating
  const sum = players.reduce((acc, p) => acc + p.rating, 0);
  const ovr = Math.floor(sum / 11);

  // Calculate chemistry
  const clubCounts = {};
  const nationCounts = {};
  players.forEach(p => {
    const club = p.club ? p.club.toLowerCase() : '';
    const nation = p.nation ? p.nation.toLowerCase() : '';
    clubCounts[club] = (clubCounts[club] || 0) + 1;
    nationCounts[nation] = (nationCounts[nation] || 0) + 1;
  });

  let totalChem = 0;
  activeSlots.forEach(slot => {
    const player = squad[slot];
    if (!player) return;
    let chem = 0;
    
    let targetPos = slot.toUpperCase();
    if (slot.startsWith('CB')) targetPos = 'CB';
    else if (slot.startsWith('ST')) targetPos = 'ST';
    else if (slot.startsWith('CM')) targetPos = 'CM';
    else if (slot.startsWith('CDM') || slot === 'LDM' || slot === 'RDM') targetPos = 'CDM';
    else if (slot.startsWith('CAM') || slot === 'LAM' || slot === 'RAM') targetPos = 'CAM';
    
    const playerPos = player.position.toUpperCase();
    if (playerPos === targetPos || 
        (targetPos === 'CAM' && playerPos === 'CM') ||
        (targetPos === 'CDM' && playerPos === 'CM') ||
        (targetPos === 'LM' && playerPos === 'LW') ||
        (targetPos === 'RM' && playerPos === 'RW')
    ) {
      chem += 1;
    }

    if (player.club && clubCounts[player.club.toLowerCase()] >= 2) chem += 1;
    if (player.nation && nationCounts[player.nation.toLowerCase()] >= 2) chem += 1;
    
    totalChem += chem;
  });

  return {
    id: `local_user_${username.toLowerCase()}`,
    name: username,
    ovr,
    chem: totalChem,
    logo: username.substring(0, 2).toUpperCase(),
    color: '#8b5cf6',
    reward: 1.2,
    players: players.map(p => ({ name: p.name, rating: p.rating, position: p.position, nation: p.nation }))
  };
};

export default function MatchSimulator({ collection, lang, user, coins, onUpdateCoins }) {
  const t = translations[lang];

  const [onlineSquads, setOnlineSquads] = useState([]);

  useEffect(() => {
    const loadOnline = async () => {
      try {
        const squads = await fetchOnlineSquads();
        setOnlineSquads(squads);
      } catch (e) {
        console.error('Failed to load online squads in simulator:', e);
      }
    };
    loadOnline();
  }, []);

  // Load user squad
  const userSquadStats = useMemo(() => {
    const savedSquad = localStorage.getItem('fut_active_squad');
    const savedFormation = localStorage.getItem('fut_active_formation') || '4-3-3';
    
    let squad = {};
    if (savedSquad) {
      try {
        squad = JSON.parse(savedSquad);
      } catch (e) {}
    }

    const rows = savedFormation === '4-3-3' ? [['LW', 'ST', 'RW'], ['CM', 'CAM', 'CDM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']] :
                 savedFormation === '4-4-2' ? [['ST1', 'ST2'], ['LM', 'CM1', 'CM2', 'RM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']] :
                 savedFormation === '3-5-2' ? [['ST1', 'ST2'], ['LM', 'CM1', 'CAM', 'CM2', 'RM'], ['CB1', 'CB2', 'CB3'], ['GK']] :
                 [['ST'], ['LAM', 'CAM', 'RAM'], ['LDM', 'RDM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']];

    const activeSlots = rows.flat();
    const players = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);
    
    if (players.length < 11) {
      return { id: 'user_squad', name: user?.username || 'My Squad', ovr: 0, chem: 0, isUser: true, incomplete: true, logo: 'ME', color: 'var(--accent-gold)', reward: 1.2, stadium: 'FUT Arena', players: [] };
    }

    const sum = players.reduce((acc, p) => acc + p.rating, 0);
    const ovr = Math.floor(sum / 11);

    const clubCounts = {};
    const nationCounts = {};
    players.forEach(p => {
      const club = p.club.toLowerCase();
      const nation = p.nation.toLowerCase();
      clubCounts[club] = (clubCounts[club] || 0) + 1;
      nationCounts[nation] = (nationCounts[nation] || 0) + 1;
    });

    let totalChem = 0;
    activeSlots.forEach(slot => {
      const player = squad[slot];
      if (!player) return;
      let chem = 0;
      
      let targetPos = slot.toUpperCase();
      if (slot.startsWith('CB')) targetPos = 'CB';
      else if (slot.startsWith('ST')) targetPos = 'ST';
      else if (slot.startsWith('CM')) targetPos = 'CM';
      else if (slot.startsWith('CDM') || slot === 'LDM' || slot === 'RDM') targetPos = 'CDM';
      else if (slot.startsWith('CAM') || slot === 'LAM' || slot === 'RAM') targetPos = 'CAM';
      
      const playerPos = player.position.toUpperCase();
      if (playerPos === targetPos || 
          (targetPos === 'CAM' && playerPos === 'CM') ||
          (targetPos === 'CDM' && playerPos === 'CM') ||
          (targetPos === 'LM' && playerPos === 'LW') ||
          (targetPos === 'RM' && playerPos === 'RW')
      ) {
        chem += 1;
      }

      if (clubCounts[player.club.toLowerCase()] >= 2) chem += 1;
      if (nationCounts[player.nation.toLowerCase()] >= 2) chem += 1;
      
      totalChem += chem;
    });

    return {
      id: 'user_squad',
      name: `${user?.username || 'My Squad'} (You)`,
      ovr,
      chem: totalChem,
      isUser: true,
      logo: user?.username ? user.username.substring(0,2).toUpperCase() : 'ME',
      color: 'var(--accent-gold)',
      reward: 1.2,
      stadium: 'Ultimate Stadium',
      players: players.map(p => ({ name: p.name, rating: p.rating, position: p.position, nation: p.nation }))
    };
  }, [user, collection]);

  const availableSquadsForDerby = useMemo(() => {
    const list = [...DEMO_TEAMS];
    if (!userSquadStats.incomplete) {
      list.push(userSquadStats);
    }
    
    // 1. Add friend squads
    try {
      const savedFriends = localStorage.getItem('fut_friends_squads');
      if (savedFriends) {
        const friends = JSON.parse(savedFriends);
        friends.forEach(f => {
          list.push({
            id: f.id,
            name: `${f.name} (Friend)`,
            manager: 'Alex',
            ovr: f.ovr,
            chem: f.chem,
            logo: f.logo || 'FR',
            color: f.color || '#3b82f6',
            reward: 1.1,
            stadium: f.stadium || 'Away Arena',
            players: f.players || []
          });
        });
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Add online synced squads
    onlineSquads.forEach(os => {
      const exists = list.some(t => t.name.toLowerCase() === `${os.name} (Online)`.toLowerCase() || t.name.toLowerCase() === os.name.toLowerCase());
      if (!exists && (!user || os.name.toLowerCase() !== user.username.toLowerCase())) {
        list.push({
          id: os.id,
          name: `${os.name} (Online)`,
          manager: 'Online Manager',
          ovr: os.ovr,
          chem: os.chem,
          logo: os.logo,
          color: '#10b981', // green
          reward: 1.3,
          stadium: 'Online Arena',
          players: os.players
        });
      }
    });

    // 3. Add other local registered users
    try {
      const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
      users.forEach(u => {
        if (user && u.username.toLowerCase() === user.username.toLowerCase()) {
          return;
        }
        const isOnline = onlineSquads.some(os => os.name.toLowerCase() === u.username.toLowerCase());
        if (isOnline) return;

        if (u.squad && u.formation) {
          const stats = calculateUserSquadStats(u.squad, u.formation, u.username);
          if (stats) {
            list.push({
              id: stats.id,
              name: `${stats.name} (User)`,
              manager: 'Manager',
              ovr: stats.ovr,
              chem: stats.chem,
              logo: stats.logo,
              color: stats.color,
              reward: 1.2,
              stadium: 'Local Arena',
              players: stats.players
            });
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
    
    return list;
  }, [userSquadStats, user, onlineSquads]);

  const [matchStep, setMatchStep] = useState('setup'); // setup, playing, result
  const [homeTeam, setHomeTeam] = useState(DEMO_TEAMS[0]);
  const [awayTeam, setAwayTeam] = useState(DEMO_TEAMS[1]);
  const [selectedSide, setSelectedSide] = useState('home');
  const [simTimer, setSimTimer] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [derbyLog, setDerbyLog] = useState([]);
  const [rewardCoins, setRewardCoins] = useState(0);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userTactic, setUserTactic] = useState('balanced');
  const [opponentTactic, setOpponentTactic] = useState('balanced');
  const [isHalftime, setIsHalftime] = useState(false);
  const [triggeredMinutes, setTriggeredMinutes] = useState([]);
  const [ballPosition, setBallPosition] = useState('midfield');

  const [matchStats, setMatchStats] = useState({
    shotsHome: 0,
    shotsAway: 0,
    shotsTargetHome: 0,
    shotsTargetAway: 0,
    savesHome: 0,
    savesAway: 0,
    foulsHome: 0,
    foulsAway: 0,
    cornersHome: 0,
    cornersAway: 0,
    possessionHome: 50,
    possessionAway: 50
  });

  const [duelAttacker, setDuelAttacker] = useState(null);
  const [duelDefender, setDuelDefender] = useState(null);
  const [duelResult, setDuelResult] = useState(null);
  const [duelStep, setDuelStep] = useState(null);
  
  const [criticalMoment, setCriticalMoment] = useState(null);
  const [criticalResult, setCriticalResult] = useState(null);

  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [derbyLog]);

  const handleStartDerby = () => {
    if (homeTeam.id === awayTeam.id) return;
    
    const tactics = ['balanced', 'attacking', 'defensive'];
    const oppTactic = tactics[Math.floor(Math.random() * tactics.length)];
    setOpponentTactic(oppTactic);

    setSimTimer(0);
    setHomeScore(0);
    setAwayScore(0);
    setDerbyLog([]);
    setIsHalftime(false);
    setTriggeredMinutes([]);
    setBallPosition('midfield');
    setDuelAttacker(null);
    setDuelDefender(null);
    setDuelResult(null);
    setDuelStep(null);
    setCriticalMoment(null);
    setCriticalResult(null);
    
    const homeT = selectedSide === 'home' ? userTactic : oppTactic;
    const awayT = selectedSide === 'away' ? userTactic : oppTactic;
    let homePoss = 50;
    if (homeT === 'attacking') homePoss += 5;
    if (homeT === 'defensive') homePoss -= 5;
    if (awayT === 'attacking') homePoss -= 5;
    if (awayT === 'defensive') homePoss += 5;
    homePoss += Math.floor(Math.random() * 5) - 2;
    const finalHomePoss = Math.max(30, Math.min(70, homePoss));
    
    setMatchStats({
      shotsHome: 0,
      shotsAway: 0,
      shotsTargetHome: 0,
      shotsTargetAway: 0,
      savesHome: 0,
      savesAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      cornersHome: 0,
      cornersAway: 0,
      possessionHome: finalHomePoss,
      possessionAway: 100 - finalHomePoss
    });

    setMatchStep('playing');
    playSynthesizedSound('whistle', soundEnabled);
    
    setDerbyLog([{ 
      minute: 0, 
      event: lang === 'tr' 
        ? `Derbi Maçı Başladı! Hakem düdüğünü çalıyor. (${homeTeam.name} vs ${awayTeam.name})` 
        : `Derby Match Started! The referee blows the whistle. (${homeTeam.name} vs ${awayTeam.name})` 
    }]);
  };

  useEffect(() => {
    let interval = null;
    if (matchStep === 'playing' && !duelStep && !criticalMoment && !isHalftime) {
      interval = setInterval(() => {
        setSimTimer(prev => {
          const increment = Math.floor(Math.random() * 2) + 2;
          const nextMinute = prev + increment;
          
          if (nextMinute >= 90) {
            clearInterval(interval);
            playSynthesizedSound('whistle', soundEnabled);
            setSimTimer(90);
            setMatchStep('result');
            calculateDerbyRewards();
            return 90;
          }
          
          triggerScheduleOrCommentary(nextMinute);
          return nextMinute;
        });
      }, 420);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [matchStep, duelStep, criticalMoment, isHalftime, homeTeam, awayTeam, soundEnabled]);

  const triggerScheduleOrCommentary = (minute) => {
    if (minute >= 45 && minute < 50 && !triggeredMinutes.includes('halftime')) {
      setTriggeredMinutes(prev => [...prev, 'halftime']);
      setIsHalftime(true);
      playSynthesizedSound('whistle', soundEnabled);
      setBallPosition('midfield');
      setDerbyLog(prev => [{ minute: 45, event: lang === 'tr' ? 'İlk yarı Sona Erdi! Takımlar devre arasına giriyor.' : 'Half-time whistle blows! Teams enter the break.' }, ...prev]);
      return;
    }

    if (minute >= 12 && minute < 20 && !triggeredMinutes.includes('event1')) {
      setTriggeredMinutes(prev => [...prev, 'event1']);
      startCardDuel(minute);
      return;
    }
    if (minute >= 26 && minute < 34 && !triggeredMinutes.includes('event2')) {
      setTriggeredMinutes(prev => [...prev, 'event2']);
      startCardDuel(minute);
      return;
    }
    if (minute >= 35 && minute < 44 && !triggeredMinutes.includes('event3')) {
      setTriggeredMinutes(prev => [...prev, 'event3']);
      startCriticalMoment(1, minute);
      return;
    }
    if (minute >= 56 && minute < 64 && !triggeredMinutes.includes('event4')) {
      setTriggeredMinutes(prev => [...prev, 'event4']);
      startCardDuel(minute);
      return;
    }
    if (minute >= 68 && minute < 76 && !triggeredMinutes.includes('event5')) {
      setTriggeredMinutes(prev => [...prev, 'event5']);
      startCardDuel(minute);
      return;
    }
    if (minute >= 78 && minute < 86 && !triggeredMinutes.includes('event6')) {
      setTriggeredMinutes(prev => [...prev, 'event6']);
      startCriticalMoment(2, minute);
      return;
    }

    generateNormalCommentary(minute);
  };

  const generateNormalCommentary = (minute) => {
    const roll = Math.random();
    let newPos = 'midfield';
    let comment = '';
    
    const templates = lang === 'tr' 
      ? [
          "Orta alanda kıyasıya bir top kapma mücadelesi var.",
          "Taç çizgisine yakın bir yerde faul. Hakem oyunu durdurdu.",
          "Orta sahada pas trafiği sürüyor, iki takım da kontrollü.",
          "Köşe vuruşu kullanıldı, savunma topu uzaklaştırıyor.",
          "Hakem faulü işaret ediyor. Sadece sözlü uyarı.",
          "Sol kanattan orta denemesi, kaleci çıkıp topu aldı.",
          "Orta sahada pas hatası, top rakibe geçiyor.",
          "Hızlı hücum fırsatı! Ancak savunma geri dönmeyi başardı.",
          "Tribünler takımlarına büyük bir destek veriyor."
        ]
      : [
          "Intense battle for possession in the midfield.",
          "Foul near the touchline. The referee stops play.",
          "Neat passing in midfield as both teams play cautiously.",
          "Corner kick taken, but the defense clears it away.",
          "Referee blows for a foul. Just a verbal warning.",
          "Cross from the wing, the goalkeeper comfortably catches it.",
          "Turnover in the middle of the pitch.",
          "Counter-attack opportunity, but the defense tracks back quickly.",
          "The crowd is chanting and cheering for their team."
        ];

    if (roll < 0.35) {
      newPos = 'midfield';
      comment = templates[Math.floor(Math.random() * 3)];
    } else if (roll < 0.68) {
      newPos = 'home_attack';
      const p = homeTeam.players[Math.floor(Math.random() * homeTeam.players.length)];
      comment = lang === 'tr' 
        ? `${homeTeam.name} hücumda, ${p.name} pas yollarını arıyor.` 
        : `${homeTeam.name} in attack, ${p.name} is looking to open up space.`;
      
      if (Math.random() < 0.15) {
        setMatchStats(prev => ({ ...prev, cornersHome: prev.cornersHome + 1 }));
        comment = lang === 'tr'
          ? `${p.name} sağ kanattan yüklendi, vuruşu savunmadan korner!`
          : `${p.name} attacks down the right, blocked out for a corner kick!`;
      }
    } else {
      newPos = 'away_attack';
      const p = awayTeam.players[Math.floor(Math.random() * awayTeam.players.length)];
      comment = lang === 'tr' 
        ? `${awayTeam.name} hücumda, ${p.name} topla ilerliyor.` 
        : `${awayTeam.name} in attack, ${p.name} is driving forward.`;
      
      if (Math.random() < 0.15) {
        setMatchStats(prev => ({ ...prev, cornersAway: prev.cornersAway + 1 }));
        comment = lang === 'tr'
          ? `${p.name} ceza sahasına ortaladı, kaleci yumrukladı: Korner!`
          : `${p.name} crosses into the box, punched away: Corner!`;
      }
    }

    if (comment.includes('faul') || comment.includes('Foul') || comment.includes('faulü') || comment.includes('foul')) {
      if (newPos === 'home_attack') {
        setMatchStats(prev => ({ ...prev, foulsAway: prev.foulsAway + 1 }));
      } else {
        setMatchStats(prev => ({ ...prev, foulsHome: prev.foulsHome + 1 }));
      }
    }

    setBallPosition(newPos);
    setDerbyLog(prev => [{ minute, event: comment }, ...prev]);
  };

  const startCardDuel = (minute) => {
    const homeT = selectedSide === 'home' ? userTactic : opponentTactic;
    const awayT = selectedSide === 'away' ? userTactic : opponentTactic;

    let homeMod = 0;
    if (homeT === 'attacking') homeMod += 2;
    if (homeT === 'defensive') homeMod -= 2;

    let awayMod = 0;
    if (awayT === 'attacking') awayMod += 2;
    if (awayT === 'defensive') awayMod -= 2;

    const homePower = homeTeam.ovr + homeMod;
    const awayPower = awayTeam.ovr + awayMod;
    
    let homeAttackChance = homePower;
    if (homeT === 'attacking') homeAttackChance *= 1.15;
    let awayAttackChance = awayPower;
    if (awayT === 'attacking') awayAttackChance *= 1.15;

    const total = homeAttackChance + awayAttackChance;
    const isHomeAttacking = Math.random() < (homeAttackChance / total);

    const attackingTeam = isHomeAttacking ? homeTeam : awayTeam;
    const defendingTeam = isHomeAttacking ? awayTeam : homeTeam;

    const strikers = attackingTeam.players.filter(p => ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(p.position));
    const attacker = strikers.length > 0 
      ? strikers[Math.floor(Math.random() * strikers.length)] 
      : attackingTeam.players[Math.floor(Math.random() * attackingTeam.players.length)];

    const GK = defendingTeam.players.find(p => p.position === 'GK') || defendingTeam.players[defendingTeam.players.length - 1];
    const defenders = defendingTeam.players.filter(p => ['CB', 'LB', 'RB', 'CDM'].includes(p.position));
    
    const defender = (Math.random() < 0.35 || defenders.length === 0)
      ? GK 
      : defenders[Math.floor(Math.random() * defenders.length)];

    setDuelAttacker(attacker);
    setDuelDefender(defender);
    setDuelResult(null);
    setDuelStep('intro');
    setBallPosition(isHomeAttacking ? 'away_attack' : 'home_attack');

    playSynthesizedSound('card_clash', soundEnabled);

    setTimeout(() => {
      setDuelStep('clash');
      
      setTimeout(() => {
        let attRating = attacker.rating;
        let defRating = defender.rating;

        const attackTacticType = isHomeAttacking ? homeT : awayT;
        const defendTacticType = isHomeAttacking ? awayT : homeT;

        if (attackTacticType === 'attacking' && ['ST', 'LW', 'RW'].includes(attacker.position)) {
          attRating += 4;
        } else if (attackTacticType === 'defensive') {
          attRating -= 2;
        }

        if (defendTacticType === 'defensive' && ['GK', 'CB', 'LB', 'RB'].includes(defender.position)) {
          defRating += 4;
        } else if (defendTacticType === 'attacking') {
          defRating -= 2;
        }

        const luck = Math.floor(Math.random() * 7) - 3;
        const finalAttScore = attRating + luck;
        const finalDefScore = defRating;

        let result = 'missed';
        let eventText = '';

        if (finalAttScore > finalDefScore) {
          result = 'goal';
          playSynthesizedSound('goal', soundEnabled);
          
          if (isHomeAttacking) {
            setHomeScore(prev => prev + 1);
            setBallPosition('away_goal');
            setMatchStats(prev => ({ 
              ...prev, 
              shotsHome: prev.shotsHome + 1, 
              shotsTargetHome: prev.shotsTargetHome + 1 
            }));
          } else {
            setAwayScore(prev => prev + 1);
            setBallPosition('home_goal');
            setMatchStats(prev => ({ 
              ...prev, 
              shotsAway: prev.shotsAway + 1, 
              shotsTargetAway: prev.shotsTargetAway + 1 
            }));
          }

          const goals = lang === 'tr' 
            ? [
                `GOOOL! {player} ceza sahasında topla buluştu, kaleciyi çaresiz bıraktı!`,
                `GOOOL! {player} rakibini ekarte edip nefis plaseyle topu ağlara yolladı!`,
                `GOOOL! {player} karşı karşıya pozisyonda fileleri sarstı, tribünler yıkılıyor!`
              ]
            : [
                `GOAL! {player} gets clean through and slips it under the keeper!`,
                `GOAL! {player} curls a brilliant effort past the despairing dive!`,
                `GOAL! {player} smashes it into the net, stadium erupts!`
              ];
          eventText = goals[Math.floor(Math.random() * goals.length)].replace('{player}', attacker.name);

        } else if (finalDefScore - finalAttScore < 4) {
          result = 'saved';
          playSynthesizedSound('whistle_short', soundEnabled);
          setBallPosition('midfield');

          if (isHomeAttacking) {
            setMatchStats(prev => ({ 
              ...prev, 
              shotsHome: prev.shotsHome + 1, 
              shotsTargetHome: prev.shotsTargetHome + 1,
              savesAway: prev.savesAway + 1 
            }));
          } else {
            setMatchStats(prev => ({ 
              ...prev, 
              shotsAway: prev.shotsAway + 1, 
              shotsTargetAway: prev.shotsTargetAway + 1,
              savesHome: prev.savesHome + 1 
            }));
          }

          if (defender.position === 'GK') {
            eventText = lang === 'tr'
              ? `ŞUT! Kaleci {defender} parmaklarının ucuyla topu kornere çelmeyi başardı!`
              : `SHOT! Goalkeeper {defender} tips it over the bar with a magnificent reflex save!`;
          } else {
            eventText = lang === 'tr'
              ? `ŞUT! Savunmada {defender} kritik bir müdahaleyle topa siper oldu!`
              : `SHOT! Defender {defender} slides in with a heroic goal-bound block!`;
          }
          eventText = eventText.replace('{defender}', defender.name);

        } else {
          result = 'missed';
          playSynthesizedSound('whistle_short', soundEnabled);
          setBallPosition('midfield');

          if (isHomeAttacking) {
            setMatchStats(prev => ({ ...prev, shotsHome: prev.shotsHome + 1 }));
          } else {
            setMatchStats(prev => ({ ...prev, shotsAway: prev.shotsAway + 1 }));
          }

          const misses = lang === 'tr'
            ? [
                `ŞUT! {player} şansını denedi ancak top direkte patlayıp dışarı çıktı.`,
                `ŞUT! {player} ceza sahası dışından sert vurdu, top dışarıda.`,
                `KAÇTI! {player} kaleciyle karşı karşıya kaldı ancak çerçeveyi bulamadı!`
              ]
            : [
                `SHOT! {player} shoots but it rattles the outside of the post and goes out.`,
                `SHOT! {player} lets fly from distance but it sails high into the stand.`,
                `CHANCE! {player} goes one-on-one but pushes it wide of the mark!`
              ];
          eventText = misses[Math.floor(Math.random() * misses.length)].replace('{player}', attacker.name);
        }

        setDuelResult(result);
        setDuelStep('result');
        setDerbyLog(prev => [{ minute, event: eventText }, ...prev]);

        setTimeout(() => {
          setDuelStep(null);
          setDuelAttacker(null);
          setDuelDefender(null);
          setDuelResult(null);
          setBallPosition('midfield');
        }, 2100);

      }, 1000);

    }, 1200);
  };

  const startCriticalMoment = (momentNumber, minute) => {
    let sc = null;
    const myTeam = selectedSide === 'home' ? homeTeam : awayTeam;
    const oppTeam = selectedSide === 'home' ? awayTeam : homeTeam;

    if (momentNumber === 1) {
      if (Math.random() < 0.5) {
        const strikers = myTeam.players.filter(p => ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(p.position));
        const shooter = strikers.length > 0 ? strikers[0] : myTeam.players[0];

        sc = {
          type: 'freekick',
          minute,
          title: lang === 'tr' ? 'Tehlikeli Serbest Vuruş!' : 'Dangerous Free Kick!',
          desc: lang === 'tr' 
            ? `Ceza sahası yayının hemen dışından serbest vuruş kazandın! Topun gerisinde ${shooter.name} var. Nasıl bir şut çekeceksin?`
            : `You won a free kick right outside the box! ${shooter.name} stands over the ball. How will you execute it?`,
          shooter,
          options: [
            { id: 'curve', label: lang === 'tr' ? 'Barajın Üstünden Kavisli' : 'Curved Over the Wall' },
            { id: 'under', label: lang === 'tr' ? 'Barajın Altından Akıllıca' : 'Under the Wall (Sneaky)' },
            { id: 'power', label: lang === 'tr' ? 'Kaleci Köşesine Sert Şut' : 'Power Shot to GK Corner' }
          ]
        };
      } else {
        const defenders = myTeam.players.filter(p => ['CB', 'LB', 'RB', 'CDM'].includes(p.position));
        const defender = defenders.length > 0 ? defenders[0] : myTeam.players[5];
        const oppStrikers = oppTeam.players.filter(p => ['ST', 'LW', 'RW'].includes(p.position));
        const oppAttacker = oppStrikers.length > 0 ? oppStrikers[0] : oppTeam.players[0];

        sc = {
          type: 'defense',
          minute,
          title: lang === 'tr' ? 'Savunmada Tehlike!' : 'Defensive Crisis!',
          desc: lang === 'tr' 
            ? `Rakip santrafor ${oppAttacker.name} hızla ceza sahana sarktı! Stoperin ${defender.name} ile nasıl bir müdahale yapacaksın?`
            : `Opponent striker ${oppAttacker.name} is clean through! How will your defender ${defender.name} respond?`,
          defender,
          oppAttacker,
          options: [
            { id: 'slide', label: lang === 'tr' ? 'Kayarak Müdahale (Yüksek Risk)' : 'Slide Tackle (High Risk)' },
            { id: 'contain', label: lang === 'tr' ? 'Ayakta Kalarak Pozisyon Al' : 'Jockey / Stand Ground' },
            { id: 'tactical', label: lang === 'tr' ? 'Taktiksel Faul Yap (Kart Riski)' : 'Tactical Foul (Card Risk)' }
          ]
        };
      }
    } else {
      if (Math.random() < 0.5) {
        const strikers = myTeam.players.filter(p => ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
        const shooter = strikers.length > 0 ? strikers[0] : myTeam.players[0];

        sc = {
          type: 'penalty',
          minute,
          title: lang === 'tr' ? 'PENALTI KAZANDIN!' : 'PENALTY KICK!',
          desc: lang === 'tr'
            ? `Rakip ceza sahasında yaşanan mücadelede penaltı noktası gösterildi! Topun başında ${shooter.name} var. Köşeni belirle:`
            : `A foul in the penalty box awards you a penalty! ${shooter.name} takes the ball. Choose your direction:`,
          shooter,
          options: [
            { id: 'left', label: lang === 'tr' ? 'Sol Alt Köşe (Plase)' : 'Bottom Left (Placed)' },
            { id: 'center', label: lang === 'tr' ? 'Orta (Panenka)' : 'Center (Panenka)' },
            { id: 'right', label: lang === 'tr' ? 'Sağ Üst Köşe (Sert)' : 'Top Right (Power)' }
          ]
        };
      } else {
        const strikers = myTeam.players.filter(p => ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
        const shooter = strikers.length > 0 ? strikers[0] : myTeam.players[0];

        sc = {
          type: 'counter',
          minute,
          title: lang === 'tr' ? 'Hızlı Hücum Fırsatı!' : 'Counter-Attack Chance!',
          desc: lang === 'tr'
            ? `80'inci dakika, 2'ye 1 kontra atak yakaladın! ${shooter.name} topu sürüyor. Kararın ne?`
            : `80th minute, a 2-on-1 counter attack! ${shooter.name} drives into the final third. What will you do?`,
          shooter,
          options: [
            { id: 'pass', label: lang === 'tr' ? 'Boştaki Arkadaşına Pas Ver' : 'Pass to open teammate' },
            { id: 'chip', label: lang === 'tr' ? 'Kaleci Açıldı, Aşırtma Şut' : 'Chip the advancing keeper' },
            { id: 'shoot', label: lang === 'tr' ? 'Köşeye Sert Şut Çek' : 'Blast it into the corner' }
          ]
        };
      }
    }

    setCriticalMoment(sc);
    setCriticalResult(null);
  };

  const handleSelectCriticalOption = (optionId) => {
    playSynthesizedSound('click', soundEnabled);
    let isGoal = false;
    let commentText = '';
    const myTeam = selectedSide === 'home' ? homeTeam : awayTeam;
    const oppTeam = selectedSide === 'home' ? awayTeam : homeTeam;

    if (criticalMoment.type === 'penalty') {
      const dives = ['left', 'center', 'right'];
      const gkDive = dives[Math.floor(Math.random() * dives.length)];
      
      if (optionId !== gkDive) {
        isGoal = true;
        commentText = lang === 'tr'
          ? `GOOOL! ${criticalMoment.shooter.name} soğukkanlı vurarak topu ağlara yolladı! Kaleci ters köşeye gitti.`
          : `GOAL! ${criticalMoment.shooter.name} converts the penalty cleanly, sending the keeper the wrong way!`;
      } else {
        commentText = lang === 'tr'
          ? `KAÇTI! Kaleci ${oppTeam.players.find(p => p.position === 'GK')?.name || 'GK'} köşeyi doğru tahmin etti ve penaltıyı kurtardı!`
          : `SAVED! Goalkeeper ${oppTeam.players.find(p => p.position === 'GK')?.name || 'GK'} dives correctly to save the penalty!`;
      }

      if (selectedSide === 'home') {
        setMatchStats(prev => ({ 
          ...prev, 
          shotsHome: prev.shotsHome + 1, 
          shotsTargetHome: prev.shotsTargetHome + 1,
          savesAway: isGoal ? prev.savesAway : prev.savesAway + 1
        }));
      } else {
        setMatchStats(prev => ({ 
          ...prev, 
          shotsAway: prev.shotsAway + 1, 
          shotsTargetAway: prev.shotsTargetAway + 1,
          savesHome: isGoal ? prev.savesHome : prev.savesHome + 1
        }));
      }

      if (isGoal) {
        playSynthesizedSound('goal', soundEnabled);
        if (selectedSide === 'home') {
          setHomeScore(prev => prev + 1);
          setBallPosition('away_goal');
        } else {
          setAwayScore(prev => prev + 1);
          setBallPosition('home_goal');
        }
      } else {
        playSynthesizedSound('whistle_short', soundEnabled);
      }

    } else if (criticalMoment.type === 'freekick') {
      let chance = 0.5;
      if (optionId === 'curve') {
        chance = criticalMoment.shooter.rating > 83 ? 0.65 : 0.45;
      } else if (optionId === 'under') {
        chance = 0.4;
      } else {
        chance = userTactic === 'attacking' ? 0.6 : 0.45;
      }

      isGoal = Math.random() < chance;

      if (isGoal) {
        commentText = lang === 'tr'
          ? `MÜKEMMEL GOL! ${criticalMoment.shooter.name} barajın üstünden aşırttı, doksana çarpan top içeride!`
          : `SPLENDID GOAL! ${criticalMoment.shooter.name} curls a sensational free kick over the wall and into the top corner!`;
      } else {
        commentText = lang === 'tr'
          ? `KAÇTI! ${criticalMoment.shooter.name}'in şutu barajdan sekti, savunma uzaklaştırdı.`
          : `BLOCKED! ${criticalMoment.shooter.name}'s shot is blocked by the wall and cleared away.`;
      }

      if (selectedSide === 'home') {
        setMatchStats(prev => ({ ...prev, shotsHome: prev.shotsHome + 1, shotsTargetHome: isGoal ? prev.shotsTargetHome + 1 : prev.shotsTargetHome }));
      } else {
        setMatchStats(prev => ({ ...prev, shotsAway: prev.shotsAway + 1, shotsTargetAway: isGoal ? prev.shotsTargetAway + 1 : prev.shotsTargetAway }));
      }

      if (isGoal) {
        playSynthesizedSound('goal', soundEnabled);
        if (selectedSide === 'home') {
          setHomeScore(prev => prev + 1);
          setBallPosition('away_goal');
        } else {
          setAwayScore(prev => prev + 1);
          setBallPosition('home_goal');
        }
      } else {
        playSynthesizedSound('whistle_short', soundEnabled);
      }

    } else if (criticalMoment.type === 'defense') {
      if (optionId === 'slide') {
        if (Math.random() < 0.7) {
          commentText = lang === 'tr'
            ? `MUHTEŞEM MÜDAHALE! ${criticalMoment.defender.name} kayarak zamanında girdi ve topu kazandı!`
            : `STUNNING TACKLE! ${criticalMoment.defender.name} executes a clean slide tackle to dispossess the striker!`;
        } else {
          const oppGoal = Math.random() < 0.75;
          isGoal = oppGoal;
          
          if (oppGoal) {
            commentText = lang === 'tr'
              ? `PENALTI VE HATA! ${criticalMoment.defender.name} rakibi biçti. Hakem penaltı çaldı ve rakip penaltıyı gole çevirdi!`
              : `PENALTY! ${criticalMoment.defender.name} misses the ball and fouls the striker. Opponent scores the penalty!`;
          } else {
            commentText = lang === 'tr'
              ? `PENALTI! ${criticalMoment.defender.name} geç kaldı, penaltı. Ancak rakip penaltı şutunu dışarı attı!`
              : `PENALTY! ${criticalMoment.defender.name} commits a foul. Fortunately, the opponent fires it wide!`;
          }

          if (selectedSide === 'home') {
            setMatchStats(prev => ({ 
              ...prev, 
              foulsHome: prev.foulsHome + 1,
              shotsAway: prev.shotsAway + 1,
              shotsTargetAway: prev.shotsTargetAway + 1
            }));
          } else {
            setMatchStats(prev => ({ 
              ...prev, 
              foulsAway: prev.foulsAway + 1,
              shotsHome: prev.shotsHome + 1,
              shotsTargetHome: prev.shotsTargetHome + 1
            }));
          }
        }
      } else if (optionId === 'contain') {
        if (Math.random() < 0.45) {
          commentText = lang === 'tr'
            ? `SAVUNMA YAPILDI! ${criticalMoment.defender.name} ayakta kaldı, rakibi oyalayarak tehlikeyi uzaklaştırdı.`
            : `GREAT CONTAINMENT! ${criticalMoment.defender.name} stands his ground, slowing the attack and winning the ball.`;
        } else {
          const oppGoal = Math.random() < 0.55;
          isGoal = oppGoal;

          if (oppGoal) {
            commentText = lang === 'tr'
              ? `GOL! ${criticalMoment.oppAttacker.name} vücut çalımıyla önünü boşalttı ve şık bir şutla golünü attı!`
              : `GOAL! ${criticalMoment.oppAttacker.name} bypasses your defender and places it past your keeper!`;
          } else {
            commentText = lang === 'tr'
              ? `KALECİ KURTARDI! ${criticalMoment.oppAttacker.name} vurdu fakat kalecin harika çıkardı!`
              : `SAVE! ${criticalMoment.oppAttacker.name} strikes, but your goalkeeper beats it away!`;
            
            if (selectedSide === 'home') {
              setMatchStats(prev => ({ ...prev, savesHome: prev.savesHome + 1 }));
            } else {
              setMatchStats(prev => ({ ...prev, savesAway: prev.savesAway + 1 }));
            }
          }

          if (selectedSide === 'home') {
            setMatchStats(prev => ({ ...prev, shotsAway: prev.shotsAway + 1, shotsTargetAway: prev.shotsTargetAway + 1 }));
          } else {
            setMatchStats(prev => ({ ...prev, shotsHome: prev.shotsHome + 1, shotsTargetHome: prev.shotsTargetHome + 1 }));
          }
        }
      } else {
        const oppGoal = Math.random() < 0.45;
        isGoal = oppGoal;
        
        if (oppGoal) {
          commentText = lang === 'tr'
            ? `TAKTIKSEL FAUL! Sarı kart çıktı. Rakip frikikten barajın üstünden topu ağlara yolladı!`
            : `TACTICAL FOUL! Defender is yellow-carded. Opponent scores a curling free kick from the resulting set-piece!`;
        } else {
          commentText = lang === 'tr'
            ? `TAKTIKSEL FAUL! Sarı kart çıktı. Frikikte top baraja çarpıp doğrudan dışarı gitti.`
            : `TACTICAL FOUL! Defender is yellow-carded. The free kick hits the wall and goes out.`;
        }

        if (selectedSide === 'home') {
          setMatchStats(prev => ({ 
            ...prev, 
            foulsHome: prev.foulsHome + 1,
            shotsAway: prev.shotsAway + 1,
            shotsTargetAway: oppGoal ? prev.shotsTargetAway + 1 : prev.shotsTargetAway
          }));
        } else {
          setMatchStats(prev => ({ 
            ...prev, 
            foulsAway: prev.foulsAway + 1,
            shotsHome: prev.shotsHome + 1,
            shotsTargetHome: oppGoal ? prev.shotsTargetHome + 1 : prev.shotsTargetHome
          }));
        }
      }

      if (isGoal) {
        playSynthesizedSound('goal', soundEnabled);
        if (selectedSide === 'home') {
          setAwayScore(prev => prev + 1);
          setBallPosition('home_goal');
        } else {
          setHomeScore(prev => prev + 1);
          setBallPosition('away_goal');
        }
      } else {
        playSynthesizedSound('whistle_short', soundEnabled);
      }

    } else if (criticalMoment.type === 'counter') {
      let chance = 0.55;
      if (optionId === 'pass') {
        chance = myTeam.chem > 25 ? 0.75 : 0.45;
      } else if (optionId === 'chip') {
        chance = criticalMoment.shooter.rating > 83 ? 0.65 : 0.4;
      } else {
        chance = 0.55;
      }

      isGoal = Math.random() < chance;

      if (isGoal) {
        commentText = lang === 'tr'
          ? `BİTİRİCİ VURUŞ! ${criticalMoment.shooter.name} karşı karşıya pozisyonda kaleciyi mağlup etti!`
          : `CLINICAL FINISH! ${criticalMoment.shooter.name} runs through and slots it into the bottom corner!`;
      } else {
        commentText = lang === 'tr'
          ? `FIRSAT KAÇTI! ${criticalMoment.shooter.name}'in şutunu kaleci son anda ayağıyla çıkardı.`
          : `CHANCE MISSED! ${criticalMoment.shooter.name}'s shot is blocked by the goalkeeper's trailing leg.`;
        
        if (selectedSide === 'home') {
          setMatchStats(prev => ({ ...prev, savesAway: prev.savesAway + 1 }));
        } else {
          setMatchStats(prev => ({ ...prev, savesHome: prev.savesHome + 1 }));
        }
      }

      if (selectedSide === 'home') {
        setHomeScore(prev => isGoal ? prev + 1 : prev);
        setBallPosition(isGoal ? 'away_goal' : 'midfield');
        setMatchStats(prev => ({ 
          ...prev, 
          shotsHome: prev.shotsHome + 1, 
          shotsTargetHome: isGoal ? prev.shotsTargetHome + 1 : prev.shotsTargetHome 
        }));
      } else {
        setAwayScore(prev => isGoal ? prev + 1 : prev);
        setBallPosition(isGoal ? 'home_goal' : 'midfield');
        setMatchStats(prev => ({ 
          ...prev, 
          shotsAway: prev.shotsAway + 1, 
          shotsTargetAway: isGoal ? prev.shotsTargetAway + 1 : prev.shotsTargetAway 
        }));
      }

      if (isGoal) {
        playSynthesizedSound('goal', soundEnabled);
      } else {
        playSynthesizedSound('whistle_short', soundEnabled);
      }
    }

    setCriticalResult(commentText);
    setDerbyLog(prev => [{ minute: criticalMoment.minute, event: commentText }, ...prev]);
  };

  const calculateDerbyRewards = () => {
    const userWon = (selectedSide === 'home' && homeScore > awayScore) || 
                    (selectedSide === 'away' && awayScore > homeScore);
    const draw = homeScore === awayScore;

    let base = 25;
    if (userWon) base = 120;
    else if (draw) base = 50;
    else base = 25;

    const chosenMultiplier = selectedSide === 'home' ? homeTeam.reward : awayTeam.reward;
    const finalReward = Math.floor(base * (chosenMultiplier || 1.0));
    
    setRewardCoins(finalReward);
    onUpdateCoins(coins + finalReward);
  };

  const handleCloseDerby = () => {
    setMatchStep('setup');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <style>{`
        .derby-pitch {
          width: 100%;
          height: 280px;
          background: #14532d;
          background-image: linear-gradient(to bottom, #1b5e20, #0f5113);
          border: 4px solid #1f2937;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          margin-bottom: 1.25rem;
          box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5);
        }
        .pitch-turf-stripes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.03),
            rgba(255,255,255,0.03) 6.25%,
            transparent 6.25%,
            transparent 12.5%
          );
          pointer-events: none;
          z-index: 1;
        }
        .pitch-attack-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 1;
        }
        .pulse-home-attack {
          opacity: 1;
          background: linear-gradient(90deg, transparent 30%, rgba(16, 185, 129, 0.08) 100%);
          animation: pulse-overlay 1.2s infinite alternate;
        }
        .pulse-away-attack {
          opacity: 1;
          background: linear-gradient(270deg, transparent 30%, rgba(239, 68, 68, 0.08) 100%);
          animation: pulse-overlay 1.2s infinite alternate;
        }
        @keyframes pulse-overlay {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .pitch-team-logo-bg {
          position: absolute;
          font-weight: 900;
          font-size: 5rem;
          color: rgba(255,255,255,0.05);
          text-transform: uppercase;
          pointer-events: none;
          user-select: none;
          z-index: 1;
          font-family: sans-serif;
        }
        .pitch-team-logo-left {
          left: 10%;
          top: 50%;
          transform: translateY(-50%);
        }
        .pitch-team-logo-right {
          right: 10%;
          top: 50%;
          transform: translateY(-50%);
        }
        .pitch-ball {
          width: 18px;
          height: 18px;
          background-color: #fff;
          border: 2px solid #111;
          border-radius: 50%;
          position: absolute;
          transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.6), 0 0 15px #fbbf24;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          line-height: 1;
        }
        .pitch-stadium-name {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.65rem;
          color: rgba(255,255,255,0.5);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          background-color: rgba(0,0,0,0.4);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          pointer-events: none;
          z-index: 3;
        }
        .duel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(3, 7, 18, 0.92);
          backdrop-filter: blur(5px);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          animation: fade-in 0.3s forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .duel-card-container {
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 100%;
          max-width: 440px;
          margin-top: 0.5rem;
        }
        .duel-vs {
          font-size: 2.25rem;
          font-weight: 950;
          color: var(--accent-gold);
          text-shadow: 0 0 15px rgba(226, 183, 75, 0.8);
          font-style: italic;
          z-index: 20;
          animation: scale-up-down 1.2s infinite ease-in-out;
        }
        @keyframes scale-up-down {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .duel-card {
          width: 120px;
          height: 180px;
          border-radius: 10px;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          transition: transform 0.5s;
        }
        .duel-card.attacker {
          transform: translateX(-150%);
          animation: slide-in-attacker 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .duel-card.defender {
          transform: translateX(150%);
          animation: slide-in-defender 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes slide-in-attacker {
          to { transform: translateX(0); }
        }
        @keyframes slide-in-defender {
          to { transform: translateX(0); }
        }
        .duel-card.clash {
          animation: shake 0.5s infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(2px, -2px) rotate(1deg); }
          50% { transform: translate(-2px, 2px) rotate(-1deg); }
          75% { transform: translate(1px, -1px) rotate(0.5deg); }
        }
        .duel-result-banner {
          font-size: 2.25rem;
          font-weight: 950;
          margin-top: 1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .flag-round {
          width: 16px;
          height: 11px;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
      `}</style>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '950', color: 'var(--accent-gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Play size={24} style={{ color: '#10b981' }} />
            <span>{t.playMatch || 'Match Simulation'}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {lang === 'tr' 
              ? 'Taktiklerini belirle, derbi maçlarında mücadele et ve jeton kazan!' 
              : 'Set your tactics, compete in derby matches, and win gold coins!'}
          </p>
        </div>
      </div>

      {/* SETUP SCREEN */}
      {matchStep === 'setup' && (
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
            {lang === 'tr' 
              ? 'Oynamak istediğiniz takımları seçip derbi heyecanını başlatın! Jeton kazanmak için temsil edeceğiniz tarafı belirleyin.'
              : 'Choose the teams and start the derby action! Choose the side you represent to win coins.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Home Team Selector */}
            <div>
              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                {lang === 'tr' ? '1. Takım (Ev Sahibi)' : 'Home Team'}
              </label>
              <select 
                className="form-input"
                value={homeTeam.id}
                onChange={(e) => setHomeTeam(availableSquadsForDerby.find(s => s.id === e.target.value))}
                style={{ cursor: 'pointer', padding: '0.75rem' }}
              >
                {availableSquadsForDerby.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.ovr} OVR)</option>
                ))}
              </select>
            </div>

            {/* Away Team Selector */}
            <div>
              <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                {lang === 'tr' ? '2. Takım (Deplasman)' : 'Away Team'}
              </label>
              <select 
                className="form-input"
                value={awayTeam.id}
                onChange={(e) => setAwayTeam(availableSquadsForDerby.find(s => s.id === e.target.value))}
                style={{ cursor: 'pointer', padding: '0.75rem' }}
              >
                {availableSquadsForDerby.map(s => (
                  <option key={s.id} value={s.id} disabled={s.id === homeTeam.id}>{s.name} ({s.ovr} OVR)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Side Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {lang === 'tr' ? 'Temsil Edeceğin Tarafı Seç (Jeton Ödülü İçin)' : 'Choose the Side You Represent'}
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className={selectedSide === 'home' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => { playSynthesizedSound('click', soundEnabled); setSelectedSide('home'); }}
                style={{ flexGrow: 1, justifyContent: 'center', padding: '0.75rem' }}
              >
                {homeTeam.name}
              </button>
              <button 
                className={selectedSide === 'away' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => { playSynthesizedSound('click', soundEnabled); setSelectedSide('away'); }}
                style={{ flexGrow: 1, justifyContent: 'center', padding: '0.75rem' }}
              >
                {awayTeam.name}
              </button>
            </div>
          </div>

          {/* TACTICS & SOUND SETTINGS */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {lang === 'tr' ? 'MAÇ STRATEJİSİ' : 'MATCH TACTIC'}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['balanced', 'attacking', 'defensive'].map(tac => (
                  <button
                    key={tac}
                    className="btn-secondary"
                    onClick={() => { playSynthesizedSound('click', soundEnabled); setUserTactic(tac); }}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      fontSize: '0.75rem',
                      flexGrow: 1,
                      textTransform: 'uppercase',
                      backgroundColor: userTactic === tac ? 'var(--accent-gold)' : '',
                      color: userTactic === tac ? '#111827' : '',
                      borderColor: userTactic === tac ? 'var(--accent-gold)' : ''
                    }}
                  >
                    {tac === 'balanced' ? (lang === 'tr' ? 'Dengeli' : 'Balanced') :
                     tac === 'attacking' ? (lang === 'tr' ? 'Hücum' : 'Attacking') :
                     (lang === 'tr' ? 'Savunma' : 'Defensive')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
              <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 'bold' }}>
                {lang === 'tr' ? 'SES' : 'SOUND'}
              </span>
              <button
                className="btn-secondary"
                onClick={() => setSoundEnabled(prev => !prev)}
                style={{ padding: '0.5rem 1rem' }}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleStartDerby}
            disabled={homeTeam.id === awayTeam.id}
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: '1rem' }}
          >
            <Play size={18} />
            <span>{lang === 'tr' ? 'Derbiyi Başlat!' : 'Start Derby!'}</span>
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {matchStep === 'playing' && (
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', position: 'relative' }}>
          
          {/* Scoreboard */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.25rem', position: 'relative' }}>
            
            {/* Sound Switcher */}
            <button 
              onClick={() => setSoundEnabled(prev => !prev)}
              style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <div style={{ textAlign: 'center', width: '38%' }}>
              <span style={{ 
                fontSize: '0.65rem', 
                backgroundColor: selectedSide === 'home' ? 'rgba(226,183,75,0.15)' : 'transparent',
                color: selectedSide === 'home' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                {selectedSide === 'home' ? (lang==='tr'?'SENİN TAKIMIN':'YOUR SIDE') : ''}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', display: 'block', marginTop: '0.25rem', color: homeTeam.color }}>
                {homeTeam.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Tactic: {selectedSide === 'home' ? userTactic : opponentTactic}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
              <span className="glow-gold" style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', fontWeight: '900', letterSpacing: '1px' }}>
                {simTimer}'
              </span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '2px', color: 'var(--text-primary)', margin: '0.1rem 0' }}>
                {homeScore} - {awayScore}
              </span>
            </div>

            <div style={{ textAlign: 'center', width: '38%' }}>
              <span style={{ 
                fontSize: '0.65rem', 
                backgroundColor: selectedSide === 'away' ? 'rgba(226,183,75,0.15)' : 'transparent',
                color: selectedSide === 'away' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                {selectedSide === 'away' ? (lang==='tr'?'SENİN TAKIMIN':'YOUR SIDE') : ''}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', display: 'block', marginTop: '0.25rem', color: awayTeam.color }}>
                {awayTeam.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Tactic: {selectedSide === 'away' ? userTactic : opponentTactic}
              </span>
            </div>

          </div>

          {/* VISUAL FIELD PITCH ARENA */}
          <div className="derby-pitch">
            {/* Turf stripes */}
            <div className="pitch-turf-stripes"></div>

            {/* Attack overlay pulse */}
            <div className={`pitch-attack-overlay ${
              ballPosition === 'home_attack' || ballPosition === 'home_goal' ? 'pulse-away-attack' : 
              ballPosition === 'away_attack' || ballPosition === 'away_goal' ? 'pulse-home-attack' : ''
            }`}></div>

            {/* SVG Markings */}
            <svg viewBox="0 0 800 300" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
              {/* Outer Boundary */}
              <rect x="15" y="15" width="770" height="270" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
              
              {/* Center Line */}
              <line x1="400" y1="15" x2="400" y2="285" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
              
              {/* Center Circle */}
              <circle cx="400" cy="150" r="50" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
              <circle cx="400" cy="150" r="4" fill="rgba(255,255,255,0.7)" />
              
              {/* Left Penalty Area */}
              <rect x="15" y="65" width="110" height="170" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
              {/* Left Goal Area */}
              <rect x="15" y="115" width="40" height="70" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
              {/* Left Penalty Spot */}
              <circle cx="95" cy="150" r="3" fill="rgba(255,255,255,0.7)" />
              {/* Left Penalty Arc */}
              <path d="M 125 120 A 50 50 0 0 1 125 180" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />

              {/* Right Penalty Area */}
              <rect x="675" y="65" width="110" height="170" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
              {/* Right Goal Area */}
              <rect x="745" y="115" width="40" height="70" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
              {/* Right Penalty Spot */}
              <circle cx="705" cy="150" r="3" fill="rgba(255,255,255,0.7)" />
              {/* Right Penalty Arc */}
              <path d="M 675 120 A 50 50 0 0 0 675 180" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />

              {/* Corner Arcs */}
              <path d="M 15 30 A 15 15 0 0 1 30 15" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
              <path d="M 30 285 A 15 15 0 0 1 15 270" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
              <path d="M 770 15 A 15 15 0 0 1 785 30" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
              <path d="M 785 270 A 15 15 0 0 1 770 285" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />

              {/* Left Goal Net */}
              <rect x="2" y="125" width="13" height="50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
              {/* Right Goal Net */}
              <rect x="785" y="125" width="13" height="50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
            </svg>

            {/* Team Logos as Watermarks */}
            <div className="pitch-team-logo-bg pitch-team-logo-left">
              {homeTeam.logo}
            </div>
            <div className="pitch-team-logo-bg pitch-team-logo-right">
              {awayTeam.logo}
            </div>

            {/* Interactive Moving Ball */}
            <div 
              className="pitch-ball" 
              style={{ 
                left: ballPosition === 'home_goal' ? '2.5%' :
                      ballPosition === 'home_attack' ? '22%' :
                      ballPosition === 'midfield' ? '50%' :
                      ballPosition === 'away_attack' ? '78%' : '97.5%',
                top: ballPosition === 'midfield' ? '50%' :
                     ballPosition === 'home_goal' || ballPosition === 'away_goal' ? '50%' :
                     ballPosition === 'home_attack' ? '40%' : '60%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              ⚽
            </div>

            <span className="pitch-stadium-name">
              🏟️ {homeTeam.stadium || 'FUT Arena'}
            </span>
          </div>

          {/* Live Log Ticker */}
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '800', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.matchPlaying || 'Match in progress...'}:
            </span>
            <div style={{ height: '200px', overflowY: 'auto', backgroundColor: '#030712', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {derbyLog.map((log, index) => {
                const isGoal = log.event.includes('GOL') || log.event.toUpperCase().includes('GOAL');
                const isWhistle = log.event.includes('Başladı') || log.event.includes('Sona Erdi') || log.event.includes('whistle') || log.event.includes('Half-time');
                return (
                  <div 
                    key={index} 
                    style={{ 
                      borderLeft: `3px solid ${isGoal ? 'var(--accent-gold)' : isWhistle ? '#3b82f6' : index === 0 ? '#10b981' : 'transparent'}`,
                      paddingLeft: '0.6rem',
                      color: isGoal ? 'var(--accent-gold)' : index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isGoal || index === 0 ? 'bold' : 'normal',
                      fontSize: index === 0 ? '0.95rem' : '0.85rem'
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: '0.5rem', fontFamily: 'monospace' }}>[{log.minute}']</span>
                    <span>{log.event}</span>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* HALFTIME SCREEN OVERLAY */}
          {isHalftime && (
            <div className="duel-overlay">
              <div className="glass-panel" style={{ maxWidth: '380px', width: '90%', padding: '1.5rem', textAlign: 'center', border: '1px solid var(--accent-gold)' }}>
                <h3 className="glow-gold" style={{ fontSize: '1.5rem', fontWeight: '950', color: 'var(--accent-gold)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                  {lang === 'tr' ? 'DEVRE ARASI' : 'HALF-TIME'}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                    <span>{homeTeam.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{lang === 'tr' ? 'İSTATİSTİK' : 'STATS'}</span>
                    <span>{awayTeam.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{matchStats.possessionHome}%</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Topa Sahip Olma' : 'Possession'}</span>
                    <span>{matchStats.possessionAway}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{matchStats.shotsHome}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Toplam Şut' : 'Shots'}</span>
                    <span>{matchStats.shotsAway}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{matchStats.shotsTargetHome}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Kaleyi Bulan' : 'Shots on Target'}</span>
                    <span>{matchStats.shotsTargetAway}</span>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => { playSynthesizedSound('whistle', soundEnabled); setIsHalftime(false); }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>{lang === 'tr' ? '2. Yarıyı Başlat' : 'Start 2nd Half'}</span>
                </button>
              </div>
            </div>
          )}

          {/* DYNAMIC CARD DUEL OVERLAY */}
          {duelStep && (
            <div className="duel-overlay">
              <span className="glow-gold" style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                {lang === 'tr' ? 'OYUNCU DÜELLOSU' : 'PLAYER FACE-OFF'}
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                {duelAttacker?.position} VS {duelDefender?.position}
              </p>

              <div className="duel-card-container">
                <DuelCard player={duelAttacker} team={duelAttacker === homeTeam.players.find(p=>p.name===duelAttacker.name)?homeTeam:awayTeam} role="attacker" isClashing={duelStep === 'clash'} />
                <div className="duel-vs">VS</div>
                <DuelCard player={duelDefender} team={duelDefender === homeTeam.players.find(p=>p.name===duelDefender.name)?homeTeam:awayTeam} role="defender" isClashing={duelStep === 'clash'} />
              </div>

              {duelStep === 'result' && (
                <div 
                  className="duel-result-banner"
                  style={{ 
                    color: duelResult === 'goal' ? 'var(--accent-gold)' : duelResult === 'saved' ? '#3b82f6' : '#94a3b8',
                    textShadow: duelResult === 'goal' ? '0 0 15px rgba(226,183,75,0.7)' : 'none'
                  }}
                >
                  {duelResult === 'goal' ? (lang === 'tr' ? '⚽ GOL!' : '⚽ GOAL!') :
                   duelResult === 'saved' ? (lang === 'tr' ? '🧤 KURTARIŞ!' : '🧤 SAVED!') :
                   (lang === 'tr' ? '❌ DIŞARIDA!' : '❌ OUT!')}
                </div>
              )}
            </div>
          )}

          {/* INTERACTIVE CRITICAL MOMENT OVERLAY */}
          {criticalMoment && (
            <div className="duel-overlay">
              <div className="glass-panel" style={{ maxWidth: '440px', width: '92%', padding: '1.5rem', border: '2px solid var(--accent-gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Sparkles size={18} color="var(--accent-gold)" className="animate-pulse" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '950', color: 'var(--accent-gold)', textTransform: 'uppercase', margin: 0 }}>
                    {criticalMoment.title}
                  </h4>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  {criticalMoment.desc}
                </p>

                {criticalResult === null ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {criticalMoment.options.map(opt => (
                      <button
                        key={opt.id}
                        className="btn-secondary"
                        onClick={() => handleSelectCriticalOption(opt.id)}
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem', transition: 'all 0.2s', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        <span style={{ fontWeight: '800', marginRight: '0.5rem', color: 'var(--accent-gold)' }}>▶</span>
                        <span style={{ fontSize: '0.8rem' }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem', backgroundColor: '#030712' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '800', color: criticalResult.includes('GOL') || criticalResult.includes('GOAL') ? 'var(--accent-gold)' : 'var(--text-primary)', margin: 0 }}>
                        {criticalResult}
                      </p>
                    </div>
                    
                    <button
                      className="btn-primary"
                      onClick={() => { playSynthesizedSound('click', soundEnabled); setCriticalMoment(null); setCriticalResult(null); }}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>{lang === 'tr' ? 'Maça Geri Dön' : 'Return to Match'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* RESULT SCREEN */}
      {matchStep === 'result' && (
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏆</div>
          
          <h3 className="glow-gold" style={{ fontSize: '2rem', fontWeight: '950', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
            {((selectedSide === 'home' && homeScore > awayScore) || (selectedSide === 'away' && awayScore > homeScore))
              ? (lang === 'tr' ? 'Derbiyi Kazandın!' : 'Derby Won!') 
              : homeScore === awayScore 
                ? (lang === 'tr' ? 'Beraberlik!' : 'Draw!') 
                : (lang === 'tr' ? 'Derbiyi Kaybettin!' : 'Derby Lost!')}
          </h3>
          
          <div style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '4px', margin: '1rem 0', color: 'var(--text-primary)' }}>
            {homeScore} - {awayScore}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {homeTeam.name} vs {awayTeam.name} {lang === 'tr' ? 'derbi maçı tamamlandı.' : 'derby match has finished.'}
          </p>

          {/* POST-MATCH STATISTICS */}
          <div className="glass-panel" style={{ maxWidth: '440px', margin: '0 auto 1.5rem auto', border: '1px solid var(--border-color)', padding: '1rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)' }}>
            <h4 style={{ fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', letterSpacing: '1px' }}>
              {lang === 'tr' ? 'MAÇ İSTATİSTİKLERİ' : 'MATCH STATISTICS'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', fontWeight: 'bold' }}>
                <span>{homeTeam.logo}</span>
                <span style={{ color: 'var(--text-secondary)' }}>TEAM</span>
                <span>{awayTeam.logo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{matchStats.possessionHome}%</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Topa Sahip Olma' : 'Possession'}</span>
                <span>{matchStats.possessionAway}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{matchStats.shotsHome}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Toplam Şut' : 'Shots'}</span>
                <span>{matchStats.shotsAway}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{matchStats.shotsTargetHome}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'İsabetli Şut' : 'Shots on Target'}</span>
                <span>{matchStats.shotsTargetAway}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{matchStats.savesHome}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Kurtarışlar' : 'Saves'}</span>
                <span>{matchStats.savesAway}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{matchStats.foulsHome}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Fauller' : 'Fouls'}</span>
                <span>{matchStats.foulsAway}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{matchStats.cornersHome}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lang === 'tr' ? 'Köşe Vuruşları' : 'Corners'}</span>
                <span>{matchStats.cornersAway}</span>
              </div>
            </div>
          </div>

          {/* Reward Card */}
          <div className="glass-panel" style={{ maxWidth: '320px', margin: '0 auto 2rem auto', border: '1px solid var(--accent-gold)', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {lang === 'tr' ? 'DERBİ REYTİNG ÖDÜLÜ' : 'DERBY REWARD COINS'}
            </span>
            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-gold)', display: 'block', margin: '0.25rem 0' }}>
              🪙 {rewardCoins}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t.rewardCoinsEarned || 'coins earned!'}
            </span>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleCloseDerby} 
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
          >
            <span>{t.collectRewards || 'Collect Rewards'}</span>
          </button>
        </div>
      )}

    </div>
  );
}
