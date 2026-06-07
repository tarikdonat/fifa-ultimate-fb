import React, { useState, useMemo } from 'react';
import { Trophy, Shield, Star, Award, X } from 'lucide-react';
import { translations } from '../data/translations';

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

export default function Leaderboard({ collection, lang, user }) {
  const t = translations[lang];

  // Load user squad and calculate OVR and Chemistry live
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
                 [['ST'], ['LAM', 'CAM', 'RAM'], ['LDM', 'RDM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']]; // 4-2-3-1

    const activeSlots = rows.flat();
    const players = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);
    
    if (players.length < 11) {
      return { id: 'user_squad', name: user?.username || 'My Squad', ovr: 0, chem: 0, isUser: true, incomplete: true, logo: 'ME', color: 'var(--accent-gold)', reward: 1.2, players: [] };
    }

    // Calculate rating
    const sum = players.reduce((acc, p) => acc + p.rating, 0);
    const ovr = Math.floor(sum / 11);

    // Calculate chemistry
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
      players: players.map(p => ({ name: p.name, rating: p.rating, position: p.position, nation: p.nation }))
    };
  }, [user, collection]);

  // Merge User Squad with Demo Squads and Sort
  const rankings = useMemo(() => {
    const list = [...DEMO_TEAMS];
    list.push(userSquadStats);
    
    return list.sort((a, b) => {
      const aVal = a.ovr * 100 + a.chem;
      const bVal = b.ovr * 100 + b.chem;
      return bVal - aVal;
    });
  }, [userSquadStats]);

  const [activeDetailsTeam, setActiveDetailsTeam] = useState(null);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '950', color: 'var(--accent-gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <Trophy size={26} />
            <span>{t.leaderboard || 'Leaderboard'}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {lang === 'tr' 
              ? 'Kurduğun kadroyla efsane takımların OVR ve Kimya değerlerini karşılaştır!' 
              : 'Compare your custom squad OVR and Chemistry against legend teams!'}
          </p>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-panel" style={{ border: '1px solid var(--border-color)', padding: '0.5rem', marginBottom: '2rem' }}>
        
        {/* Table Header */}
        <div style={{
          display: 'flex',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          fontWeight: '800',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div style={{ width: '10%' }}>{lang === 'tr' ? 'Sıra' : 'Rank'}</div>
          <div style={{ width: '45%' }}>{lang === 'tr' ? 'Takım' : 'Team'}</div>
          <div style={{ width: '15%', textAlign: 'center' }}>OVR</div>
          <div style={{ width: '15%', textAlign: 'center' }}>{t.squadChemistry || 'Chem'}</div>
          <div style={{ width: '15%', textAlign: 'right' }}>{lang === 'tr' ? 'Detay' : 'Details'}</div>
        </div>

        {/* Table Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rankings.map((team, index) => {
            const isUserRow = team.isUser;
            return (
              <div 
                key={team.id || 'user_squad'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: index === rankings.length - 1 ? 'none' : '1px solid var(--border-color)',
                  backgroundColor: isUserRow ? 'rgba(226, 183, 75, 0.08)' : 'transparent',
                  borderLeft: isUserRow ? '3px solid var(--accent-gold)' : '3px solid transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                {/* Rank number */}
                <div style={{ width: '10%', fontWeight: '900', fontSize: '1.1rem', color: index === 0 ? '#fbbf24' : index === 1 ? '#cbd5e1' : index === 2 ? '#b45309' : 'var(--text-secondary)' }}>
                  #{index + 1}
                </div>

                {/* Team Info */}
                <div style={{ width: '45%', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: team.color || 'var(--bg-secondary)', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '0.8rem',
                    border: isUserRow ? '2px solid var(--accent-gold)' : 'none'
                  }}>
                    {team.logo || 'FC'}
                  </div>
                  <div>
                    <span style={{ fontWeight: '800', color: isUserRow ? 'var(--accent-gold)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {team.name}
                    </span>
                    {team.manager && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Mgr: {team.manager}
                      </span>
                    )}
                    {team.incomplete && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold' }}>
                        {lang === 'tr' ? 'Eksik Kadro (En az 11 oyuncu)' : 'Incomplete (Needs 11 players)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* OVR Rating */}
                <div style={{ width: '15%', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem', color: team.incomplete ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {team.incomplete ? '--' : team.ovr}
                </div>

                {/* Chemistry */}
                <div style={{ width: '15%', textAlign: 'center', fontWeight: '700', fontSize: '1rem', color: team.incomplete ? 'var(--text-secondary)' : 'var(--accent-gold)' }}>
                  {team.incomplete ? '--' : `${team.chem}/33`}
                </div>

                {/* Details Button */}
                <div style={{ width: '15%', textAlign: 'right' }}>
                  {team.incomplete ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>-</span>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      onClick={() => setActiveDetailsTeam(team)}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      {lang === 'tr' ? 'Kadro' : 'View'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* TEAM DETAILS MODAL */}
      {activeDetailsTeam && (
        <div className="modal-overlay" onClick={() => setActiveDetailsTeam(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--accent-gold)', margin: 0 }}>
                  {activeDetailsTeam.name}
                </h3>
              </div>
              <button onClick={() => setActiveDetailsTeam(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', display: 'block' }}>OVR</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>{activeDetailsTeam.ovr}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', display: 'block' }}>CHEMISTRY</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-gold)' }}>{activeDetailsTeam.chem} / 33</span>
                </div>
              </div>

              {/* Player list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {activeDetailsTeam.isUser ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {lang === 'tr' ? 'Kendi kadro diziliminizi Kadro Kurucu sekmesinde görebilirsiniz.' : 'You can view your active squad configuration in the Squad Builder tab.'}
                  </p>
                ) : (
                  activeDetailsTeam.players.map((p, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '4px', 
                          backgroundColor: 'rgba(226,183,75,0.15)', 
                          color: 'var(--accent-gold)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.75rem'
                        }}>
                          {p.rating}
                        </div>
                        <div>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>{p.nation}</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                        {p.position}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
