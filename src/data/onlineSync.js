const getActiveSlots = (formation) => {
  const rows = formation === '4-3-3' ? [['LW', 'ST', 'RW'], ['CM', 'CAM', 'CDM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']] :
               formation === '4-4-2' ? [['ST1', 'ST2'], ['LM', 'CM1', 'CM2', 'RM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']] :
               formation === '3-5-2' ? [['ST1', 'ST2'], ['LM', 'CM1', 'CAM', 'CM2', 'RM'], ['CB1', 'CB2', 'CB3'], ['GK']] :
               [['ST'], ['LAM', 'CAM', 'RAM'], ['LDM', 'RDM'], ['LB', 'CB1', 'CB2', 'RB'], ['GK']];
  return rows.flat();
};

export const serializeSquad = (username, ovr, chem, squad, formation) => {
  const activeSlots = getActiveSlots(formation);
  const players = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);
  const playersStr = players.map(p => {
    const lastName = (p.name.split(' ').pop() || p.name).substring(0, 12).replace(/[|:;]/g, '');
    const rating = p.rating;
    const pos = p.position;
    const nation = (p.nation || 'Unknown').substring(0, 10).replace(/[|:;]/g, '');
    return `${lastName}:${rating}:${pos}:${nation}`;
  }).join(';');
  return `${username.substring(0, 15).replace(/[|:;]/g, '')}|${ovr}|${chem}|${playersStr}`;
};

export const deserializeSquad = (serializedStr) => {
  try {
    const parts = serializedStr.split('|');
    if (parts.length < 4) return null;
    const username = parts[0];
    const ovr = parseInt(parts[1], 10);
    const chem = parseInt(parts[2], 10);
    const playersPart = parts[3];
    const players = playersPart.split(';').map(pStr => {
      const pParts = pStr.split(':');
      if (pParts.length < 4) return null;
      return {
        name: pParts[0],
        rating: parseInt(pParts[1], 10),
        position: pParts[2],
        nation: pParts[3]
      };
    }).filter(p => p !== null);
    
    return {
      id: `online_${username.toLowerCase()}`,
      name: username,
      ovr,
      chem,
      logo: username.substring(0, 2).toUpperCase(),
      color: '#10b981', // green for online
      reward: 1.3,
      isOnline: true,
      incomplete: players.length < 11,
      players
    };
  } catch (e) {
    console.error('Failed to deserialize squad:', e);
    return null;
  }
};

export const syncSquadToOnlineDB = async (username, squad, formation) => {
  if (!username || !squad) return;
  const activeSlots = getActiveSlots(formation);
  const players = activeSlots.map(slot => squad[slot]).filter(p => p !== null && p !== undefined);

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

  try {
    const serialized = serializeSquad(username, ovr, totalChem, squad, formation);
    
    // 1. Set squad
    const key = `fifa26_squad_${username.toLowerCase()}`;
    const setSquadUrl = `https://api.keyval.org/set/${key}/${encodeURIComponent(serialized)}`;
    await fetch(setSquadUrl);

    // 2. Add to user list
    const getListUrl = `https://api.keyval.org/get/fifa26_users_list_key_new`;
    const listRes = await fetch(getListUrl);
    const listJson = await listRes.json();
    
    let currentList = [];
    if (listJson.status === 'SUCCESS' && listJson.val) {
      currentList = listJson.val.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }
    
    const userLower = username.toLowerCase();
    currentList = currentList.filter(u => u !== userLower);
    currentList.push(userLower);
    
    // Limit list to last 15 users
    if (currentList.length > 15) {
      currentList = currentList.slice(-15);
    }
    
    const newListVal = currentList.join(',');
    const setListUrl = `https://api.keyval.org/set/fifa26_users_list_key_new/${encodeURIComponent(newListVal)}`;
    await fetch(setListUrl);
  } catch (e) {
    console.error('Failed to sync squad online:', e);
  }
};

export const fetchOnlineSquads = async () => {
  try {
    const listRes = await fetch('https://api.keyval.org/get/fifa26_users_list_key_new');
    const listJson = await listRes.json();
    
    if (listJson.status === 'SUCCESS' && listJson.val) {
      const usernames = listJson.val.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      
      const promises = usernames.map(async (uname) => {
        try {
          const res = await fetch(`https://api.keyval.org/get/fifa26_squad_${uname}`);
          const json = await res.json();
          if (json.status === 'SUCCESS' && json.val) {
            return deserializeSquad(json.val);
          }
        } catch (e) {
          console.error(`Failed to fetch online squad for ${uname}:`, e);
        }
        return null;
      });
      
      const resolved = await Promise.all(promises);
      return resolved.filter(s => s !== null);
    }
  } catch (e) {
    console.error('Failed to fetch online squads:', e);
  }
  return [];
};
