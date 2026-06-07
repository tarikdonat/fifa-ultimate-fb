import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import DailyPack from './components/DailyPack';
import MyCollection from './components/MyCollection';
import SquadBuilder from './components/SquadBuilder';
import ApiSettings from './components/ApiSettings';
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
    setActiveTab('daily');
  };

  const handleLogout = () => {
    localStorage.removeItem('fut_active_user');
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
    </div>
  );
}
