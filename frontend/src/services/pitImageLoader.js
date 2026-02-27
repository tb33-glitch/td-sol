// Pit Image Loader — resolves and preloads token/NFT images
// Handles ipfs:// URIs, data URIs, CORS proxying

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

function resolveImageUrl(url) {
  if (!url) return null;

  // data: URIs — use directly
  if (url.startsWith('data:')) return url;

  // ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return IPFS_GATEWAYS[0] + cid;
  }

  // ar:// (Arweave)
  if (url.startsWith('ar://')) {
    return 'https://arweave.net/' + url.replace('ar://', '');
  }

  // Already an http(s) URL
  if (url.startsWith('http')) return url;

  return null;
}

function loadImage(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error('timeout'));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('load failed'));
    };

    img.src = url;
  });
}

export async function preloadPitImages(holdings) {
  const imageMap = new Map();
  const allItems = [
    ...holdings.tokens.map((t) => ({ ...t, _tier: 'token' })),
    ...holdings.nfts.map((n) => ({ ...n, _tier: 'nft' })),
  ];

  const loadPromises = allItems.map(async (item) => {
    const url = resolveImageUrl(item.imageUrl);
    if (!url) return;

    try {
      const img = await loadImage(url);
      const key = item.type === 'erc721' || item.type === 'erc1155'
        ? `${item.address}_${item.tokenId || '0'}`
        : item.address;

      imageMap.set(key, {
        name: item.name,
        symbol: item.symbol,
        image: img,
        address: item.address,
        type: item.type,
        tokenId: item.tokenId,
      });
    } catch {
      // Skip images that fail to load
    }
  });

  await Promise.allSettled(loadPromises);
  return imageMap;
}
