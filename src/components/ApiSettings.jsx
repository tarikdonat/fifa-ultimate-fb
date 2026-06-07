import React, { useState, useEffect } from 'react';
import { translations } from '../data/translations';
import { HelpCircle, Key, Search, Plus, Check, ShieldAlert, Server } from 'lucide-react';

export default function ApiSettings({ user, lang }) {
  const t = translations[lang];

  const [apiKey, setApiKey] = useState('');
  const [apiHost, setApiHost] = useState('sportapi7.p.rapidapi.com');
  const [isConnected, setIsConnected] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // info, success, error
  const [importedIds, setImportedIds] = useState([]);

  useEffect(() => {
    // Load existing API Key & Host if saved
    const savedKey = localStorage.getItem('fut_rapidapi_key') || import.meta.env.VITE_RAPIDAPI_KEY || '';
    const savedHost = localStorage.getItem('fut_rapidapi_host') || 'sportapi7.p.rapidapi.com';
    
    if (savedKey) {
      setApiKey(savedKey);
      setApiHost(savedHost);
      setIsConnected(true);
    }
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('fut_rapidapi_key', apiKey.trim());
      localStorage.setItem('fut_rapidapi_host', apiHost);
      setIsConnected(true);
      setStatusType('success');
      setStatusMessage(lang === 'tr' ? 'API Ayarları kaydedildi!' : 'API Settings saved successfully!');
    } else {
      localStorage.removeItem('fut_rapidapi_key');
      localStorage.removeItem('fut_rapidapi_host');
      setIsConnected(false);
      setStatusType('info');
      setStatusMessage(lang === 'tr' ? 'API Ayarları temizlendi.' : 'API Settings cleared.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !apiKey) return;

    setIsLoading(true);
    setSearchResults([]);
    setStatusMessage('');

    try {
      // Fetching from chosen host (sportapi7 or sofascore)
      const response = await fetch(`https://${apiHost}/players/search?name=${encodeURIComponent(searchQuery.trim())}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey.trim(),
          'x-rapidapi-host': apiHost
        }
      });

      if (!response.ok) {
        throw new Error(lang === 'tr' ? 'API hatası oluştu. Lütfen anahtarınızı ve seçtiğiniz Host\'u kontrol edin.' : 'API Error. Please check your key and chosen Host.');
      }

      const data = await response.json();
      
      // Handle the various API wrapper array formats
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data.players && Array.isArray(data.players)) {
        list = data.players;
      } else if (data.results && Array.isArray(data.results)) {
        list = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        list = data.data;
      }

      if (list.length > 0) {
        setSearchResults(list.slice(0, 15)); // Limit results to top 15
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
    // Standardize player extraction
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

    const teamName = apiItem.team?.name || p.team?.name || 'Imported FC';
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
      avatar: p.id ? `https://www.sofascore.com/api/v1/player/${p.id}/image` : null,
      pac,
      sho,
      pas,
      dri,
      def,
      phy
    };

    customPlayers.push(newPlayer);
    localStorage.setItem(`custom_players_${user.username.toLowerCase()}`, JSON.stringify(customPlayers));

    setImportedIds(prev => [...prev, p.id || p.name]);
    setStatusType('success');
    setStatusMessage(`"${p.name}" ${t.apiImportSuccess}`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <h2 className="glow-gold" style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
        {t.apiSettings}
      </h2>

      {/* Tutorial / Help Box */}
      <div className="api-tutorial">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontSize: '1rem', fontWeight: '800', marginBottom: '0.75rem' }}>
          <HelpCircle size={18} />
          <span>RapidAPI Entegrasyonu (SportAPI / SofaScore)</span>
        </h3>
        <ol>
          <li>RapidAPI.com üzerinden abone olduğunuz futbol API'sini seçin.</li>
          <li>Kendi test ekranınızdaki veya abone olduğunuz sayfadaki <b>'x-rapidapi-key'</b> değerini aşağıdaki kutuya yapıştırın.</li>
          <li>API Sağlayıcı (API Host) kısmından abone olduğunuz API adresini seçin.</li>
        </ol>
      </div>

      {/* API Key Form */}
      <div className="glass-panel" style={{ border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <form onSubmit={handleSaveKey}>
          {/* Host selector */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Server size={14} color="var(--accent-gold)" />
              <span>API Sağlayıcı / API Host</span>
            </label>
            <select 
              className="form-input" 
              value={apiHost} 
              onChange={(e) => setApiHost(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="sportapi7.p.rapidapi.com">SportAPI (sportapi7.p.rapidapi.com) - Önerilen</option>
              <option value="sofascore.p.rapidapi.com">SofaScore (sofascore.p.rapidapi.com)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Key size={14} color="var(--accent-gold)" />
              <span>{t.apiKeyLabel}</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. 5d5a8bc586msh33e9d89284cf66bp146141jsn08a1e2f4955b"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t.apiStatus}</span>
              <span className={`status-badge ${isConnected ? 'status-active' : 'status-inactive'}`}>
                {isConnected ? t.apiStatusConnected : t.apiStatusDisconnected}
              </span>
            </div>
            
            <button type="submit" className="btn-primary">
              <span>{t.apiSaveKey}</span>
            </button>
          </div>
        </form>
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
          marginBottom: '2rem'
        }}>
          {statusType === 'error' && <ShieldAlert size={18} style={{ flexShrink: 0 }} />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* API Search Box */}
      {isConnected && (
        <div className="glass-panel" style={{ border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
            Futbolcu Transfer Pazarı (Live Search)
          </h3>
          
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
                const itemId = p.id || p.name;
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
      )}

    </div>
  );
}
