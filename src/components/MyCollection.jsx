import React, { useState, useMemo } from 'react';
import PlayerCard from './PlayerCard';
import { translations } from '../data/translations';
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function MyCollection({ collection, lang, onOpenPackRedirect }) {
  const t = translations[lang];

  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [nationFilter, setNationFilter] = useState('');
  const [sortBy, setSortBy] = useState('ovr_desc');

  // Position groups mapping
  const positionGroups = {
    FW: ['ST', 'LW', 'RW', 'CF'],
    MD: ['CAM', 'CM', 'CDM', 'LM', 'RM'],
    DF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
    GK: ['GK']
  };

  // Compile unique nations dynamically from user's current collection
  const nationsList = useMemo(() => {
    if (!collection) return [];
    const nations = collection.map(p => p.nation);
    return [...new Set(nations)].sort();
  }, [collection]);

  // Filter & Sort card list
  const processedCollection = useMemo(() => {
    if (!collection) return [];

    let result = [...collection];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // Rarity filter
    if (rarityFilter) {
      result = result.filter(p => p.rarity.toLowerCase() === rarityFilter.toLowerCase());
    }

    // Position filter (by group or exact)
    if (positionFilter) {
      if (['FW', 'MD', 'DF', 'GK'].includes(positionFilter)) {
        result = result.filter(p => positionGroups[positionFilter].includes(p.position.toUpperCase()));
      } else {
        result = result.filter(p => p.position.toLowerCase() === positionFilter.toLowerCase());
      }
    }

    // Nationality filter
    if (nationFilter) {
      result = result.filter(p => p.nation.toLowerCase() === nationFilter.toLowerCase());
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'ovr_desc') {
        return b.rating - a.rating;
      }
      if (sortBy === 'ovr_asc') {
        return a.rating - b.rating;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [collection, search, rarityFilter, positionFilter, nationFilter, sortBy]);

  if (!collection || collection.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗃️</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
          {t.emptyCollection}
        </h3>
        <button className="btn-primary" onClick={onOpenPackRedirect} style={{ marginTop: '1rem' }}>
          <span>{t.dailyDraw}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Title & Stats summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
            {t.collection}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {collection.length} {t.cardsFound}
          </p>
        </div>
      </div>

      {/* Filter and search panel */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flexGrow: 1, position: 'relative', minWidth: '240px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder={t.searchPlayer}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Rarity Select */}
          <div style={{ minWidth: '150px' }}>
            <select 
              className="form-input" 
              value={rarityFilter} 
              onChange={(e) => setRarityFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">✨ {t.allRarities}</option>
              <option value="gold">Gold</option>
              <option value="toty">Team of the Year</option>
              <option value="icon">Icon</option>
            </select>
          </div>

          {/* Position Select */}
          <div style={{ minWidth: '150px' }}>
            <select 
              className="form-input" 
              value={positionFilter} 
              onChange={(e) => setPositionFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">🏃 {t.allPositions}</option>
              <option value="FW">{t.pitchST} / {t.pitchLW} / {t.pitchRW}</option>
              <option value="MD">{t.pitchCM} / {t.pitchCAM} / {t.pitchCDM}</option>
              <option value="DF">{t.pitchCB} / {t.pitchLB} / {t.pitchRB}</option>
              <option value="GK">{t.pitchGK}</option>
            </select>
          </div>

          {/* Nationality Select */}
          <div style={{ minWidth: '150px' }}>
            <select 
              className="form-input" 
              value={nationFilter} 
              onChange={(e) => setNationFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">🌍 {t.allNations}</option>
              {nationsList.map(nation => (
                <option key={nation} value={nation}>{nation}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div style={{ minWidth: '180px' }}>
            <select 
              className="form-input" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="ovr_desc">📈 {t.sortByOvr}</option>
              <option value="ovr_asc">📉 {t.sortByOvrLow}</option>
              <option value="name_asc">🔤 {t.sortByName}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {processedCollection.length > 0 ? (
        <div className="card-grid">
          {processedCollection.map((player) => (
            <PlayerCard key={player.instanceId} player={player} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          border: '2px dashed var(--border-color)',
          borderRadius: '12px',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ fontSize: '1rem', fontWeight: '600' }}>
            Aramanıza uygun oyuncu bulunamadı. / No players match your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
