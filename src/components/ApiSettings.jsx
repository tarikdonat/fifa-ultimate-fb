import React, { useState, useEffect } from 'react';
import { translations } from '../data/translations';
import { Search, Plus, Check, ShieldAlert, Globe } from 'lucide-react';

export default function ApiSettings({ user, lang }) {
  const t = translations[lang];

  // Hardcode the default API Key & Host so visitors are instantly connected online
  const DEFAULT_KEY = '2f6bdff8d7msh3abda5d0e9b96afp1294aajsn3ce0505802d0';
  const DEFAULT_HOST = 'sportapi7.p.rapidapi.com';

  const [apiKey] = useState(() => {
    return localStorage.getItem('fut_rapidapi_key') || import.meta.env.VITE_RAPIDAPI_KEY || DEFAULT_KEY;
  });
  
  const [apiHost] = useState(() => {
    return localStorage.getItem('fut_rapidapi_host') || import.meta.env.VITE_RAPIDAPI_HOST || DEFAULT_HOST;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // info, success, error
  const [importedIds, setImportedIds] = useState([]);

  useEffect(() => {
    // Keep track of previously imported custom players to show checkmarks
    const customPlayers = JSON.parse(localStorage.getItem(`custom_players_${user.username.toLowerCase()}`) || '[]');
    const ids = customPlayers.map(p => {
      // Extract original SofaScore ID from the custom ID format e.g. "sofa_12345" -> 12345
      if (p.id.startsWith('sofa_')) {
        return parseInt(p.id.replace('sofa_', ''), 10);
      }
      return p.id;
    });
    setImportedIds(ids);
  }, [user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !apiKey) return;

    setIsLoading(true);
    setSearchResults([]);
    setStatusMessage('');

    try {
      const response = await fetch(`https://${apiHost}/api/v1/search/all?q=${encodeURIComponent(searchQuery.trim())}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey.trim(),
          'x-rapidapi-host': apiHost
        }
      });

      if (!response.ok) {
        throw new Error(lang === 'tr' ? 'Arama sunucusu yanıt vermedi. Lütfen bağlantınızı kontrol edin.' : 'Search server did not respond. Please check your connection.');
      }

      const data = await response.json();
      
      let list = [];
      if (data.results && Array.isArray(data.results)) {
        list = data.results
          .filter(item => {
            const isPlayerOrManager = item.type === 'player' || item.type === 'manager';
            const isFootball = item.entity?.sport?.slug === 'football' || item.entity?.team?.sport?.slug === 'football';
            return isPlayerOrManager && isFootball;
          })
          .map(item => {
            return {
              ...item.entity,
              type: item.type
            };
          });
      }

      if (list.length > 0) {
        setSearchResults(list.slice(0, 15));
      } else {
        setStatusType('error');
        setStatusMessage(t.apiNoResults);
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage(err.message || (lang === 'tr' ? 'Arama sırasında bir hata oluştu.' : 'An error occurred during search.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportPlayer = (apiItem) => {
    const p = apiItem.player || apiItem;
    if (!p || !p.name) return;

    const playerId = `sofa_${p.id || Math.floor(Math.random() * 1000000)}`;
    
    // Check if player already exists in custom database
    const customPlayers = JSON.parse(localStorage.getItem(`custom_players_${user.username.toLowerCase()}`) || '[]');
    const exists = customPlayers.some(item => item.id === playerId);
    
    if (exists) {
      setStatusType('error');
      setStatusMessage(`"${p.name}" ${t.apiImportExists}`);
      return;
    }

    // Map positions from SofaScore format:
    // "G" -> "GK", "D" -> "CB", "M" -> "CM", "F" -> "ST"
    let position = 'CM';
    const sofaPos = p.position || '';
    if (sofaPos.toUpperCase() === 'G') position = 'GK';
    else if (sofaPos.toUpperCase() === 'D') position = 'CB';
    else if (sofaPos.toUpperCase() === 'F') position = 'ST';

    // Generate stats based on name length seed
    const nameSeed = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratingBase = 81 + (nameSeed % 11);

    // Generate card stats
    let pac = 75, sho = 70, pas = 70, dri = 72, def = 50, phy = 70;
    if (position === 'ST') {
      pac = 82 + (ratingBase % 10);
      sho = 80 + (ratingBase % 12);
      pas = 68 + (ratingBase % 8);
      dri = 78 + (ratingBase % 10);
      def = 35 + (ratingBase % 5);
      phy = 70 + (ratingBase % 10);
    } else if (position === 'CB') {
      pac = 68 + (ratingBase % 8);
      sho = 40 + (ratingBase % 10);
      pas = 65 + (ratingBase % 8);
      dri = 66 + (ratingBase % 6);
      def = 82 + (ratingBase % 10);
      phy = 80 + (ratingBase % 12);
    } else if (position === 'GK') {
      pac = 80 + (ratingBase % 10); // Div
      sho = 78 + (ratingBase % 10); // Han
      pas = 78 + (ratingBase % 10); // Kic
      dri = 82 + (ratingBase % 10); // Ref
      def = 50; // Spe
      phy = 82 + (ratingBase % 10); // Pos
    } else { // CM
      pac = 74 + (ratingBase % 8);
      sho = 70 + (ratingBase % 8);
      pas = 80 + (ratingBase % 12);
      dri = 78 + (ratingBase % 10);
      def = 66 + (ratingBase % 10);
      phy = 70 + (ratingBase % 8);
    }

    // Rarity
    let rarity = 'gold';
    if (ratingBase >= 90) rarity = 'toty';

    const teamName = p.team?.name || 'Imported FC';
    const nation = p.country?.name || p.nationality || 'Global';

    const newPlayer = {
      id: playerId,
      name: p.name,
      rating: ratingBase,
      position: position,
      club: teamName,
      nation: nation,
      league: 'Sofa League',
      rarity: rarity,
      avatar: p.id ? (p.type === 'manager' ? `https://www.sofascore.com/api/v1/manager/${p.id}/image` : `https://www.sofascore.com/api/v1/player/${p.id}/image`) : null,
      pac,
      sho,
      pas,
      dri,
      def,
      phy
    };

    customPlayers.push(newPlayer);
    localStorage.setItem(`custom_players_${user.username.toLowerCase()}`, JSON.stringify(customPlayers));

    setImportedIds(prev => [...prev, p.id]);
    setStatusType('success');
    setStatusMessage(`"${p.name}" ${t.apiImportSuccess}`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Title & Status Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase', margin: 0 }}>
          {lang === 'tr' ? 'Transfer Pazarı' : 'Transfer Market'}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
          <span className="status-badge status-active" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Globe size={10} />
            <span>Online</span>
          </span>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div style={{
          backgroundColor: statusType === 'success' ? 'rgba(34, 197, 94, 0.15)' : statusType === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 41, 59, 0.5)',
          border: `1px solid ${statusType === 'success' ? 'rgba(34, 197, 94, 0.3)' : statusType === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
          color: statusType === 'success' ? '#4ade80' : statusType === 'error' ? '#f87171' : 'var(--text-primary)',
          borderRadius: '6px',
          padding: '1rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          {statusType === 'error' && <ShieldAlert size={18} style={{ flexShrink: 0 }} />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* API Search Box */}
      <div className="glass-panel" style={{ border: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {lang === 'tr' 
            ? 'Dünyadaki tüm aktif profesyonel futbolcuları arayın ve transfer ederek kendi paketinize ekleyin!' 
            : 'Search for any active professional player in the world and import them into your pack database!'}
        </p>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder={t.apiSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn-primary" disabled={isLoading || !searchQuery.trim()}>
            <Search size={16} />
            <span>{isLoading ? t.apiSearching : t.apiSearchButton}</span>
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {searchResults.map((item) => {
              const p = item.player || item;
              const itemId = p.id;
              const isImported = importedIds.includes(itemId);
              const teamName = item.team?.name || p.team?.name || 'No Club';
              const positionCode = p.position || 'M';
              
              return (
                <div 
                  key={itemId} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Tiny avatar headshot on search list */}
                    <img 
                      src={`https://www.sofascore.com/api/v1/player/${p.id}/image`}
                      alt=""
                      referrerPolicy="no-referrer"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                        <span>Position: {positionCode}</span>
                        <span>•</span>
                        <span>{p.country?.name || p.nationality || 'Unknown'}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{teamName}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className={isImported ? 'btn-secondary' : 'btn-primary'}
                    onClick={() => handleImportPlayer(item)}
                    disabled={isImported}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    {isImported ? <Check size={14} /> : <Plus size={14} />}
                    <span>{isImported ? 'Imported' : 'Import'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
