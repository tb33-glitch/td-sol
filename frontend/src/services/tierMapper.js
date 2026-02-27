// Tier Mapper — maps pit token holdings to bloon tier pools
// Tiers 1-5 (red→pink): ERC-20 by balance magnitude
// Tier 6 (lead/whale): Highest-value ERC-20s
// Tier 7 (camo): ERC-1155 semi-fungibles
// Tier 8 (moab/boss): ERC-721 NFTs

const TIER_IDS = ['red', 'blue', 'green', 'yellow', 'pink', 'lead', 'camo', 'moab'];

export function mapTokensToTiers(holdings, imageMap) {
  const tiers = {};
  TIER_IDS.forEach((id) => { tiers[id] = []; });

  // Sort ERC-20s by balance (ascending — micro balances = weak enemies)
  const erc20s = [...holdings.tokens]
    .filter((t) => imageMap.has(t.address))
    .sort((a, b) => a.balance - b.balance);

  // Split ERC-20s across tiers 1-6
  if (erc20s.length > 0) {
    // Reserve top ~10% for lead (tier 6)
    const leadCut = Math.max(1, Math.floor(erc20s.length * 0.1));
    const leadTokens = erc20s.splice(-leadCut, leadCut);
    leadTokens.forEach((t) => {
      const entry = imageMap.get(t.address);
      if (entry) tiers.lead.push({ ...entry, textureKey: `pit_${t.address}` });
    });

    // Distribute remaining across tiers 1-5
    const tierSlots = ['red', 'blue', 'green', 'yellow', 'pink'];
    const chunkSize = Math.max(1, Math.ceil(erc20s.length / tierSlots.length));

    tierSlots.forEach((tierId, idx) => {
      const start = idx * chunkSize;
      const end = Math.min(start + chunkSize, erc20s.length);
      for (let i = start; i < end; i++) {
        const t = erc20s[i];
        const entry = imageMap.get(t.address);
        if (entry) tiers[tierId].push({ ...entry, textureKey: `pit_${t.address}` });
      }
    });
  }

  // ERC-1155 → camo tier
  const erc1155s = holdings.nfts
    .filter((n) => n.type === 'erc1155')
    .filter((n) => imageMap.has(`${n.address}_${n.tokenId || '0'}`));

  erc1155s.forEach((n) => {
    const key = `${n.address}_${n.tokenId || '0'}`;
    const entry = imageMap.get(key);
    if (entry) tiers.camo.push({ ...entry, textureKey: `pit_${key}` });
  });

  // ERC-721 → moab/boss tier
  const erc721s = holdings.nfts
    .filter((n) => n.type === 'erc721')
    .filter((n) => imageMap.has(`${n.address}_${n.tokenId || '0'}`));

  erc721s.forEach((n) => {
    const key = `${n.address}_${n.tokenId || '0'}`;
    const entry = imageMap.get(key);
    if (entry) tiers.moab.push({ ...entry, textureKey: `pit_${key}` });
  });

  return tiers;
}
