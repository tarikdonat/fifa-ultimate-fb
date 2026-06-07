import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import DailyPack from './components/DailyPack';
import MyCollection from './components/MyCollection';
import SquadBuilder from './components/SquadBuilder';
import ApiSettings from './components/ApiSettings';
import CookieBanner from './components/CookieBanner';
import Leaderboard from './components/Leaderboard';
import MatchSimulator from './components/MatchSimulator';
import fallbackPlayers from './data/fallbackPlayers.json';

export default function App() {
  const [user, setUser] = useState(null);
  const [collection, setCollection] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('fut_lang') || 'tr';
  });
  const [coins, setCoins] = useState(0);

  // Keep track of language choice in localStorage
  useEffect(() => {
    localStorage.setItem('fut_lang', lang);
  }, [lang]);

  // Check for squad sharing code in URL query parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedSquadCode = params.get('squad');
      if (sharedSquadCode && sharedSquadCode.startsWith('FUT26-')) {
        const b64 = sharedSquadCode.substring(6);
        const str = decodeURIComponent(escape(atob(b64)));
        const parsed = JSON.parse(str);
        
        if (parsed.n && typeof parsed.o === 'number' && typeof parsed.c !== 'undefined' && Array.isArray(parsed.p)) {
          const friends = JSON.parse(localStorage.getItem('fut_friends_squads') || '[]');
          
          // Check if already exists
          const squadId = `friend_${parsed.n.replace(/\s+/g, '_').toLowerCase()}`;
          const exists = friends.some(s => s.name === parsed.n && s.ovr === parsed.o && s.chem === parsed.c);
          
          if (!exists) {
            const newFriendSquad = {
              id: `${squadId}_${Date.now()}`,
              name: parsed.n,
              ovr: parsed.o,
              chem: parsed.c,
              logo: parsed.n.substring(0, 2).toUpperCase(),
              color: '#3b82f6',
              reward: 1.0,
              isFriend: true,
              players: parsed.p.map(p => ({
                name: p.n,
                rating: p.r,
                position: p.p,
                nation: p.nat
              }))
            };
            friends.push(newFriendSquad);
            localStorage.setItem('fut_friends_squads', JSON.stringify(friends));
            
            alert(lang === 'tr' 
              ? `Arkadaşınızın kadrosu (${parsed.n}) başarıyla içe aktarıldı ve Liderlik Tablosuna eklendi!` 
              : `Friend's squad (${parsed.n}) imported successfully and added to the Leaderboard!`);
          }
        }
        
        // Clean up the URL query parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (e) {
      console.error('Failed to auto-import squad from URL:', e);
    }
  }, [lang]);

  const updateCoins = (newAmount) => {
    setCoins(newAmount);
    if (user) {
      const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
      const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
      if (userIndex !== -1) {
        users[userIndex].coins = newAmount;
        localStorage.setItem('fut_users', JSON.stringify(users));
      }
    }
  };

  const handleQuickSell = (player) => {
    const rarity = player.rarity.toLowerCase();
    let price = 100;
    if (rarity === 'icon') price = 800;
    else if (rarity === 'toty') price = 400;
    else if (player.rating >= 85) price = 200;

    const newCoins = coins + price;
    updateCoins(newCoins);

    const updatedCollection = collection.filter(p => p.instanceId !== player.instanceId);
    setCollection(updatedCollection);

    const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    if (userIndex !== -1) {
      users[userIndex].collection = updatedCollection;
      users[userIndex].coins = newCoins;
      localStorage.setItem('fut_users', JSON.stringify(users));
    }
  };

  // Load user session on mount & repair old collection caches automatically
  useEffect(() => {
    const activeUser = localStorage.getItem('fut_active_user');
    if (activeUser) {
      try {
        const parsed = JSON.parse(activeUser);
        // Load latest collection data from user DB
        const users = JSON.parse(localStorage.getItem('fut_users') || '[]');
        const dbUser = users.find(u => u.username.toLowerCase() === parsed.username.toLowerCase());
        
        if (dbUser) {
          setUser({ username: dbUser.username });
          setCoins(dbUser.coins !== undefined ? dbUser.coins : 500);
          
          // Set user specific active squad and formation
          if (dbUser.squad) {
            localStorage.setItem('fut_active_squad', JSON.stringify(dbUser.squad));
          } else {
            localStorage.removeItem('fut_active_squad');
          }
          if (dbUser.formation) {
            localStorage.setItem('fut_active_formation', dbUser.formation);
          } else {
            localStorage.setItem('fut_active_formation', '4-3-3');
          }
          
          // Repair collection items with updated properties from fallbackPlayers (e.g. correct photo URLs)
          let changed = false;
          const repairedCollection = (dbUser.collection || []).map(item => {
            const latest = fallbackPlayers.find(p => p.id === item.id);
            if (latest && latest.avatar !== item.avatar) {
              changed = true;
              return {
                ...item,
                avatar: latest.avatar,
                rating: latest.rating,
                position: latest.position,
                club: latest.club,
                nation: latest.nation,
                rarity: latest.rarity,
                pac: latest.pac,
                sho: latest.sho,
                pas: latest.pas,
                dri: latest.dri,
                def: latest.def,
                phy: latest.phy
              };
            }
            return item;
          });
          
          setCollection(repairedCollection);
          
          if (changed) {
            dbUser.collection = repairedCollection;
            const userIndex = users.findIndex(u => u.username.toLowerCase() === parsed.username.toLowerCase());
            if (userIndex !== -1) {
              users[userIndex] = dbUser;
              localStorage.setItem('fut_users', JSON.stringify(users));
            }
          }
        } else {
          // Clean corrupt session
          localStorage.removeItem('fut_active_user');
        }
      } catch (e) {
        localStorage.removeItem('fut_active_user');
      }
    }
  }, []);

  const handleLoginSuccess = (dbUser) => {
    setUser({ username: dbUser.username });
    setCollection(dbUser.collection || []);
    setCoins(dbUser.coins !== undefined ? dbUser.coins : 500);
    
    // Load user specific active squad and formation
    if (dbUser.squad) {
      localStorage.setItem('fut_active_squad', JSON.stringify(dbUser.squad));
    } else {
      localStorage.removeItem('fut_active_squad');
    }
    if (dbUser.formation) {
      localStorage.setItem('fut_active_formation', dbUser.formation);
    } else {
      localStorage.setItem('fut_active_formation', '4-3-3');
    }
    
    setActiveTab('daily');
  };

  const handleLogout = () => {
    localStorage.removeItem('fut_active_user');
    localStorage.removeItem('fut_active_squad');
    localStorage.removeItem('fut_active_formation');
    setUser(null);
    setCollection([]);
    setCoins(0);
    setActiveTab('daily');
  };

  const handleCardsDrawn = (updatedCollection) => {
    setCollection(updatedCollection);
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
        coins={coins}
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        {!user ? (
          <Auth onLoginSuccess={handleLoginSuccess} lang={lang} />
        ) : (
          <>
            {activeTab === 'daily' && (
              <DailyPack 
                user={user} 
                onCardsDrawn={handleCardsDrawn} 
                lang={lang} 
                coins={coins}
                onUpdateCoins={updateCoins}
              />
            )}
            
            {activeTab === 'collection' && (
              <MyCollection 
                collection={collection} 
                lang={lang} 
                onOpenPackRedirect={() => setActiveTab('daily')}
                onQuickSell={handleQuickSell}
              />
            )}
            
            {activeTab === 'squad' && (
              <SquadBuilder 
                collection={collection} 
                lang={lang} 
                coins={coins}
                onUpdateCoins={updateCoins}
              />
            )}
            
            {activeTab === 'leaderboard' && (
              <Leaderboard 
                collection={collection} 
                lang={lang} 
                user={user}
                coins={coins}
                onUpdateCoins={updateCoins}
              />
            )}
            
            {activeTab === 'match' && (
              <MatchSimulator 
                collection={collection} 
                lang={lang} 
                user={user}
                coins={coins}
                onUpdateCoins={updateCoins}
              />
            )}
            
            {activeTab === 'api' && (
              <ApiSettings 
                user={user} 
                lang={lang} 
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <p>© 2026 FUT Ultimate Team Clone. Built for local development and testing.</p>
      </footer>

      <CookieBanner lang={lang} />
    </div>
  );
}
