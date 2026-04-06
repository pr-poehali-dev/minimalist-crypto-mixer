import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '@/components/ui/basic-dropdown';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AvatarWithName } from '@/components/ui/avatar-with-name';
import { FlowButton } from '@/components/ui/flow-button';
import { OTPVerification } from '@/components/ui/otp-input';
import { GlassFilter } from '@/components/ui/liquid-radio';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ExchangesTable, Exchange } from '@/components/ui/exchanges-table';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import CryptoChartsDisplay from '@/components/ui/crypto-charts-display';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const API = {
  getRates: 'https://functions.poehali.dev/a3025fda-cd60-410f-b176-1e71ee19f4bf',
  createExchange: 'https://functions.poehali.dev/db89b501-844e-4f7e-b839-35b396842720',
  getExchanges: 'https://functions.poehali.dev/f55bda70-6145-4587-85c3-8b37d3275358',
  telegramAuth: 'https://functions.poehali.dev/aba6998f-8142-4edd-8e22-c24c005cf258',
};

interface CoinInfo {
  symbol: string;
  name: string;
  logo: string;
  network?: string;
  rateKey: string;
  color: string;
}

const COINS_LIST: CoinInfo[] = [
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
];

const getCoinInfo = (symbol: string): CoinInfo => {
  return COINS_LIST.find(c => c.symbol === symbol) || { symbol, name: symbol, logo: '', rateKey: symbol, color: '#666666' };
};

const ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123'];

