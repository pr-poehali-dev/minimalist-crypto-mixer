export interface CoinInfo {
  symbol: string;
  name: string;
  logo: string;
  network?: string;
  rateKey: string;
  color: string;
}

export const COINS_LIST: CoinInfo[] = [
  { symbol: 'BTC', name: 'Bitcoin', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', rateKey: 'BTC', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', rateKey: 'ETH', color: '#627EEA' },
  { symbol: 'USDT-TRC20', name: 'Tether', logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', network: 'TRC20', rateKey: 'USDT', color: '#26A17B' },
  { symbol: 'USDT-ERC20', name: 'Tether', logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', network: 'ERC20', rateKey: 'USDT', color: '#26A17B' },
  { symbol: 'USDC-ERC20', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', network: 'ERC20', rateKey: 'USDC', color: '#2775CA' },
  { symbol: 'USDC-TRC20', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', network: 'TRC20', rateKey: 'USDC', color: '#2775CA' },
  { symbol: 'BNB', name: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', rateKey: 'BNB', color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', rateKey: 'SOL', color: '#9945FF' },
  { symbol: 'XRP', name: 'Ripple', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', rateKey: 'XRP', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', rateKey: 'ADA', color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', logo: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', rateKey: 'DOGE', color: '#C2A633' },
  { symbol: 'LTC', name: 'Litecoin', logo: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', rateKey: 'LTC', color: '#345D9D' },
  { symbol: 'XMR', name: 'Monero', logo: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png', rateKey: 'XMR', color: '#FF6600' },
  { symbol: 'TRX', name: 'TRON', logo: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png', rateKey: 'TRX', color: '#EF0027' },
  { symbol: 'TON', name: 'Toncoin', logo: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png', rateKey: 'TON', color: '#0098EA' },
  { symbol: 'AVAX', name: 'Avalanche', logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', rateKey: 'AVAX', color: '#E84142' },
  { symbol: 'DOT', name: 'Polkadot', logo: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', rateKey: 'DOT', color: '#E6007A' },
  { symbol: 'MATIC', name: 'Polygon', logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', rateKey: 'MATIC', color: '#8247E5' },
  { symbol: 'LINK', name: 'Chainlink', logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', rateKey: 'LINK', color: '#2A5ADA' },
  { symbol: 'UNI', name: 'Uniswap', logo: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg', rateKey: 'UNI', color: '#FF007A' },
  { symbol: 'ATOM', name: 'Cosmos', logo: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png', rateKey: 'ATOM', color: '#2E3148' },
  { symbol: 'FIL', name: 'Filecoin', logo: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png', rateKey: 'FIL', color: '#0090FF' },
  { symbol: 'APT', name: 'Aptos', logo: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png', rateKey: 'APT', color: '#4DBA87' },
  { symbol: 'NEAR', name: 'NEAR Protocol', logo: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg', rateKey: 'NEAR', color: '#00C08B' },
  { symbol: 'ARB', name: 'Arbitrum', logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg', rateKey: 'ARB', color: '#28A0F0' },
  { symbol: 'OP', name: 'Optimism', logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png', rateKey: 'OP', color: '#FF0420' },
  { symbol: 'SUI', name: 'Sui', logo: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg', rateKey: 'SUI', color: '#4DA2FF' },
  { symbol: 'SHIB', name: 'Shiba Inu', logo: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png', rateKey: 'SHIB', color: '#FFA409' },
  { symbol: 'PEPE', name: 'Pepe', logo: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg', rateKey: 'PEPE', color: '#4E9A06' },
  { symbol: 'ETC', name: 'Ethereum Classic', logo: 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png', rateKey: 'ETC', color: '#328332' },
  { symbol: 'BCH', name: 'Bitcoin Cash', logo: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png', rateKey: 'BCH', color: '#8DC351' },
  { symbol: 'XLM', name: 'Stellar', logo: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png', rateKey: 'XLM', color: '#14B6E7' },
  { symbol: 'ALGO', name: 'Algorand', logo: 'https://assets.coingecko.com/coins/images/4380/small/download.png', rateKey: 'ALGO', color: '#000000' },
  { symbol: 'VET', name: 'VeChain', logo: 'https://assets.coingecko.com/coins/images/1167/small/VeChain-Logo-768x725.png', rateKey: 'VET', color: '#15BDFF' },
  { symbol: 'FTM', name: 'Fantom', logo: 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png', rateKey: 'FTM', color: '#1969FF' },
  { symbol: 'AAVE', name: 'Aave', logo: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png', rateKey: 'AAVE', color: '#B6509E' },
  { symbol: 'GRT', name: 'The Graph', logo: 'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png', rateKey: 'GRT', color: '#6747ED' },
  { symbol: 'INJ', name: 'Injective', logo: 'https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png', rateKey: 'INJ', color: '#00F2FE' },
  { symbol: 'RENDER', name: 'Render', logo: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png', rateKey: 'RENDER', color: '#000000' },
  { symbol: 'FET', name: 'Fetch.ai', logo: 'https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg', rateKey: 'FET', color: '#1B1464' },
  { symbol: 'SAND', name: 'The Sandbox', logo: 'https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg', rateKey: 'SAND', color: '#00ADEF' },
  { symbol: 'MANA', name: 'Decentraland', logo: 'https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png', rateKey: 'MANA', color: '#FF2D55' },
  { symbol: 'AXS', name: 'Axie Infinity', logo: 'https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png', rateKey: 'AXS', color: '#0055D5' },
  { symbol: 'CRV', name: 'Curve DAO', logo: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png', rateKey: 'CRV', color: '#FF2D2D' },
  { symbol: 'DASH', name: 'Dash', logo: 'https://assets.coingecko.com/coins/images/19/small/dash-logo.png', rateKey: 'DASH', color: '#008CE7' },
  { symbol: 'ZEC', name: 'Zcash', logo: 'https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png', rateKey: 'ZEC', color: '#ECB244' },
  { symbol: 'EOS', name: 'EOS', logo: 'https://assets.coingecko.com/coins/images/738/small/eos-eos-logo.png', rateKey: 'EOS', color: '#000000' },
  { symbol: 'CAKE', name: 'PancakeSwap', logo: 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png', rateKey: 'CAKE', color: '#D1884F' },
  { symbol: 'ENS', name: 'Ethereum Name Service', logo: 'https://assets.coingecko.com/coins/images/19785/small/acatxTm8_400x400.jpg', rateKey: 'ENS', color: '#5284FF' },
  { symbol: 'WLD', name: 'Worldcoin', logo: 'https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg', rateKey: 'WLD', color: '#000000' },
  { symbol: 'SEI', name: 'Sei', logo: 'https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png', rateKey: 'SEI', color: '#9B1B30' },
  { symbol: 'BONK', name: 'Bonk', logo: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg', rateKey: 'BONK', color: '#F9A825' },
];

export const getCoinInfo = (symbol: string): CoinInfo => {
  return COINS_LIST.find(c => c.symbol === symbol) || { symbol, name: symbol, logo: '', rateKey: symbol, color: '#666666' };
};
