// Pit Token Service — Fetches dead tokens/NFTs from The Pit contract
// Uses Alchemy Enhanced API to get holdings of the pit address

const PIT_ADDRESS = '0x7b3D401f1f3c7BFF7bB273Ad5a36d98E0F7aE642';
const CACHE_KEY = 'pit_holdings_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getAlchemyBaseUrl() {
  const key = import.meta.env.VITE_ALCHEMY_API_KEY;
  if (!key) return null;
  return `https://eth-mainnet.g.alchemy.com/v2/${key}`;
}

function getCachedHoldings() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedHoldings(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full or unavailable — skip
  }
}

async function fetchTokenBalances(baseUrl) {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getTokenBalances',
      params: [PIT_ADDRESS, 'erc20'],
    }),
  });
  const json = await res.json();
  if (!json.result) return [];
  return json.result.tokenBalances.filter(
    (t) => t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  );
}

async function fetchTokenMetadata(baseUrl, contractAddress) {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getTokenMetadata',
      params: [contractAddress],
    }),
  });
  const json = await res.json();
  return json.result || null;
}

async function fetchNFTs(baseUrl) {
  const url = `${baseUrl}/getNFTsForOwner?owner=${PIT_ADDRESS}&withMetadata=true&pageSize=50`;
  const res = await fetch(url);
  const json = await res.json();
  return json.ownedNfts || [];
}

export async function getPitHoldings() {
  // Check cache first
  const cached = getCachedHoldings();
  if (cached) return cached;

  const baseUrl = getAlchemyBaseUrl();
  if (!baseUrl) {
    console.warn('[PitService] No VITE_ALCHEMY_API_KEY set, skipping pit token fetch');
    return { tokens: [], nfts: [], total: 0 };
  }

  const holdings = { tokens: [], nfts: [], total: 0 };

  try {
    // Fetch ERC-20 tokens
    const balances = await fetchTokenBalances(baseUrl);

    // Fetch metadata for each token (batch, limit to first 50)
    const tokenPromises = balances.slice(0, 50).map(async (token) => {
      const meta = await fetchTokenMetadata(baseUrl, token.contractAddress);
      if (!meta) return null;
      const decimals = meta.decimals || 18;
      const rawBalance = BigInt(token.tokenBalance);
      const balance = Number(rawBalance) / Math.pow(10, decimals);
      return {
        address: token.contractAddress,
        name: meta.name || 'Unknown',
        symbol: meta.symbol || '???',
        type: 'erc20',
        imageUrl: meta.logo || null,
        balance,
        decimals,
      };
    });

    const tokens = (await Promise.all(tokenPromises)).filter(Boolean);
    holdings.tokens = tokens;

    // Fetch NFTs (ERC-721 + ERC-1155)
    const nfts = await fetchNFTs(baseUrl);
    holdings.nfts = nfts.map((nft) => {
      const tokenType = nft.contract?.tokenType || 'ERC721';
      return {
        address: nft.contract?.address || '',
        name: nft.name || nft.contract?.name || 'Unknown NFT',
        symbol: nft.contract?.symbol || '???',
        type: tokenType === 'ERC1155' ? 'erc1155' : 'erc721',
        imageUrl: nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl || null,
        tokenId: nft.tokenId,
        balance: nft.balance ? Number(nft.balance) : 1,
      };
    });

    holdings.total = holdings.tokens.length + holdings.nfts.length;

    setCachedHoldings(holdings);
    return holdings;
  } catch (err) {
    console.error('[PitService] Failed to fetch pit holdings:', err);
    return holdings;
  }
}

export function clearPitCache() {
  localStorage.removeItem(CACHE_KEY);
}
