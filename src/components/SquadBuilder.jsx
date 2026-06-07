import React, { useState, useMemo, useEffect } from 'react';
import PlayerCard from './PlayerCard';
import { translations } from '../data/translations';
import { Plus, X, ShieldAlert, Award, Star, Settings, Play, RefreshCw, Trophy } from 'lucide-react';
import { syncSquadToOnlineDB } from '../data/onlineSync';

const FORMATIONS = {
  '4-3-3': {
    name: '4-3-3',
    rows: [
      ['LW', 'ST', 'RW'],
      ['CM', 'CAM', 'CDM'],
      ['LB', 'CB1', 'CB2', 'RB'],
      ['GK']
    ]
  },
  '4-4-2': {
    name: '4-4-2',
    rows: [
      ['ST1', 'ST2'],
      ['LM', 'CM1', 'CM2', 'RM'],
      ['LB', 'CB1', 'CB2', 'RB'],
      ['GK']
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    rows: [
      ['ST1', 'ST2'],
      ['LM', 'CM1', 'CAM', 'CM2', 'RM'],
      ['CB1', 'CB2', 'CB3'],
      ['GK']
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    rows: [
      ['ST'],
      ['LAM', 'CAM', 'RAM'],
      ['LDM', 'RDM'],
      ['LB', 'CB1', 'CB2', 'RB'],
      ['GK']
    ]
  }
};

const OPPONENTS = [
  { name: 'Fenerbahçe SK', ovr: 81, logo: 'FB', reward: 1.0, color: '#fbbf24' },
  { name: 'Galatasaray SK', ovr: 82, logo: 'GS', reward: 1.1, color: '#ea580c' },
  { name: 'Beşiktaş JK', ovr: 80, logo: 'BJK', reward: 1.0, color: '#111827' },
  { name: 'Real Madrid CF', ovr: 88, logo: 'RM', reward: 1.5, color: '#3b82f6' },
  { name: 'FUT Icons FC', ovr: 93, logo: 'IC', reward: 2.0, color: '#d97706' }
];

const TR_COMMENTARY = [
  "{player} orta sahada topu kaparak hızlı bir hücum başlattı!",
  "{player} ceza sahası dışından sert vurdu... Top direğin hemen yanından auta gidiyor!",
  "{player} harika bir vücut çalımıyla rakibini geçti, içeriye sokuluyor!",
  "{player} kaleciyle karşı karşıya kaldı... Şut! Kaleci son anda topu kornere çeldi!",
  "{player} sağ kanattan ortaladı... Kafa vuruşu! Top üst direkten dönüyor!",
  "Savunmada {player} kritik bir kayarak müdahaleyle tehlikeyi önledi!",
  "Rakip takım tehlikeli geldi, ancak {player} geçit vermedi!",
  "Kaleci {player} mükemmel bir refleksle gole izin vermedi!",
  "Orta sahada {player} şık paslarla oyunun yönünü değiştiriyor."
];

const TR_GOALS = [
  "GOOOOL! {player} ceza sahası dışından muhteşem bir şutla kaleciyi çaresiz bıraktı!",
  "GOOOOL! {player} ceza sahası içinde topa harika yükseldi ve kafayla köşeye bıraktı!",
  "GOOOOL! {player} kaleciyle karşı karşıya kaldığı pozisyonda plase vuruşla topu ağlara yolladı!",
  "GOOOOL! {player} mükemmel bir frikik golüyle tribünleri ayağa kaldırdı! Top doksanda!"
];

const TR_OPP_GOALS = [
  "GOL... Rakip takım ceza sahamızda bulduğu boşluğu iyi değerlendirdi ve top ağlarımızda.",
  "GOL... Rakip forvet düzgün bir kafa vuruşuyla kalecimizi mağlup etti.",
  "GOL... Hızlı gelişen rakip atakta golü kalemizde gördük.",
  "GOL... Rakip ceza yayı üzerinden vurdu ve golü buldu."
];

const EN_COMMENTARY = [
  "{player} wins the ball in midfield and starts a quick counter-attack!",
  "{player} shoots from distance... Just wide of the post!",
  "{player} beats his defender with a brilliant body feint!",
  "{player} is one-on-one with the keeper... Saved! What a brilliant reflex save!",
  "{player} crosses from the right wing... Header! Hits the crossbar!",
  "{player} makes a crucial sliding tackle to stop the danger!",
  "The opponent attacks dangerously, but {player} stands strong!",
  "Goalkeeper {player} makes a spectacular save to deny a certain goal!",
  "{player} dictates the play with neat passes in the middle of the pitch."
];

const EN_GOALS = [
  "GOAL! {player} fires a rocket into the top corner from outside the box!",
  "GOAL! {player} rises highest in the box and powers a header home!",
  "GOAL! {player} goes one-on-one and calmly slots it past the keeper!",
  "GOAL! {player} scores a magnificent free-kick! Absolute world class!"
];

const EN_OPP_GOALS = [
  "GOAL... The opponent found space in our penalty box and converted the chance.",
  "GOAL... The opposition striker beats our goalkeeper with a clean header.",
  "GOAL... A fast-paced counter-attack from the opponent ends in a goal.",
  "GOAL... The opponent shoots from the edge of the box and scores."
];

export default function SquadBuilder({ collection, lang, coins, onUpdateCoins }) {
  const t = translations[lang];

  // Load formation from localStorage
  const [formation, setFormation] = useState(() => {
    return localStorage.getItem('fut_active_formation') || '4-3-3';
  });

  const activeFormationConfig = FORMATIONS[formation];
  const activeSlots = useMemo(() => activeFormationConfig.rows.flat(), [formation]);

  // Load squad
  const [squad, setSquad] = useState(() => {
    const saved = localStorage.getItem('fut_active_squad');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [activeSlot, setActiveSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Match Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState('setup'); // setup, playing, result
  const [selectedOpponent, setSelectedOpponent] = useState(OPPONENTS[0]);
  const [simTimer, setSimTimer] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [simLog, setSimLog] = useState([]);
  const [rewardCoins, setRewardCoins] = useState(0);

  // Position resolver
  const getTargetPosition = (slot) => {
    const s = slot.toUpperCase();
    if (s.startsWith('CB')) return 'CB';
    if (s.startsWith('ST')) return 'ST';
    if (s.startsWith('CM')) return 'CM';
    if (s.startsWith('CDM') || s === 'LDM' || s === 'RDM') return 'CDM';
    if (s.startsWith('CAM') || s === 'LAM' || s === 'RAM') return 'CAM';
    if (s === 'LM') return 'LM';
    if (s === 'RM') return 'RM';
    return s;
  };

  // Save changes helper
  const saveSquad = (newSquad) => {
    setSquad(newSquad);
    localStorage.setItem('fut_active_squad', JSON.stringify(newSquad));
    
    // Sync to user database
    try {
      const activeUser = JSON.parse(localStorage.getItem('fut_active_user') || 'null');
      if (activeUser) {
        const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
        const userIndex = users.findIndex(u => u.username.toLowerCase() === activeUser.username.toLowerCase());
        if (userIndex !== -1) {
          users[userIndex].squad = newSquad;
          localStorage.setItem('fut_users', JSON.stringify(users));
        }
        syncSquadToOnlineDB(activeUser.username, newSquad, formation);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormationChange = (e) => {
    const newForm = e.target.value;
    setFormation(newForm);
    localStorage.setItem('fut_active_formation', newForm);
    
    // Sync to user database
    try {
      const activeUser = JSON.parse(localStorage.getItem('fut_active_user') || 'null');
      if (activeUser) {
        const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
        const userIndex = users.findIndex(u => u.username.toLowerCase() === activeUser.username.toLowerCase());
        if (userIndex !== -1) {
          users[userIndex].formation = newForm;
          localStorage.setItem('fut_users', JSON.stringify(users));
        }
        syncSquadToOnlineDB(activeUser.username, squad, newForm);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const assignedInstanceIds = useMemo(() => {
    return activeSlots
      .map(slot => squad[slot])
      .filter(p => p !== null && p !== undefined)
      .map(p => p.instanceId);
  }, [squad, activeSlots]);

  const availablePlayers = useMemo(() => {
    if (!collection) return [];
    return collection.filter(p => !assignedInstanceIds.includes(p.instanceId));
  }, [collection, assignedInstanceIds]);

  const filteredAvailablePlayers = useMemo(() => {
    if (!activeSlot) return [];
    const targetPos = getTargetPosition(activeSlot);
    const match = [];
    const others = [];

    availablePlayers.forEach(p => {
      if (p.position.toUpperCase() === targetPos.toUpperCase()) {
        match.push(p);
      } else {
        others.push(p);
      }
    });

    const sortByRating = (a, b) => b.rating - a.rating;
    return [...match.sort(sortByRating), ...others.sort(sortByRating)];
  }, [availablePlayers, activeSlot]);

  const handleOpenSlotSelector = (slot) => {
    setActiveSlot(slot);
    setIsModalOpen(true);
  };

  const handleAssignPlayer = (player) => {
    if (!activeSlot) return;
    const newSquad = { ...squad, [activeSlot]: player };
    saveSquad(newSquad);
    setIsModalOpen(false);
    setActiveSlot(null);
  };

  const handleRemovePlayer = (slot, e) => {
    e.stopPropagation();
    const newSquad = { ...squad, [slot]: null };
    saveSquad(newSquad);
  };

  const handleClearSquad = () => {
    const cleared = {};
    activeSlots.forEach(slot => { cleared[slot] = null; });
    saveSquad(cleared);
  };

  const handleShareSquad = () => {
    const activePlayers = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);
    if (activePlayers.length < 11) return;
    
    try {
      const activeUserStr = localStorage.getItem('fut_active_user');
      let username = 'FUT User';
      if (activeUserStr) {
        try {
          username = JSON.parse(activeUserStr).username;
        } catch(e) {}
      }

      const compact = {
        n: `${username}'s Squad`,
        o: squadRating,
        c: chemistryStats.total,
        p: activePlayers.map(p => ({
          n: p.name,
          r: p.rating,
          p: p.position,
          nat: p.nation
        }))
      };
      
      const str = JSON.stringify(compact);
      const b64 = btoa(unescape(encodeURIComponent(str)));
      const shareCode = `FUT26-${b64}`;
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?squad=${shareCode}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert(lang === 'tr' 
          ? 'Kadro Paylaşım Linki panoya kopyalandı! Bu linki arkadaşlarınıza göndererek kadronuzun doğrudan onların liderlik tablosuna eklenmesini sağlayabilirsiniz.' 
          : 'Squad Share Link copied to clipboard! Send this link to your friends to add your team directly to their Leaderboard.');
      }).catch(err => {
        prompt(lang === 'tr' ? 'Kadro Paylaşım Linkiniz:' : 'Your Squad Share Link:', shareUrl);
      });
    } catch (e) {
      console.error('Failed to export squad:', e);
    }
  };

  // OVR calculations
  const squadRating = useMemo(() => {
    const players = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);
    if (players.length === 0) return 0;
    const sum = players.reduce((acc, p) => acc + p.rating, 0);
    return Math.floor(sum / players.length);
  }, [squad, activeSlots]);

  // Chemistry calculations
  const chemistryStats = useMemo(() => {
    const playersInSquad = activeSlots
      .map(slot => ({ slot, player: squad[slot] }))
      .filter(({ player }) => player !== null && player !== undefined);

    if (playersInSquad.length === 0) {
      return { total: 0, playerChem: {} };
    }

    const clubCounts = {};
    const nationCounts = {};

    playersInSquad.forEach(({ player }) => {
      const club = player.club.toLowerCase();
      const nation = player.nation.toLowerCase();
      clubCounts[club] = (clubCounts[club] || 0) + 1;
      nationCounts[nation] = (nationCounts[nation] || 0) + 1;
    });

    let totalChem = 0;
    const playerChemMap = {};

    playersInSquad.forEach(({ slot, player }) => {
      let chem = 0;
      const targetPos = getTargetPosition(slot);
      const playerPos = player.position.toUpperCase();

      if (playerPos === targetPos || 
          (targetPos === 'CAM' && playerPos === 'CM') ||
          (targetPos === 'CDM' && playerPos === 'CM') ||
          (targetPos === 'LM' && playerPos === 'LW') ||
          (targetPos === 'RM' && playerPos === 'RW')
      ) {
        chem += 1;
      }

      if (clubCounts[player.club.toLowerCase()] >= 2) {
        chem += 1;
      }

      if (nationCounts[player.nation.toLowerCase()] >= 2) {
        chem += 1;
      }

      totalChem += chem;
      playerChemMap[slot] = chem;
    });

    return {
      total: totalChem,
      playerChem: playerChemMap
    };
  }, [squad, activeSlots]);

  // Calculate slot coordinates on the pitch for drawing connection lines
  const slotCoordinates = useMemo(() => {
    const coords = {};
    const rows = activeFormationConfig.rows;
    const numRows = rows.length;
    
    rows.forEach((rowSlots, rowIndex) => {
      const numCols = rowSlots.length;
      let y = 15;
      if (numRows === 4) {
        if (rowIndex === 1) y = 38;
        else if (rowIndex === 2) y = 62;
        else if (rowIndex === 3) y = 85;
      } else if (numRows === 5) {
        if (rowIndex === 1) y = 32;
        else if (rowIndex === 2) y = 50;
        else if (rowIndex === 3) y = 68;
        else if (rowIndex === 4) y = 85;
      }
      
      rowSlots.forEach((slot, colIndex) => {
        const x = ((colIndex + 0.5) / numCols) * 100;
        coords[slot] = { x, y };
      });
    });
    
    return coords;
  }, [activeFormationConfig]);

  // Generate links between slots dynamically based on distance
  const chemistryLinks = useMemo(() => {
    const links = [];
    const slots = Object.keys(slotCoordinates);
    
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const s1 = slots[i];
        const s2 = slots[j];
        const c1 = slotCoordinates[s1];
        const c2 = slotCoordinates[s2];
        if (!c1 || !c2) continue;
        
        const dx = c1.x - c2.x;
        const dy = c1.y - c2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 32) { // Connecting threshold distance
          links.push({ from: s1, to: s2 });
        }
      }
    }
    return links;
  }, [slotCoordinates]);

  const renderChemStars = (slot) => {
    const chem = chemistryStats.playerChem[slot] || 0;
    const stars = [];
    for (let i = 1; i <= 3; i++) {
      stars.push(
        <Star 
          key={i} 
          size={10} 
          fill={i <= chem ? 'var(--accent-gold)' : 'transparent'} 
          color={i <= chem ? 'var(--accent-gold)' : 'var(--text-secondary)'} 
          style={{ opacity: i <= chem ? 1 : 0.4 }}
        />
      );
    }
    return <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>{stars}</div>;
  };

  // Live Match Simulation Loop
  useEffect(() => {
    let interval = null;
    if (isSimulating && simStep === 'playing') {
      interval = setInterval(() => {
        setSimTimer(prev => {
          const nextMinute = prev + 15;
          if (nextMinute >= 90) {
            clearInterval(interval);
            // Match Finished
            setSimStep('result');
            calculateMatchRewards();
            return 90;
          }

          // Generate commentary event
          generateCommentaryEvent(nextMinute);
          return nextMinute;
        });
      }, 900);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSimulating, simStep]);

  const generateCommentaryEvent = (minute) => {
    const players = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);
    if (players.length === 0) return;

    const myPower = squadRating + (chemistryStats.total / 3);
    const oppPower = selectedOpponent.ovr;
    
    // Weighted probability of attack
    const totalPower = myPower + oppPower;
    const roll = Math.random();

    let eventStr = '';
    
    if (roll < myPower / totalPower) {
      // My team gets an event
      const p = players[Math.floor(Math.random() * players.length)];
      const isGoal = Math.random() < 0.3; // 30% chance to score during attack

      if (isGoal) {
        setMyScore(prev => prev + 1);
        const templates = lang === 'tr' ? TR_GOALS : EN_GOALS;
        eventStr = templates[Math.floor(Math.random() * templates.length)].replace('{player}', p.name);
      } else {
        const templates = lang === 'tr' ? TR_COMMENTARY : EN_COMMENTARY;
        eventStr = templates[Math.floor(Math.random() * templates.length)].replace('{player}', p.name);
      }
    } else {
      // Opponent team gets an event
      const isGoal = Math.random() < 0.28; // 28% chance opponent scores
      if (isGoal) {
        setOppScore(prev => prev + 1);
        const templates = lang === 'tr' ? TR_OPP_GOALS : EN_OPP_GOALS;
        eventStr = templates[Math.floor(Math.random() * templates.length)];
      } else {
        eventStr = lang === 'tr' 
          ? "Rakip takım yarı sahamızda pas yapıyor, savunmamız yerleşti."
          : "The opponent team possesses the ball in midfield, but the defense blocks the passing lanes.";
      }
    }

    setSimLog(prev => [{ minute, event: eventStr }, ...prev]);
  };

  const calculateMatchRewards = () => {
    let base = 30;
    if (myScore > oppScore) base = 150; // win
    else if (myScore === oppScore) base = 70; // draw

    const finalCoins = Math.floor(base * selectedOpponent.reward);
    setRewardCoins(finalCoins);
    onUpdateCoins(coins + finalCoins);
  };

  const handleStartSimulation = () => {
    setSimTimer(0);
    setMyScore(0);
    setOppScore(0);
    setSimLog([]);
    setSimStep('playing');
    
    setSimLog([{ minute: 0, event: lang === 'tr' ? 'Maç Başladı!' : 'Match Started!' }]);
  };

  const handleCloseSimulation = () => {
    setIsSimulating(false);
    setSimStep('setup');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Page Header & Stats Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
            {t.squadBuilder}
          </h2>
          
          {/* Formation selector dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.formation || 'Formation'}:</span>
            <select 
              className="form-input" 
              value={formation} 
              onChange={handleFormationChange}
              style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.85rem', cursor: 'pointer', height: 'fit-content' }}
            >
              {Object.keys(FORMATIONS).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* OVR Box */}
          <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: '100px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', display: 'block', letterSpacing: '1px' }}>
              {t.squadRating}
            </span>
            <span className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
              {squadRating}
            </span>
          </div>

          {/* Chemistry Box */}
          <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: '100px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', display: 'block', letterSpacing: '1px' }}>
              {t.squadChemistry}
            </span>
            <span className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
              {chemistryStats.total} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 33</span>
            </span>
          </div>

          {/* Simulation Match Button */}
          {activeSlots.filter(slot => squad[slot] !== null && squad[slot] !== undefined).length === 11 && (
            <button 
              className="btn-primary" 
              onClick={() => setIsSimulating(true)}
              style={{ 
                height: 'fit-content', 
                alignSelf: 'center', 
                background: 'linear-gradient(135deg, #10b981, #047857)', 
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                color: '#fff'
              }}
            >
              <Play size={16} />
              <span>{t.playMatch || 'Play Match'}</span>
            </button>
          )}

          {/* Clear Button */}
          <button className="btn-secondary" onClick={handleClearSquad} style={{ height: 'fit-content', alignSelf: 'center' }}>
            <X size={16} />
            <span>{lang === 'tr' ? 'Temizle' : 'Reset'}</span>
          </button>

          {/* Share Squad Button */}
          {activeSlots.filter(slot => squad[slot] !== null && squad[slot] !== undefined).length === 11 && (
            <button 
              className="btn-secondary" 
              onClick={handleShareSquad}
              style={{ 
                height: 'fit-content', 
                alignSelf: 'center',
                borderColor: 'var(--accent-gold)',
                color: 'var(--accent-gold)'
              }}
            >
              <span>{lang === 'tr' ? 'Kadroyu Paylaş' : 'Share Squad'}</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* FOOTBALL PITCH GRID MAP */}
        <div className="pitch-container">
          <div className="pitch-overlay"></div>
          <div className="pitch-midline"></div>
          <div className="pitch-center-circle"></div>
          <div className="pitch-penalty-area-top"></div>
          <div className="pitch-penalty-area-bottom"></div>

          {/* SVG Chemistry Connections */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            <defs>
              <linearGradient id="chemGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glowFilter">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {chemistryLinks.map((link, idx) => {
              const c1 = slotCoordinates[link.from];
              const c2 = slotCoordinates[link.to];
              const p1 = squad[link.from];
              const p2 = squad[link.to];
              
              if (!c1 || !c2) return null;
              
              const hasChem = p1 && p2 && (p1.club.toLowerCase() === p2.club.toLowerCase() || p1.nation.toLowerCase() === p2.nation.toLowerCase());
              
              if (hasChem) {
                return (
                  <line 
                    key={idx}
                    x1={`${c1.x}%`}
                    y1={`${c1.y}%`}
                    x2={`${c2.x}%`}
                    y2={`${c2.y}%`}
                    stroke="url(#chemGlow)"
                    strokeWidth="3.2"
                    filter="url(#glowFilter)"
                    opacity="0.95"
                  />
                );
              } else {
                return (
                  <line 
                    key={idx}
                    x1={`${c1.x}%`}
                    y1={`${c1.y}%`}
                    x2={`${c2.x}%`}
                    y2={`${c2.y}%`}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                  />
                );
              }
            })}
          </svg>

          <div className="pitch-slots-grid">
            {activeFormationConfig.rows.map((rowSlots, rowIndex) => (
              <div key={rowIndex} className="pitch-row">
                {rowSlots.map((slot) => {
                  const player = squad[slot];
                  const targetPos = getTargetPosition(slot);
                  
                  return (
                    <div key={slot} className="pitch-slot" onClick={() => handleOpenSlotSelector(slot)}>
                      {player ? (
                        <>
                          <div className="pitch-slot-card">
                            <PlayerCard player={player} showStats={false} />
                          </div>
                          {renderChemStars(slot)}
                          <button className="btn-secondary" onClick={(e) => handleRemovePlayer(slot, e)} style={{ padding: '0.15rem', position: 'absolute', right: '-8px', top: '-8px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', zIndex: 10 }}>
                            <X size={10} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="pitch-slot-circle"><Plus size={16} /></div>
                          <span className="pitch-slot-label">{t['pitch' + targetPos] ? targetPos : targetPos}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PLAYER SELECTOR MODAL DOCK */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                {t.selectPlayerTitle} ({getTargetPosition(activeSlot)})
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {filteredAvailablePlayers.length > 0 ? (
                <div>
                  {filteredAvailablePlayers.map((player) => {
                    const isPreferred = player.position.toUpperCase() === getTargetPosition(activeSlot).toUpperCase();
                    return (
                      <div 
                        key={player.instanceId} 
                        className="selection-player-item"
                        onClick={() => handleAssignPlayer(player)}
                      >
                        <div className="selection-player-avatar">
                          {player.rating}
                        </div>
                        
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{player.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                            <span style={{ color: isPreferred ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 'bold' }}>{player.position}</span>
                            <span>•</span>
                            <span>{player.club}</span>
                            <span>•</span>
                            <span>{player.nation}</span>
                          </div>
                        </div>

                        {/* Preferred Position Star Indicator */}
                        {isPreferred && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.65rem',
                            color: 'var(--accent-gold)',
                            fontWeight: '800',
                            backgroundColor: 'rgba(226,183,75,0.1)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(226,183,75,0.2)'
                          }}>
                            <Award size={10} />
                            <span>CHEM MATCH</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                  <ShieldAlert size={36} style={{ marginBottom: '0.75rem', margin: '0 auto', color: 'var(--accent-gold)' }} />
                  <p style={{ fontSize: '0.9rem' }}>{t.noAvailablePlayers}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MATCH SIMULATOR MODAL */}
      {isSimulating && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '600px', background: 'radial-gradient(circle at top, #111827 0%, #030712 100%)', border: '1px solid var(--accent-gold)' }}>
            
            {/* Modal Header */}
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase', margin: 0 }}>
                  {t.playMatch || 'Match Simulation'}
                </h3>
              </div>
              {simStep !== 'playing' && (
                <button onClick={handleCloseSimulation} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              
              {/* STEP 1: Setup Opponent Selection */}
              {simStep === 'setup' && (
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: '700', fontSize: '1rem' }}>
                    {t.selectOpponent || 'Select Opponent'}:
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {OPPONENTS.map(opp => (
                      <div 
                        key={opp.name}
                        onClick={() => setSelectedOpponent(opp)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: `1px solid ${selectedOpponent.name === opp.name ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                          backgroundColor: selectedOpponent.name === opp.name ? 'rgba(226,183,75,0.1)' : 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            backgroundColor: opp.color, 
                            color: '#fff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '0.85rem'
                          }}>
                            {opp.logo}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700' }}>{opp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Reward Multiplier: <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{opp.reward}x</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>OVR</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: opp.color }}>{opp.ovr}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={handleStartSimulation} 
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: 'none' }}
                  >
                    <Play size={16} />
                    <span>{t.startMatch || 'Start Match'}</span>
                  </button>
                </div>
              )}

              {/* STEP 2: Live Commentary / Match in Progress */}
              {simStep === 'playing' && (
                <div>
                  {/* Scoreboard */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>MY SQUAD</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>{user.username}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '900', letterSpacing: '1px' }}>
                        {simTimer}'
                      </span>
                      <span style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '2px', color: 'var(--accent-gold)', margin: '0.25rem 0' }}>
                        {myScore} - {oppScore}
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', width: '40%' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>OPPONENT</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: '900', color: selectedOpponent.color }}>{selectedOpponent.name}</span>
                    </div>
                  </div>

                  {/* Commentary Log list */}
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {t.matchPlaying || 'Match in progress...'}:
                    </span>
                    <div style={{ height: '200px', overflowY: 'auto', backgroundColor: '#030712', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {simLog.map((log, index) => {
                        const isGoal = log.event.includes('GOL') || log.event.toUpperCase().includes('GOAL');
                        return (
                          <div 
                            key={index} 
                            style={{ 
                              borderLeft: `2.5px solid ${isGoal ? 'var(--accent-gold)' : index === 0 ? '#10b981' : 'transparent'}`,
                              paddingLeft: '0.5rem',
                              color: isGoal ? 'var(--accent-gold)' : index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                              fontWeight: isGoal || index === 0 ? 'bold' : 'normal'
                            }}
                          >
                            <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: '0.4rem' }}>[{log.minute}']</span>
                            <span>{log.event}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Result Page & Reward Claim */}
              {simStep === 'result' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏆</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
                    {myScore > oppScore 
                      ? (t.matchWin || 'Victory!') 
                      : myScore === oppScore 
                        ? (t.matchDraw || 'Draw!') 
                        : (t.matchLose || 'Defeat!')}
                  </h3>
                  
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '4px', margin: '1rem 0' }}>
                    {myScore} - {oppScore}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    {selectedOpponent.name} {lang === 'tr' ? 'karşısında maç tamamlandı.' : 'match has finished.'}
                  </p>

                  {/* Reward Card */}
                  <div className="glass-panel" style={{ maxWidth: '300px', margin: '0 auto 1.5rem auto', border: '1px solid var(--accent-gold)', padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {lang === 'tr' ? 'MAÇ ÖDÜLÜ' : 'MATCH REWARDS'}
                    </span>
                    <span style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--accent-gold)', display: 'block', margin: '0.25rem 0' }}>
                      🪙 {rewardCoins}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {t.rewardCoinsEarned || 'coins earned!'}
                    </span>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={handleCloseSimulation} 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{t.collectRewards || 'Collect Rewards'}</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
