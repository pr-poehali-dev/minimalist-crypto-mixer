import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CryptoChart {
  symbol: string;
  name: string;
  color: string;
  logo: string;
  price: string;
  change: string;
  positive: boolean;
  data: number[];
}

const generateChartData = (seed: number, positive: boolean): number[] => {
  const points: number[] = [];
  let value = 50 + seed * 10;
  for (let i = 0; i < 40; i++) {
    const trend = positive ? 0.3 : -0.3;
    value += (Math.sin(i * 0.5 + seed) * 3) + (Math.cos(i * 0.3 + seed * 2) * 2) + trend;
    value = Math.max(10, Math.min(90, value));
    points.push(value);
  }
  return points;
};

const CRYPTOS: CryptoChart[] = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', price: '$96,847', change: '+2.34%', positive: true, data: generateChartData(1, true) },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', price: '$3,421', change: '+1.87%', positive: true, data: generateChartData(2, true) },
  { symbol: 'SOL', name: 'Solana', color: '#9945FF', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', price: '$187.32', change: '-0.54%', positive: false, data: generateChartData(3, false) },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', price: '$628.15', change: '+3.12%', positive: true, data: generateChartData(4, true) },
  { symbol: 'XRP', name: 'Ripple', color: '#23292F', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', price: '$2.41', change: '+0.98%', positive: true, data: generateChartData(5, true) },
  { symbol: 'TON', name: 'Toncoin', color: '#0098EA', logo: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png', price: '$5.87', change: '-1.23%', positive: false, data: generateChartData(6, false) },
];

function MiniChart({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  const width = 200;
  const height = 60;
  const padding = 2;

  const path = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = (width - padding * 2) / (data.length - 1);

    const points = data.map((v, i) => ({
      x: padding + i * stepX,
      y: height - padding - ((v - min) / range) * (height - padding * 2),
    }));

    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + stepX * 0.4;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - stepX * 0.4;
      const cp2y = points[i].y;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
    }

    const areaD = d + ` L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

    return { line: d, area: areaD };
  }, [data]);

  const gradientId = `grad-${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={path.area} fill={`url(#${gradientId})`} />
      <path d={path.line} fill="none" stroke={positive ? color : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CryptoChartsDisplay() {
  return (
    <div className="w-full h-full bg-white p-4 md:p-6 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-black tracking-tight">Криптовалюты</h3>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">Обновление в реальном времени</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded text-[11px] text-gray-500 font-mono">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 flex-1 min-h-0">
        {CRYPTOS.map((crypto, i) => (
          <motion.div
            key={crypto.symbol}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex flex-col bg-neutral-50 border border-gray-200 rounded-lg p-3 md:p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <img src={crypto.logo} alt={crypto.symbol} className="w-6 h-6 rounded-full" />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-black block leading-tight">{crypto.symbol}</span>
                <span className="text-[10px] text-gray-400 block leading-tight">{crypto.name}</span>
              </div>
            </div>

            <div className="flex-1 min-h-[40px] md:min-h-[50px] my-1.5">
              <MiniChart data={crypto.data} color={crypto.color} positive={crypto.positive} />
            </div>

            <div className="flex items-end justify-between mt-auto">
              <span className="text-sm md:text-base font-semibold text-black font-mono">{crypto.price}</span>
              <span className={`text-xs font-mono font-medium ${crypto.positive ? 'text-green-600' : 'text-red-500'}`}>
                {crypto.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
