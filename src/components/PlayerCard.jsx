import React from 'react';

// Pre-defined SVG flag icons for popular nationalities
const NationFlag = ({ nation }) => {
  const flags = {
    france: (
      <svg viewBox="0 0 3 2" className="card-badge-icon">
        <rect width="1" height="2" fill="#002395" />
        <rect x="1" width="1" height="2" fill="#FFFFFF" />
        <rect x="2" width="1" height="2" fill="#ED2939" />
      </svg>
    ),
    england: (
      <svg viewBox="0 0 25 15" className="card-badge-icon">
        <rect width="25" height="15" fill="#FFFFFF" />
        <rect x="11" width="3" height="15" fill="#C8102E" />
        <rect y="6" width="25" height="3" fill="#C8102E" />
      </svg>
    ),
    portugal: (
      <svg viewBox="0 0 600 400" className="card-badge-icon">
        <rect width="240" height="400" fill="#006600" />
        <rect x="240" width="360" height="400" fill="#FF0000" />
        <circle cx="240" cy="200" r="60" fill="#FFFF00" opacity="0.8" />
      </svg>
    ),
    brazil: (
      <svg viewBox="0 0 220 154" className="card-badge-icon">
        <rect width="220" height="154" fill="#009C3B" />
        <polygon points="110,8 208,77 110,146 12,77" fill="#FFDF00" />
        <circle cx="110" cy="77" r="31" fill="#002776" />
      </svg>
    ),
    argentina: (
      <svg viewBox="0 0 3 2" className="card-badge-icon">
        <rect width="3" height="2" fill="#74ACDF" />
        <rect y="0.66" width="3" height="0.68" fill="#FFFFFF" />
        <circle cx="1.5" cy="1" r="0.2" fill="#F6B40E" />
      </svg>
    ),
    spain: (
      <svg viewBox="0 0 3 2" className="card-badge-icon">
        <rect width="3" height="2" fill="#C11B17" />
        <rect y="0.5" width="3" height="1" fill="#FDD017" />
      </svg>
    ),
    germany: (
      <svg viewBox="0 0 5 3" className="card-badge-icon">
        <rect width="5" height="1" fill="#000000" />
        <rect y="1" width="5" height="1" fill="#FF0000" />
        <rect y="2" width="5" height="1" fill="#FFCC00" />
      </svg>
    ),
    netherlands: (
      <svg viewBox="0 0 3 2" className="card-badge-icon">
        <rect width="3" height="0.67" fill="#AE1C28" />
        <rect y="0.67" width="3" height="0.67" fill="#FFFFFF" />
        <rect y="1.34" width="3" height="0.67" fill="#21468B" />
      </svg>
    ),
    belgium: (
      <svg viewBox="0 0 3 2" className="card-badge-icon">
        <rect width="1" height="2" fill="#000000" />
        <rect x="1" width="1" height="2" fill="#FFE300" />
        <rect x="2" width="1" height="2" fill="#ED2939" />
      </svg>
    ),
    turkey: (
      <svg viewBox="0 0 1200 800" className="card-badge-icon">
        <rect width="1200" height="800" fill="#E30A17" />
        <circle cx="400" cy="400" r="200" fill="#FFFFFF" />
        <circle cx="450" cy="400" r="160" fill="#E30A17" />
        <polygon points="575,340 575,460 670,400" fill="#FFFFFF" />
      </svg>
    ),
    norway: (
      <svg viewBox="0 0 22 16" className="card-badge-icon">
        <rect width="22" height="16" fill="#BA0C2F" />
        <rect x="6" width="4" height="16" fill="#FFFFFF" />
        <rect y="6" width="22" height="4" fill="#FFFFFF" />
        <rect x="7" width="2" height="16" fill="#00205B" />
        <rect y="7" width="22" height="2" fill="#00205B" />
      </svg>
    )
  };

  const key = nation.toLowerCase();
  return flags[key] || (
    <div className="card-badge-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold', border: '1px solid currentColor', borderRadius: '2px' }}>
      {nation.substring(0, 3).toUpperCase()}
    </div>
  );
};

