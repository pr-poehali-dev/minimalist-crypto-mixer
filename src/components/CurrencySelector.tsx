import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/icon';
import { COINS_LIST, getCoinInfo } from '@/lib/coins';

interface CurrencySelectorProps {
  selected: string;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onSelect: (coin: string) => void;
  label?: string;
  rates: Record<string, number>;
}

const CurrencySelector = ({
  selected,
  isOpen,
  setIsOpen,
  onSelect,
  rates,
}: CurrencySelectorProps) => {
  const info = getCoinInfo(selected);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COINS_LIST;
    return COINS_LIST.filter(
      c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q) || c.rateKey.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) onSelect(filtered[activeIndex].symbol);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-transparent hover:bg-neutral-100/60 px-3 h-full rounded-r-lg text-gray-800 font-mono text-sm transition-colors"
      >
        {info.logo && <img src={info.logo} alt={info.symbol} className="w-5 h-5 rounded-full" />}
        <span className="font-semibold">{info.rateKey}</span>
        {info.network && <span className="text-[9px] bg-gray-300 text-gray-700 px-1 rounded">{info.network}</span>}
        <Icon name="ChevronDown" size={12} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-50 bg-white flex flex-col md:absolute md:inset-auto md:top-full md:right-0 md:mt-1.5 md:border-2 md:border-gray-300 md:rounded-md md:shadow-xl md:overflow-hidden md:flex-none"
              style={{ minWidth: '260px' }}
              onKeyDown={handleKeyDown}
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 md:p-2">
                <span className="text-sm font-semibold text-gray-700 md:hidden">Выберите валюту</span>
                <button type="button" onClick={() => setIsOpen(false)} className="md:hidden p-1">
                  <Icon name="X" size={20} className="text-gray-500" />
                </button>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                  placeholder="Поиск валюты..."
                  className="hidden md:block w-full px-2.5 py-1.5 text-sm bg-neutral-50 border border-gray-200 rounded outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div className="px-3 py-2 border-b border-gray-200 md:hidden">
                <input
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                  placeholder="Поиск валюты..."
                  autoFocus
                  className="w-full px-3 py-2 text-base bg-neutral-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain md:max-h-64">
                {filtered.length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">Ничего не найдено</div>
                )}
                {filtered.map((coin, idx) => (
                  <motion.button
                    key={coin.symbol}
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: idx * 0.015 }}
                    onClick={() => onSelect(coin.symbol)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 md:px-3 md:py-2.5 text-sm transition-colors ${
                      coin.symbol === selected
                        ? 'bg-neutral-100 font-semibold'
                        : idx === activeIndex
                        ? 'bg-neutral-50'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <img src={coin.logo} alt={coin.symbol} className="w-6 h-6 md:w-5 md:h-5 rounded-full flex-shrink-0" />
                    <span className="flex flex-col items-start">
                      <span className="font-mono text-sm flex items-center gap-1.5">
                        {coin.rateKey}
                        {coin.network && <span className="text-[10px] bg-gray-200 text-gray-500 px-1 rounded font-normal">{coin.network}</span>}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">{coin.name}</span>
                    </span>
                    {rates[coin.rateKey] && <span className="ml-auto text-xs text-gray-400 font-mono">${rates[coin.rateKey].toLocaleString()}</span>}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySelector;
