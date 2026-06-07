import React, { useState, useMemo } from 'react';
import PlayerCard from './PlayerCard';
import { translations } from '../data/translations';
import { Plus, X, ShieldAlert, Award, Star } from 'lucide-react';

export default function SquadBuilder({ collection, lang }) {
  const t = translations[lang];

  // Squad positions configuration in a 4-3-3 formation
  // Formations are structured by row on the pitch:
  // Row 1 (Attack): LW, ST, RW
  // Row 2 (Midfield): CM, CAM, CDM
  // Row 3 (Defense): LB, CB1, CB2, RB
  // Row 4 (Goalkeeper): GK
  const initialSquad = {
    ST: null,
    LW: null,
    RW: null,
    CAM: null,
    CM: null,
    CDM: null,
    LB: null,
    CB1: null,
    CB2: null,
    RB: null,
    GK: null
  };

  // Load squad from localStorage if it exists, otherwise use empty
  const [squad, setSquad] = useState(() => {
    const saved = localStorage.getItem('fut_active_squad');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialSquad;
      }
    }
    return initialSquad;
  });

  const [activeSlot, setActiveSlot] = useState(null); // ST, LW, etc.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Save squad changes to localStorage helper
  const saveSquad = (newSquad) => {
    setSquad(newSquad);
    localStorage.setItem('fut_active_squad', JSON.stringify(newSquad));
  };

  // Compile list of players currently in the squad to avoid assigning the same card instance twice
  const assignedInstanceIds = useMemo(() => {
    return Object.values(squad)
      .filter(p => p !== null)
      .map(p => p.instanceId);
  }, [squad]);

  // Available players to choose from (in collection, not in squad)
  const availablePlayers = useMemo(() => {
    if (!collection) return [];
    return collection.filter(p => !assignedInstanceIds.includes(p.instanceId));
  }, [collection, assignedInstanceIds]);

  // Sort and filter available players based on the slot clicked
  const filteredAvailablePlayers = useMemo(() => {
    if (!activeSlot) return [];
    
    // Normalize slot names for position matching
    let targetPos = activeSlot;
    if (activeSlot.startsWith('CB')) targetPos = 'CB';

    // Prioritize players matching target position, sort by rating descending
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
    e.stopPropagation(); // Prevent opening selector immediately
    const newSquad = { ...squad, [slot]: null };
    saveSquad(newSquad);
  };

  const handleClearSquad = () => {
    saveSquad(initialSquad);
  };

  // --- STATS CALCULATIONS ---

  // Squad Overall Rating (OVR)
  const squadRating = useMemo(() => {
    const players = Object.values(squad).filter(p => p !== null);
    if (players.length === 0) return 0;
    
    const sum = players.reduce((acc, p) => acc + p.rating, 0);
    return Math.floor(sum / players.length);
  }, [squad]);

  // Chemistry Logic (Max 33)
  // Each of the 11 slots can get 0 to 3 chemistry stars based on:
  // 1. Natural Position (1 point if slot matches player position)
  // 2. Club Chemistry (1 point if there is >= 2 players from the same club in squad)
  // 3. Nation Chemistry (1 point if there is >= 2 players from the same nation in squad)
  const chemistryStats = useMemo(() => {
    const playersInSquad = Object.entries(squad)
      .filter(([_, player]) => player !== null)
      .map(([slot, player]) => ({
        slot,
        player,
        posMatch: false,
        clubMatch: false,
        nationMatch: false,
        totalChem: 0
      }));

    if (playersInSquad.length === 0) {
      return { total: 0, playerChem: {} };
    }

    // 1. Compile counts of club and nations
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

    // 2. Compute chem per player
    playersInSquad.forEach(({ slot, player }) => {
      let chem = 0;
      
      // Position Match
      let targetPos = slot;
      if (slot.startsWith('CB')) targetPos = 'CB';
      if (player.position.toUpperCase() === targetPos.toUpperCase()) {
        chem += 1;
      }

      // Club Match (>= 2 players from same club)
      if (clubCounts[player.club.toLowerCase()] >= 2) {
        chem += 1;
      }

      // Nation Match (>= 2 players from same nation)
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
  }, [squad]);

  // Helper to determine chem dots/stars color
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Page Header & Stats Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
            {t.squadBuilder}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Kadro dizilişi: 4-3-3 (ST, LW, RW, CAM, CM, CDM, LB, CB, CB, RB, GK)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* OVR Box */}
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', textAlign: 'center', minWidth: '120px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', display: 'block', letterSpacing: '1px' }}>
              {t.squadRating}
            </span>
            <span className="glow-gold" style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
              {squadRating}
            </span>
          </div>

          {/* Chemistry Box */}
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', textAlign: 'center', minWidth: '120px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', display: 'block', letterSpacing: '1px' }}>
              {t.squadChemistry}
            </span>
            <span className="glow-gold" style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
              {chemistryStats.total} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ 33</span>
            </span>
          </div>

          {/* Clear Button */}
          <button className="btn-secondary" onClick={handleClearSquad} style={{ height: 'fit-content', alignSelf: 'center' }}>
            <X size={16} />
            <span>Kadroyu Temizle / Reset</span>
          </button>
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

          <div className="pitch-slots-grid">
            {/* ROW 1: ATTACKERS */}
            <div className="pitch-row">
              {/* LW */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('LW')}>
                {squad.LW ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.LW} showStats={false} />
                    </div>
                    {renderChemStars('LW')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('LW', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchLW}</span>
                  </>
                )}
              </div>

              {/* ST */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('ST')}>
                {squad.ST ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.ST} showStats={false} />
                    </div>
                    {renderChemStars('ST')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('ST', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchST}</span>
                  </>
                )}
              </div>

              {/* RW */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('RW')}>
                {squad.RW ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.RW} showStats={false} />
                    </div>
                    {renderChemStars('RW')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('RW', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchRW}</span>
                  </>
                )}
              </div>
            </div>

            {/* ROW 2: MIDFIELDERS */}
            <div className="pitch-row">
              {/* CM */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('CM')}>
                {squad.CM ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.CM} showStats={false} />
                    </div>
                    {renderChemStars('CM')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('CM', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchCM}</span>
                  </>
                )}
              </div>

              {/* CAM */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('CAM')}>
                {squad.CAM ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.CAM} showStats={false} />
                    </div>
                    {renderChemStars('CAM')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('CAM', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchCAM}</span>
                  </>
                )}
              </div>

              {/* CDM */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('CDM')}>
                {squad.CDM ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.CDM} showStats={false} />
                    </div>
                    {renderChemStars('CDM')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('CDM', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchCDM}</span>
                  </>
                )}
              </div>
            </div>

            {/* ROW 3: DEFENDERS */}
            <div className="pitch-row">
              {/* LB */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('LB')}>
                {squad.LB ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.LB} showStats={false} />
                    </div>
                    {renderChemStars('LB')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('LB', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchLB}</span>
                  </>
                )}
              </div>

              {/* CB 1 */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('CB1')}>
                {squad.CB1 ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.CB1} showStats={false} />
                    </div>
                    {renderChemStars('CB1')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('CB1', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchCB} 1</span>
                  </>
                )}
              </div>

              {/* CB 2 */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('CB2')}>
                {squad.CB2 ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.CB2} showStats={false} />
                    </div>
                    {renderChemStars('CB2')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('CB2', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchCB} 2</span>
                  </>
                )}
              </div>

              {/* RB */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('RB')}>
                {squad.RB ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.RB} showStats={false} />
                    </div>
                    {renderChemStars('RB')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('RB', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchRB}</span>
                  </>
                )}
              </div>
            </div>

            {/* ROW 4: GOALKEEPER */}
            <div className="pitch-row">
              {/* GK */}
              <div className="pitch-slot" onClick={() => handleOpenSlotSelector('GK')}>
                {squad.GK ? (
                  <>
                    <div className="pitch-slot-card">
                      <PlayerCard player={squad.GK} showStats={false} />
                    </div>
                    {renderChemStars('GK')}
                    <button className="btn-secondary" onClick={(e) => handleRemovePlayer('GK', e)} style={{ padding: '0.15rem', position: 'absolute', right: '-10px', top: '-10px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pitch-slot-circle"><Plus size={20} /></div>
                    <span className="pitch-slot-label">{t.pitchGK}</span>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* PLAYER SELECTOR MODAL DOCK */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                {t.selectPlayerTitle} ({activeSlot})
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {filteredAvailablePlayers.length > 0 ? (
                <div>
                  {filteredAvailablePlayers.map((player) => {
                    const isPreferred = player.position.toUpperCase() === (activeSlot.startsWith('CB') ? 'CB' : activeSlot).toUpperCase();
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
                            <span>{player.position}</span>
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
                  <ShieldAlert size={36} style={{ marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.9rem' }}>{t.noAvailablePlayers}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