// Custom dynamic silhouette drawing depending on player rarity
const PlayerSilhouette = ({ rarity, name }) => {
  let fillColor = '#334155';
  let glowColor = 'transparent';
  let strokeColor = 'rgba(0,0,0,0.1)';

  if (rarity === 'toty') {
    fillColor = '#005f73';
    glowColor = '#00e5ff';
    strokeColor = '#00e5ff';
  } else if (rarity === 'icon') {
    fillColor = '#8c6b12';
    glowColor = '#ffd700';
    strokeColor = '#ffd700';
  } else if (rarity === 'gold') {
    fillColor = '#5c4308';
    glowColor = '#ffeaa7';
    strokeColor = 'rgba(242, 205, 92, 0.4)';
  }

  return (
    <svg viewBox="0 0 100 100" className="player-avatar-svg">
      <defs>
        {glowColor !== 'transparent' && (
          <filter id={`glow-${rarity}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
        <radialGradient id={`bgGrad-${rarity}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={rarity === 'toty' ? '#072559' : rarity === 'icon' ? '#ffd700' : '#eedd82'} stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Background radial glow */}
      <circle cx="50" cy="50" r="45" fill={`url(#bgGrad-${rarity})`} />

      {/* Footballer Silhouette Shape */}
      <g filter={glowColor !== 'transparent' ? `url(#glow-${rarity})` : ''}>
        {/* Head */}
        <circle cx="50" cy="28" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
        
        {/* Neck */}
        <rect x="47" y="36" width="6" height="6" rx="2" fill={fillColor} />
        
        {/* Shoulders & Body */}
        <path 
          d="M 28 50 C 28 42, 38 40, 50 40 C 62 40, 72 42, 72 50 C 72 65, 78 95, 78 95 L 22 95 C 22 95, 28 65, 28 50 Z" 
          fill={fillColor} 
          stroke={strokeColor} 
          strokeWidth="1.5"
        />

        {/* Dynamic Stylized Shirt Collar Detail */}
        <polygon points="45,40 55,40 50,48" fill={rarity === 'toty' ? '#0a192f' : '#ffffff'} opacity="0.3" />
      </g>
    </svg>
  );
};

// Custom dynamic club logo/shield generator
const ClubLogo = ({ club }) => {
  let initial = club ? club.charAt(0) : 'FC';
  if (club && club.includes(' ')) {
    const parts = club.split(' ');
    initial = parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '');
  }

  // Get some club-specific colors
  const getClubColors = (name) => {
    const n = name.toLowerCase();
    if (n.includes('madrid')) return { bg: '#ffffff', text: '#111827', border: '#e2b74b' };
    if (n.includes('manchester city')) return { bg: '#87ceeb', text: '#ffffff', border: '#111827' };
    if (n.includes('liverpool') || n.includes('nassr') || n.includes('galatasaray')) return { bg: '#991b1b', text: '#e2b74b', border: '#e2b74b' };
    if (n.includes('barcelona')) return { bg: '#85072d', text: '#e2b74b', border: '#0a4275' };
    if (n.includes('bayern')) return { bg: '#dc2626', text: '#ffffff', border: '#2563eb' };
    if (n.includes('inter')) return { bg: '#1d4ed8', text: '#ffffff', border: '#111827' };
    if (n.includes('arsenal')) return { bg: '#ef4444', text: '#ffffff', border: '#ffffff' };
    if (n.includes('icon')) return { bg: '#111827', text: '#ffd700', border: '#ffd700' };
    return { bg: '#1e293b', text: '#ffffff', border: '#475569' };
  };

  const colors = getClubColors(club);

  return (
    <div 
      className="card-badge-icon" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '9px', 
        fontWeight: '900', 
        backgroundColor: colors.bg, 
        color: colors.text,
        border: `1.5px solid ${colors.border}`, 
        borderRadius: '50%',
        width: '18px',
        height: '18px'
      }}
    >
      {initial.substring(0, 2).toUpperCase()}
    </div>
  );
};

export default function PlayerCard({ player, onClick, isFlipped = false, showStats = true }) {
  if (!player) return null;

  const [imageError, setImageError] = React.useState(false);

  const {
    name,
    rating,
    position,
    club,
    nation,
    rarity = 'gold',
    avatar,
    pac,
    sho,
    pas,
    dri,
    def,
    phy
  } = player;

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div className="fut-card-wrapper" onClick={handleCardClick}>
      <div className={`fut-card rarity-${rarity.toLowerCase()}`} style={{ transform: isFlipped ? 'rotateY(180deg)' : '' }}>
        {/* Card Front Side */}
        <div className="fut-card-front">
          {/* Card Top: Rating, Pos, Flag, Club + Silhouette */}
          <div className="card-top">
            <div className="card-badge">
              <span className="card-rating badge-val">{rating}</span>
              <span className="card-position badge-val">{position}</span>
              <hr />
              <NationFlag nation={nation} />
              <div style={{ height: '4px' }} />
              <ClubLogo club={club} />
            </div>
            
            <div className="card-portrait">
              <PlayerSilhouette rarity={rarity.toLowerCase()} name={name} />
            </div>
          </div>

          {/* Card Bottom: Name & Stats Grid */}
          <div className="card-bottom">
            <div className="card-name">{name}</div>
            
            {showStats && (
              <div className="card-stats-grid">
                <div className="stat-item">
                  <span className="stat-val badge-val">{pac}</span>
                  <span className="stat-lbl">PAC</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val badge-val">{dri}</span>
                  <span className="stat-lbl">DRI</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val badge-val">{sho}</span>
                  <span className="stat-lbl">SHO</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val badge-val">{def}</span>
                  <span className="stat-lbl">DEF</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val badge-val">{pas}</span>
                  <span className="stat-lbl">PAS</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val badge-val">{phy}</span>
                  <span className="stat-lbl">PHY</span>
                </div>
              </div>
            )}

            <div className="card-footer-info">
              <span>FIFA 26</span>
            </div>
          </div>
        </div>

        {/* Card Back Side (Shown during pack opening flip) */}
        <div className="fut-card-back">
          <div className="pack-logo-glow" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚽</div>
          <div style={{ color: '#ffd700', fontWeight: '800', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>FUT 26</div>
          <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '1rem' }}>ULTIMATE TEAM</div>
        </div>
      </div>
    </div>
  );
}