interface Rates {
  [key: string]: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('exchange_username');
  });
  const [telegramUsername, setTelegramUsername] = useState(() => {
    return localStorage.getItem('exchange_username') || '';
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [authError, setAuthError] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [activeTab, setActiveTab] = useState('exchange');

  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [outputAddress, setOutputAddress] = useState('');

  const [rates, setRates] = useState<Rates>({});
  const [markupPercent, setMarkupPercent] = useState(2);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const resp = await fetch(API.getRates);
      const data = await resp.json();
      setRates(data.rates || {});
      setMarkupPercent(data.markup_percent || 2);
    } catch (e) {
      console.error('Failed to load rates', e);
    }
    setIsLoadingRates(false);
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const getExchangeRate = useCallback((from: string, to: string) => {
    const fromKey = getCoinInfo(from).rateKey;
    const toKey = getCoinInfo(to).rateKey;
    if (!rates[fromKey] || !rates[toKey]) return 0;
    const rawRate = rates[fromKey] / rates[toKey];
    const withMarkup = rawRate * (1 - markupPercent / 100);
    return withMarkup;
  }, [rates, markupPercent]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      setToAmount(rate > 0 ? (Number(value) * rate).toFixed(8) : '');
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(Number(value))) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      setFromAmount(rate > 0 ? (Number(value) / rate).toFixed(8) : '');
    } else {
      setFromAmount('');
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const selectFromCurrency = (coin: string) => {
    if (coin === toCurrency) setToCurrency(fromCurrency);
    setFromCurrency(coin);
    setShowFromDropdown(false);
    if (fromAmount) {
      const rate = getExchangeRate(coin, coin === toCurrency ? fromCurrency : toCurrency);
      setToAmount(rate > 0 ? (Number(fromAmount) * rate).toFixed(8) : '');
    }
  };

  const selectToCurrency = (coin: string) => {
    if (coin === fromCurrency) setFromCurrency(toCurrency);
    setToCurrency(coin);
    setShowToDropdown(false);
    if (fromAmount) {
      const rate = getExchangeRate(coin === fromCurrency ? toCurrency : fromCurrency, coin);
      setToAmount(rate > 0 ? (Number(fromAmount) * rate).toFixed(8) : '');
    }
  };

  useEffect(() => {
    if (fromAmount && rates[fromCurrency] && rates[toCurrency]) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      setToAmount(rate > 0 ? (Number(fromAmount) * rate).toFixed(8) : '');
    }
  }, [fromCurrency, toCurrency, rates]);

  const handleRequestCode = async () => {
    if (!inputUsername.trim()) return;
    setAuthError('');
    const username = (inputUsername.startsWith('@') ? inputUsername : '@' + inputUsername).toLowerCase();
    try {
      const resp = await fetch(API.telegramAuth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_code', telegram_username: username }),
      });
      const data = await resp.json();
      if (data.success) {
        setTelegramUsername(username);
        setIsCodeSent(true);
      } else {
        setAuthError(data.error || 'Ошибка отправки кода');
      }
    } catch (e) {
      console.error('Auth error', e);
      setAuthError('Ошибка соединения');
    }
  };

  const handleVerifyCode = async (code: string) => {
    setAuthError('');
    try {
      const resp = await fetch(API.telegramAuth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', telegram_username: telegramUsername, code }),
      });
      const data = await resp.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('exchange_username', telegramUsername);
      } else {
        setAuthError(data.error || 'Неверный код');
      }
    } catch (e) {
      console.error('Verify error', e);
      setAuthError('Ошибка соединения');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTelegramUsername('');
    setInputUsername('');
    setIsCodeSent(false);
    setActiveTab('exchange');
    localStorage.removeItem('exchange_username');
  };

  const handleResendCode = async () => {
    try {
      await fetch(API.telegramAuth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_code', telegram_username: telegramUsername }),
      });
    } catch (e) {
      console.error('Resend failed', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'my-exchanges') {
      setIsLoadingExchanges(true);
      fetch(API.getExchanges, { headers: { 'X-User-Username': telegramUsername } })
        .then(r => r.json())
        .then(data => {
          setExchanges(data.exchanges || []);
          setIsLoadingExchanges(false);
        })
        .catch(() => {
          setExchanges([]);
          setIsLoadingExchanges(false);
        });
    }
  }, [isAuthenticated, activeTab, telegramUsername]);

  const handleSubmitExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Пожалуйста, авторизуйтесь для создания обмена');
      return;
    }
    if (!fromAmount || !toAmount || !outputAddress) {
      alert('Заполните все поля');
      return;
    }

    setIsSubmitting(true);
    try {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      const resp = await fetch(API.createExchange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': telegramUsername },
        body: JSON.stringify({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          from_amount: fromAmount,
          to_amount: toAmount,
          rate: rate.toString(),
          output_address: outputAddress,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        navigate(`/order/${data.short_id}`);
      }
    } catch (err) {
      console.error('Exchange creation failed', err);
    }
    setIsSubmitting(false);
  };



  const currentRate = getExchangeRate(fromCurrency, toCurrency);

  const CurrencySelector = ({
    selected,
    isOpen,
    setIsOpen,
    onSelect,
  }: {
    selected: string;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    onSelect: (coin: string) => void;
    label?: string;
  }) => {
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
          className="flex items-center gap-1.5 bg-neutral-200/80 hover:bg-neutral-300/80 px-3 h-full rounded-r-sm text-black font-mono text-sm transition-colors border-l border-gray-300"
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
                className="absolute z-50 top-full right-0 mt-1.5 bg-white border-2 border-gray-300 rounded-md shadow-xl overflow-hidden"
                style={{ minWidth: '260px' }}
                onKeyDown={handleKeyDown}
              >
                <div className="p-2 border-b border-gray-200">
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                    placeholder="Поиск валюты..."
                    className="w-full px-2.5 py-1.5 text-sm bg-neutral-50 border border-gray-200 rounded outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div ref={listRef} className="max-h-64 overflow-y-auto overscroll-contain">
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                        coin.symbol === selected
                          ? 'bg-neutral-100 font-semibold'
                          : idx === activeIndex
                          ? 'bg-neutral-50'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <img src={coin.logo} alt={coin.symbol} className="w-5 h-5 rounded-full flex-shrink-0" />
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-border/50">
        <div className="px-8 py-6 flex items-center justify-between h-[73px]">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex-shrink-0">
            EXCHANGE
          </h1>
          <div className="inline-flex h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-0.5 shadow-sm border border-blue-100 overflow-hidden">
            <RadioGroup
              value={activeTab}
              onValueChange={setActiveTab}
              className="group relative inline-grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-[20%] after:rounded-md after:bg-gradient-to-br after:from-blue-500 after:to-blue-600 after:shadow-[0_0_6px_rgba(59,130,246,0.4),0_2px_8px_rgba(59,130,246,0.3)] after:transition-all after:duration-500 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=exchange]:after:translate-x-0 data-[state=my-exchanges]:after:translate-x-[100%] data-[state=about]:after:translate-x-[200%] data-[state=support]:after:translate-x-[300%] data-[state=faq]:after:translate-x-[400%]"
              data-state={activeTab}
            >
              <div
                className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md pointer-events-none"
                style={{ filter: 'url("#radio-glass")' }}
              />
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=exchange]:text-white group-data-[state=exchange]:font-semibold">
                Обмен
                <RadioGroupItem id="tab-exchange-h" value="exchange" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=my-exchanges]:text-white group-data-[state=my-exchanges]:font-semibold">
                Мои обмены
                <RadioGroupItem id="tab-my-exchanges-h" value="my-exchanges" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=about]:text-white group-data-[state=about]:font-semibold">
                О нас
                <RadioGroupItem id="tab-about-h" value="about" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=support]:text-white group-data-[state=support]:font-semibold">
                Поддержка
                <RadioGroupItem id="tab-support-h" value="support" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=faq]:text-white group-data-[state=faq]:font-semibold">
                FAQ
                <RadioGroupItem id="tab-faq-h" value="faq" className="sr-only" />
              </label>
              <GlassFilter />
            </RadioGroup>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {isAuthenticated ? (
              <Dropdown>
                <DropdownTrigger className="cursor-pointer">
                  <AvatarWithName
                    name={telegramUsername}
                    fallback={telegramUsername.slice(1, 3).toUpperCase()}
                    size="sm"
                    direction="left"
                  />
                </DropdownTrigger>
                <DropdownContent align="end" className="w-56">
                  <DropdownItem className="gap-2" onClick={() => setActiveTab('my-exchanges')}>
                    <Icon name="ClipboardList" size={16} />
                    Мои обмены
                  </DropdownItem>
                  <DropdownItem className="gap-2" onClick={() => setActiveTab('faq')}>
                    <Icon name="Info" size={16} />
                    FAQ
                  </DropdownItem>
                  {ADMIN_USERNAMES.includes(telegramUsername.toLowerCase()) && (
                    <>
                      <DropdownSeparator />
                      <DropdownItem className="gap-2" onClick={() => navigate('/admin')}>
                        <Icon name="Settings" size={16} />
                        Админ-панель
                      </DropdownItem>
                    </>
                  )}
                  <DropdownSeparator />
                  <DropdownItem className="gap-2" onClick={handleLogout} destructive>
                    <Icon name="LogOut" size={16} />
                    Выйти
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Войти через Telegram</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  {!isCodeSent ? (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 text-center">Вход через Telegram</h3>
                      <p className="text-center text-gray-600 mb-4 text-sm">
                        Введите username, мы отправим вам код
                      </p>
                      <div className="p-3 bg-blue-50 border border-blue-200 mb-4 text-xs text-blue-800">
                        <p className="font-semibold mb-1">Первый раз?</p>
                        <p>Сначала напишите <strong>/start</strong> нашему боту: <a href="https://t.me/wi_exchange_auth_bot" target="_blank" rel="noopener noreferrer" className="underline font-semibold">@wi_exchange_auth_bot</a></p>
                      </div>
                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 mb-4 text-xs text-red-700">
                          {authError}
                        </div>
                      )}
                      <div className="space-y-4">
                        <Input
                          placeholder="@username"
                          value={inputUsername}
                          onChange={(e) => { setInputUsername(e.target.value); setAuthError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleRequestCode()}
                          className="border-black/20 focus:border-black h-12"
                        />
                        <div onClick={handleRequestCode} className="w-full">
                          <FlowButton text="Получить код" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 mb-4 text-xs text-red-700">
                          {authError}
                        </div>
                      )}
                      <OTPVerification
                        inputCount={4}
                        onVerify={handleVerifyCode}
                        onResend={handleResendCode}
                        telegram_username={telegramUsername}
                      />
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="exchange" className="animate-fade-in">
              <div className="max-w-4xl mx-auto">
                  <Card className="border-2 border-gray-300 bg-white shadow-sm">
                    <CardHeader className="border-b-2 border-gray-300">
                      <CardTitle className="text-xl font-medium text-black tracking-tight flex items-center gap-2">
                        <Icon name="ArrowLeftRight" size={20} />
                        Обмен криптовалюты
                      </CardTitle>
                      <p className="text-gray-600 mt-1 text-sm">
                        {isLoadingRates ? 'Загрузка курсов...' : `Курсы обновляются каждые 30 сек`}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <form onSubmit={handleSubmitExchange} className="space-y-5">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: getCoinInfo(fromCurrency).color }}>Отправляете</label>
                              <span className="text-xs" style={{ color: getCoinInfo(fromCurrency).color }}>{getCoinInfo(fromCurrency).name}{getCoinInfo(fromCurrency).network ? ` (${getCoinInfo(fromCurrency).network})` : ''}</span>
                            </div>
                            <div className="flex items-center border-2 bg-neutral-50 h-12 transition-colors" style={{ borderColor: getCoinInfo(fromCurrency).color + '40' }}>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={fromAmount}
                                onChange={(e) => handleFromAmountChange(e.target.value)}
                                className="border-0 bg-transparent text-black font-mono placeholder:text-gray-400 h-full text-lg font-semibold shadow-none focus-visible:ring-0"
                              />
                              <CurrencySelector
                                selected={fromCurrency}
                                isOpen={showFromDropdown}
                                setIsOpen={(v) => { setShowFromDropdown(v); setShowToDropdown(false); }}
                                onSelect={selectFromCurrency}
                                label=""
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1.5 px-1">
                              <span className="text-[11px] font-mono">
                                {currentRate > 0 && (
                                  <span style={{ color: getCoinInfo(fromCurrency).color }}>
                                    1 {getCoinInfo(fromCurrency).rateKey} = {currentRate.toFixed(6)} {getCoinInfo(toCurrency).rateKey}
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] font-mono" style={{ color: getCoinInfo(fromCurrency).color + 'AA' }}>
                                {fromAmount && rates[getCoinInfo(fromCurrency).rateKey] ? `$${(Number(fromAmount) * rates[getCoinInfo(fromCurrency).rateKey]).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center pt-7">
                            <motion.button
                              type="button"
                              onClick={handleSwapCurrencies}
                              className="w-10 h-10 border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors hover:border-gray-400 rounded-full shadow-sm flex-shrink-0"
                              whileTap={{ scale: 0.9, rotate: 180 }}
                              whileHover={{ scale: 1.08 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            >
                              <Icon name="ArrowLeftRight" size={16} className="text-gray-600" />
                            </motion.button>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: getCoinInfo(toCurrency).color }}>Получаете</label>
                              <span className="text-xs" style={{ color: getCoinInfo(toCurrency).color }}>{getCoinInfo(toCurrency).name}{getCoinInfo(toCurrency).network ? ` (${getCoinInfo(toCurrency).network})` : ''}</span>
                            </div>
                            <div className="flex items-center border-2 bg-neutral-50 h-12 transition-colors" style={{ borderColor: getCoinInfo(toCurrency).color + '40' }}>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={toAmount}
                                onChange={(e) => handleToAmountChange(e.target.value)}
                                className="border-0 bg-transparent text-black font-mono placeholder:text-gray-400 h-full text-lg font-semibold shadow-none focus-visible:ring-0"
                              />
                              <CurrencySelector
                                selected={toCurrency}
                                isOpen={showToDropdown}
                                setIsOpen={(v) => { setShowToDropdown(v); setShowFromDropdown(false); }}
                                onSelect={selectToCurrency}
                                label=""
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1.5 px-1">
                              <span className="text-[11px] font-mono">
                                {currentRate > 0 && (
                                  <span style={{ color: getCoinInfo(toCurrency).color }}>
                                    1 {getCoinInfo(toCurrency).rateKey} = {(1 / currentRate).toFixed(8)} {getCoinInfo(fromCurrency).rateKey}
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] font-mono" style={{ color: getCoinInfo(toCurrency).color + 'AA' }}>
                                {toAmount && rates[getCoinInfo(toCurrency).rateKey] ? `$${(Number(toAmount) * rates[getCoinInfo(toCurrency).rateKey]).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Назначение</label>
                          </div>
                          <Input
                            placeholder={`Ваш ${getCoinInfo(toCurrency).name}${getCoinInfo(toCurrency).network ? ` (${getCoinInfo(toCurrency).network})` : ''} адрес`}
                            value={outputAddress}
                            onChange={(e) => setOutputAddress(e.target.value)}
                            className="bg-neutral-50 border-2 border-gray-300 text-black font-mono placeholder:text-gray-400 h-12"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-sm font-semibold bg-black hover:bg-gray-800 text-white uppercase tracking-wider transition-all"
                          disabled={!fromAmount || !toAmount || !outputAddress || isSubmitting || isLoadingRates}
                        >
                          {isSubmitting ? 'Создание заявки...' : `Обменять ${getCoinInfo(fromCurrency).rateKey} на ${getCoinInfo(toCurrency).rateKey}`}
                        </Button>

                        {!isAuthenticated && (
                          <p className="text-center text-xs text-gray-400">
                            Для создания обмена необходима авторизация
                          </p>
                        )}
                      </form>
                    </CardContent>
                  </Card>
              </div>

              <ContainerScroll
                titleComponent={
                  <>
                    <h2 className="text-3xl md:text-4xl font-semibold text-black">
                      <span className="text-4xl md:text-[5rem] font-bold mt-1 leading-none">
                        Почему именно мы
                      </span>
                    </h2>
                  </>
                }
              >
                <CryptoChartsDisplay />
              </ContainerScroll>
            </TabsContent>

            <TabsContent value="my-exchanges" className="animate-fade-in">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Мои обмены</h2>
                  <p className="text-gray-600 mt-2">
                    История всех ваших операций обмена
                  </p>
                </div>
                {!isAuthenticated ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">Авторизуйтесь для просмотра обменов</p>
                  </div>
                ) : isLoadingExchanges ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ExchangesTable exchanges={exchanges} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="about" className="animate-fade-in">
              <div className="space-y-16 max-w-6xl mx-auto">

                <div className="text-center space-y-6 py-8">
                  <h2 className="text-5xl font-bold text-black leading-tight">Мгновенный обмен<br/>криптовалют</h2>
                  <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
                    Наш сервис создан для тех, кто ценит скорость, конфиденциальность и простоту. Обменивайте криптовалюты без регистрации аккаунта, без лимитов и без скрытых комиссий.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {[
                    { value: '15+', label: 'Криптовалют', icon: 'Coins', color: 'from-blue-500 to-indigo-500' },
                    { value: '24/7', label: 'Без выходных', icon: 'Clock', color: 'from-green-500 to-emerald-500' },
                    { value: '~15 мин', label: 'Время обмена', icon: 'Zap', color: 'from-yellow-500 to-orange-500' },
                    { value: '0%', label: 'Скрытых комиссий', icon: 'BadgePercent', color: 'from-purple-500 to-pink-500' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                      <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-5`}>
                        <Icon name={stat.icon} size={28} className="text-white" />
                      </div>
                      <p className="text-3xl font-bold text-black">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-center text-black mb-10">Почему выбирают нас</h3>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { icon: 'Shield', color: '#3B82F6', title: 'Безопасность', desc: 'Мы не храним ваши средства. Каждый обмен — это прямая транзакция между кошельками. Никаких депозитов, никаких рисков.' },
                      { icon: 'Gauge', color: '#F97316', title: 'Скорость', desc: 'Большинство обменов завершаются в течение 15-30 минут. Оператор обрабатывает заявки в режиме реального времени.' },
                      { icon: 'Eye', color: '#22C55E', title: 'Прозрачность', desc: 'Курс фиксируется в момент создания заявки. Вы видите точную сумму получения до начала обмена.' },
                      { icon: 'Lock', color: '#8B5CF6', title: 'Конфиденциальность', desc: 'Минимум данных для обмена. Мы не требуем KYC-верификацию и не передаём данные третьим лицам.' },
                      { icon: 'Headphones', color: '#EC4899', title: 'Поддержка 24/7', desc: 'Наша команда всегда на связи. Возникли вопросы — напишите нам в Telegram, и мы поможем.' },
                      { icon: 'TrendingUp', color: '#06B6D4', title: 'Лучшие курсы', desc: 'Курсы обновляются каждые 30 секунд. Мы агрегируем данные с ведущих бирж для лучших котировок.' },
                    ].map(feature => (
                      <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white p-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: feature.color + '15' }}>
                          <Icon name={feature.icon} size={26} style={{ color: feature.color }} />
                        </div>
                        <p className="font-bold text-black text-xl mb-2">{feature.title}</p>
                        <p className="text-base text-gray-500 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-12">
                  <h3 className="text-3xl font-bold text-center text-black mb-12">Как это работает</h3>
                  <div className="grid grid-cols-3 gap-12">
                    {[
                      { step: '01', title: 'Выберите валюту', desc: 'Укажите какую криптовалюту хотите обменять и какую получить. Курс рассчитается автоматически.', icon: 'ArrowLeftRight' },
                      { step: '02', title: 'Отправьте средства', desc: 'Переведите указанную сумму на предоставленный адрес. Нажмите "Я отправил" для подтверждения.', icon: 'Send' },
                      { step: '03', title: 'Получите результат', desc: 'После подтверждения оплаты оператор отправит криптовалюту на ваш кошелёк. Отслеживайте статус онлайн.', icon: 'CheckCircle' },
                    ].map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                          <Icon name={s.icon} size={36} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-blue-500 uppercase tracking-wider">Шаг {s.step}</span>
                        <p className="text-xl font-bold text-black mt-2">{s.title}</p>
                        <p className="text-base text-gray-500 mt-3 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-12">
                  <h3 className="text-3xl font-bold text-center text-black mb-8">Поддерживаемые криптовалюты</h3>
                  <p className="text-center text-gray-500 mb-10 text-lg">Обменивайте любую из представленных валют в любом направлении</p>
                  <div className="grid grid-cols-5 gap-4">
                    {COINS_LIST.map(coin => (
                      <div key={coin.symbol} className="flex items-center gap-3 px-5 py-4 bg-neutral-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all">
                        <img src={coin.logo} alt={coin.symbol} className="w-8 h-8 rounded-full" />
                        <div>
                          <span className="font-bold text-base text-black block">{coin.rateKey}</span>
                          {coin.network && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{coin.network}</span>}
                          {!coin.network && <span className="text-xs text-gray-400">{coin.name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="support" className="animate-fade-in">
              <div className="max-w-3xl mx-auto">
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold text-black">Поддержка</h2>
                    <p className="text-lg text-gray-500">Напишите нам в Telegram — оператор ответит в кратчайшие сроки</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <a
                      href="https://t.me/wi_exchange_sup_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-6 p-6 border-2 border-blue-100 bg-blue-50/50 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                        <Icon name="HeadphonesIcon" size={28} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-black">Написать в поддержку</p>
                        <p className="text-sm text-gray-500 mt-1">@wi_exchange_sup_bot — бот поддержки</p>
                        <p className="text-xs text-blue-600 mt-2 font-medium">Создайте тикет или просто напишите вопрос — оператор ответит</p>
                      </div>
                      <Icon name="ExternalLink" size={20} className="text-gray-400 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <Icon name="Clock" size={22} className="text-green-600" />
                      </div>
                      <p className="font-bold text-black text-lg">24/7</p>
                      <p className="text-sm text-gray-500 mt-1">Работаем без выходных</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <Icon name="MessageCircle" size={22} className="text-blue-600" />
                      </div>
                      <p className="font-bold text-black text-lg">~15 мин</p>
                      <p className="text-sm text-gray-500 mt-1">Среднее время ответа</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                        <Icon name="Languages" size={22} className="text-purple-600" />
                      </div>
                      <p className="font-bold text-black text-lg">RU / EN</p>
                      <p className="text-sm text-gray-500 mt-1">Языки поддержки</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Icon name="AlertTriangle" size={20} className="text-yellow-700" />
                      </div>
                      <div>
                        <p className="font-bold text-yellow-800">Будьте бдительны</p>
                        <p className="text-sm text-yellow-700 mt-1">Мы никогда не просим ваши пароли, seed-фразы или приватные ключи. Не отправляйте средства по ссылкам из непроверенных источников.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="animate-fade-in">
              <div className="max-w-3xl mx-auto space-y-6">
                <Card className="border-2">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Как пользоваться обменником</CardTitle>
                    <p className="text-gray-600 mt-2">Пошаговая инструкция</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      {
                        num: '1',
                        title: 'Авторизация',
                        icon: 'Lock',
                        desc: 'Нажмите "Войти через Telegram" в правом верхнем углу. Введите username и код из бота.',
                      },
                      {
                        num: '2',
                        title: 'Выбор валютной пары',
                        icon: 'ArrowLeftRight',
                        desc: 'Выберите валюту, которую хотите отдать, и валюту, которую хотите получить. Курс рассчитается автоматически.',
                      },
                      {
                        num: '3',
                        title: 'Ввод суммы и адреса',
                        icon: 'Wallet',
                        desc: 'Введите сумму обмена и адрес кошелька, на который хотите получить криптовалюту.',
                      },
                      {
                        num: '4',
                        title: 'Оплата',
                        icon: 'Send',
                        desc: 'После создания заявки вы получите адрес для перевода. Отправьте точную сумму на указанный адрес.',
                      },
                      {
                        num: '5',
                        title: 'Получение',
                        icon: 'CheckCircle',
                        desc: 'После подтверждения оплаты оператор обработает заявку и отправит криптовалюту на ваш адрес.',
                      },
                    ].map(step => (
                      <div key={step.num} className="border-l-4 border-gray-900 pl-6 py-4">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">{step.num}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                            <div className="flex items-center gap-2 text-gray-500 mt-0.5">
                              <Icon name={step.icon} size={14} />
                              <span className="text-xs uppercase tracking-wide">{step.title}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 ml-14">{step.desc}</p>
                      </div>
                    ))}

                    <div className="mt-8 p-5 bg-neutral-100 border-2 border-gray-300">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Поддерживаемые валюты</h3>
                      <div className="flex flex-wrap gap-2">
                        {COINS_LIST.map(coin => (
                          <span key={coin.symbol} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-sm font-mono">
                            <img src={coin.logo} alt={coin.symbol} className="w-4 h-4 rounded-full" />
                            {coin.rateKey}
                            {coin.network && <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">{coin.network}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;