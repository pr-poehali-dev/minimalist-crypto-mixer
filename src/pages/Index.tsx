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
import { COINS_LIST, getCoinInfo } from '@/lib/coins';
import AboutTab from '@/components/AboutTab';
import SupportTab from '@/components/SupportTab';
import FaqTab from '@/components/FaqTab';
import Footer from '@/components/Footer';
import { HowItWorks, PopularPairs, StatsSection, TrustBanner } from '@/components/HeroSections';
import { InteractiveMenu, InteractiveMenuItem } from '@/components/ui/modern-mobile-menu';
import { ArrowLeftRight, ClipboardList, Info, Headphones, HelpCircle, Gift } from 'lucide-react';
import ReferralTab from '@/components/ReferralTab';

const API = {
  getRates: 'https://functions.poehali.dev/a3025fda-cd60-410f-b176-1e71ee19f4bf',
  createExchange: 'https://functions.poehali.dev/db89b501-844e-4f7e-b839-35b396842720',
  getExchanges: 'https://functions.poehali.dev/f55bda70-6145-4587-85c3-8b37d3275358',
  telegramAuth: 'https://functions.poehali.dev/aba6998f-8142-4edd-8e22-c24c005cf258',
  referral: 'https://functions.poehali.dev/2ae57ed9-acd8-4db7-badf-3788ebdbf00b',
};

const ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123'];

const MOBILE_MENU_ITEMS: InteractiveMenuItem[] = [
  { label: 'Обмен', icon: ArrowLeftRight, value: 'exchange' },
  { label: 'Обмены', icon: ClipboardList, value: 'my-exchanges' },
  { label: 'Партнёры', icon: Gift, value: 'referral' },
  { label: 'Поддержка', icon: Headphones, value: 'support' },
  { label: 'О нас', icon: Info, value: 'about' },
  { label: 'FAQ', icon: HelpCircle, value: 'faq' },
];

const TAB_TO_INDEX: Record<string, number> = {
  'exchange': 0,
  'my-exchanges': 1,
  'referral': 2,
  'support': 3,
  'about': 4,
  'faq': 5,
};

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
  const [activeTab, setActiveTabRaw] = useState('exchange');
  const [discountCheckNeeded, setDiscountCheckNeeded] = useState(false);
  const setActiveTab = (tab: string) => {
    setActiveTabRaw(tab);
    if (tab === 'exchange') setDiscountCheckNeeded(true);
    window.scrollTo({ top: 0 });
  };

  const [fromCurrency, setFromCurrency] = useState('USDT-TRC20');
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
  const [hasReferralDiscount, setHasReferralDiscount] = useState(false);

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

  const checkDiscount = useCallback(async () => {
    if (!isAuthenticated || !telegramUsername) return;
    try {
      const resp = await fetch(API.referral, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': telegramUsername },
        body: JSON.stringify({ action: 'check_discount' }),
      });
      const data = await resp.json();
      setHasReferralDiscount(!!data.has_discount);
    } catch { /* ignore */ }
  }, [isAuthenticated, telegramUsername]);

  useEffect(() => {
    fetchRates();
    checkDiscount();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, [fetchRates, checkDiscount]);

  useEffect(() => {
    if (discountCheckNeeded) {
      checkDiscount();
      setDiscountCheckNeeded(false);
    }
  }, [discountCheckNeeded, checkDiscount]);

  const getExchangeRate = useCallback((from: string, to: string) => {
    const fromKey = getCoinInfo(from).rateKey;
    const toKey = getCoinInfo(to).rateKey;
    if (!rates[fromKey] || !rates[toKey]) return 0;
    const rawRate = rates[fromKey] / rates[toKey];
    const effectiveMarkup = hasReferralDiscount ? Math.max(0, markupPercent - 1) : markupPercent;
    const withMarkup = rawRate * (1 - effectiveMarkup / 100);
    return withMarkup;
  }, [rates, markupPercent, hasReferralDiscount]);

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
          use_discount: hasReferralDiscount,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        if (data.discount_applied) setHasReferralDiscount(false);
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-border/50">
        <div className="px-4 py-3 md:px-8 md:py-6 flex items-center justify-between h-[57px] md:h-[73px]">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex-shrink-0">
            BLQOU
          </h1>

          {/* Mobile auth button */}
          <div className="md:hidden">
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
                  {ADMIN_USERNAMES.includes(telegramUsername.toLowerCase()) && (
                    <>
                      <DropdownItem className="gap-2" onClick={() => navigate('/admin')}>
                        <Icon name="Settings" size={16} />
                        Админ-панель
                      </DropdownItem>
                      <DropdownSeparator />
                    </>
                  )}
                  <DropdownItem className="gap-2" onClick={handleLogout} destructive>
                    <Icon name="LogOut" size={16} />
                    Выйти
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">Войти</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  {!isCodeSent ? (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 text-center">Вход через Telegram</h3>
                      <p className="text-center text-gray-600 mb-4 text-sm">Введите username, мы отправим вам код</p>
                      <div className="p-3 bg-blue-50 border border-blue-200 mb-4 text-xs text-blue-800">
                        <p className="font-semibold mb-1">Первый раз?</p>
                        <p>Сначала напишите <strong>/start</strong> нашему боту: <a href="https://t.me/wi_exchange_auth_bot" target="_blank" rel="noopener noreferrer" className="underline font-semibold">@wi_exchange_auth_bot</a></p>
                      </div>
                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 mb-4 text-xs text-red-700">{authError}</div>
                      )}
                      <div className="space-y-4">
                        <Input
                          placeholder="@username"
                          value={inputUsername}
                          onChange={(e) => { setInputUsername(e.target.value); setAuthError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleRequestCode()}
                          className="border-gray-300 focus:border-blue-500 h-12"
                        />
                        <div onClick={handleRequestCode} className="w-full">
                          <FlowButton text="Получить код" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 mb-4 text-xs text-red-700">{authError}</div>
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

          {/* Desktop tab bar */}
          <div className="hidden md:inline-flex h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-0.5 shadow-sm border border-blue-100 overflow-hidden">
            <RadioGroup
              value={activeTab}
              onValueChange={setActiveTab}
              className="group relative inline-grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-[16.666%] after:rounded-md after:bg-gradient-to-br after:from-blue-500 after:to-blue-600 after:shadow-[0_0_6px_rgba(59,130,246,0.4),0_2px_8px_rgba(59,130,246,0.3)] after:transition-all after:duration-500 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=exchange]:after:translate-x-0 data-[state=my-exchanges]:after:translate-x-[100%] data-[state=referral]:after:translate-x-[200%] data-[state=support]:after:translate-x-[300%] data-[state=about]:after:translate-x-[400%] data-[state=faq]:after:translate-x-[500%]"
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
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=referral]:text-white group-data-[state=referral]:font-semibold">
                Партнёрство
                <RadioGroupItem id="tab-referral-h" value="referral" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=support]:text-white group-data-[state=support]:font-semibold">
                Поддержка
                <RadioGroupItem id="tab-support-h" value="support" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=about]:text-white group-data-[state=about]:font-semibold">
                О нас
                <RadioGroupItem id="tab-about-h" value="about" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=faq]:text-white group-data-[state=faq]:font-semibold">
                FAQ
                <RadioGroupItem id="tab-faq-h" value="faq" className="sr-only" />
              </label>
              <GlassFilter />
            </RadioGroup>
          </div>
          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
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
                  <DropdownItem className="gap-2" onClick={() => setActiveTab('referral')}>
                    <Icon name="Gift" size={16} />
                    Партнёрство
                  </DropdownItem>
                  <DropdownItem className="gap-2" onClick={() => setActiveTab('support')}>
                    <Icon name="Headphones" size={16} />
                    Поддержка
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
                          className="border-gray-300 focus:border-blue-500 h-12"
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

      <main className="flex-1 px-3 py-6 md:px-4 md:py-12 pb-20 md:pb-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="exchange" className="animate-fade-in">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Мгновенный обмен криптовалют</h2>
                  <p className="text-gray-500 mt-2 text-sm md:text-base">Быстро, анонимно, без регистрации</p>
                </div>

                  {hasReferralDiscount && (
                    <div className="mb-4 relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-4 md:p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="Percent" size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-green-800 text-sm md:text-base">Скидка 1% на этот обмен</p>
                          <p className="text-green-600 text-xs md:text-sm">Активирована по реферальному коду — действует на первый обмен</p>
                        </div>
                        <div className="ml-auto hidden md:flex items-center gap-1 bg-green-100 text-green-700 font-bold text-lg px-4 py-1.5 rounded-lg">
                          <span>−1%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Card className="border border-gray-200 md:border-2 md:border-gray-300 bg-white shadow-sm">
                    <CardHeader className="border-b border-gray-200 md:border-b-2 md:border-gray-300 px-4 py-4 md:px-6 md:py-6">
                      <CardTitle className="text-lg md:text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
                        <Icon name="ArrowLeftRight" size={18} className="md:hidden" />
                        <Icon name="ArrowLeftRight" size={20} className="hidden md:block" />
                        Обмен криптовалюты
                      </CardTitle>
                      <p className="text-gray-600 mt-1 text-xs md:text-sm">
                        {isLoadingRates ? 'Загрузка курсов...' : hasReferralDiscount ? 'Курсы обновляются каждые 30 сек · скидка 1% применена' : 'Курсы обновляются каждые 30 сек'}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
                      <form onSubmit={handleSubmitExchange} className="space-y-5">
                        <div className="flex flex-col md:flex-row items-stretch md:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: getCoinInfo(fromCurrency).color }}>Отправляете</label>
                              <span className="text-xs" style={{ color: getCoinInfo(fromCurrency).color }}>{getCoinInfo(fromCurrency).name}{getCoinInfo(fromCurrency).network ? ` (${getCoinInfo(fromCurrency).network})` : ''}</span>
                            </div>
                            <div className="flex items-center border border-gray-200 bg-neutral-50 h-12 rounded-lg transition-colors" style={{ borderColor: getCoinInfo(fromCurrency).color + '25' }}>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={fromAmount}
                                onChange={(e) => handleFromAmountChange(e.target.value)}
                                className="border-0 bg-transparent text-gray-800 font-mono placeholder:text-gray-400 h-full text-lg font-semibold shadow-none focus-visible:ring-0 rounded-lg"
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

                          <div className="flex items-center pt-0 md:pt-7 justify-center">
                            <motion.button
                              type="button"
                              onClick={handleSwapCurrencies}
                              className="w-10 h-10 border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors hover:border-gray-400 rounded-full shadow-sm flex-shrink-0"
                              whileTap={{ scale: 0.9, rotate: 180 }}
                              whileHover={{ scale: 1.08 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            >
                              <Icon name="ArrowUpDown" size={16} className="text-gray-600 md:hidden" />
                              <Icon name="ArrowLeftRight" size={16} className="text-gray-600 hidden md:block" />
                            </motion.button>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: getCoinInfo(toCurrency).color }}>Получаете</label>
                              <span className="text-xs" style={{ color: getCoinInfo(toCurrency).color }}>{getCoinInfo(toCurrency).name}{getCoinInfo(toCurrency).network ? ` (${getCoinInfo(toCurrency).network})` : ''}</span>
                            </div>
                            <div className="flex items-center border border-gray-200 bg-neutral-50 h-12 rounded-lg transition-colors" style={{ borderColor: getCoinInfo(toCurrency).color + '25' }}>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={toAmount}
                                onChange={(e) => handleToAmountChange(e.target.value)}
                                className="border-0 bg-transparent text-gray-800 font-mono placeholder:text-gray-400 h-full text-lg font-semibold shadow-none focus-visible:ring-0 rounded-lg"
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
                                    1 {getCoinInfo(toCurrency).rateKey} = {(1 / currentRate).toFixed(6)} {getCoinInfo(fromCurrency).rateKey}
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] font-mono" style={{ color: getCoinInfo(toCurrency).color + 'AA' }}>
                                {toAmount && rates[getCoinInfo(toCurrency).rateKey] ? `$${(Number(toAmount) * rates[getCoinInfo(toCurrency).rateKey]).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Адрес получения</label>
                            <span className="text-xs text-gray-400">{getCoinInfo(toCurrency).name}{getCoinInfo(toCurrency).network ? ` (${getCoinInfo(toCurrency).network})` : ''}</span>
                          </div>
                          <Input
                            placeholder={`Ваш ${getCoinInfo(toCurrency).name}${getCoinInfo(toCurrency).network ? ` (${getCoinInfo(toCurrency).network})` : ''} адрес`}
                            value={outputAddress}
                            onChange={(e) => setOutputAddress(e.target.value)}
                            className="bg-neutral-50 border-2 border-gray-300 text-gray-800 font-mono placeholder:text-gray-400 h-12"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white uppercase tracking-wider transition-all"
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

              <HowItWorks />

              <StatsSection />

              <PopularPairs />

              <div className="hidden md:block">
                <ContainerScroll
                  titleComponent={
                    <>
                      <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
                        <span className="text-4xl md:text-[5rem] font-bold mt-1 leading-none">
                          Почему именно мы
                        </span>
                      </h2>
                    </>
                  }
                >
                  <CryptoChartsDisplay />
                </ContainerScroll>
              </div>
              <div className="md:hidden py-10 px-4">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Почему именно мы</h2>
                <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                  <CryptoChartsDisplay />
                </div>
              </div>

              <TrustBanner />

              <Footer />
            </TabsContent>

            <TabsContent value="my-exchanges" className="animate-fade-in">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900">Мои обмены</h2>
                  <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
                    История всех ваших операций обмена
                  </p>
                </div>
                {!isAuthenticated ? (
                  <div className="text-center py-10 md:py-16">
                    <p className="text-gray-500 text-sm md:text-lg">Авторизуйтесь для просмотра обменов</p>
                  </div>
                ) : isLoadingExchanges ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ExchangesTable exchanges={exchanges} />
                )}
              </div>
              <Footer />
            </TabsContent>

            <TabsContent value="referral" className="animate-fade-in">
              <ReferralTab telegramUsername={telegramUsername} isAuthenticated={isAuthenticated} />
            </TabsContent>

            <TabsContent value="about" className="animate-fade-in">
              <AboutTab />
            </TabsContent>

            <TabsContent value="support" className="animate-fade-in">
              <SupportTab />
            </TabsContent>

            <TabsContent value="faq" className="animate-fade-in">
              <FaqTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
        <InteractiveMenu
          items={MOBILE_MENU_ITEMS}
          activeIndex={TAB_TO_INDEX[activeTab] ?? 0}
          accentColor="hsl(220, 80%, 55%)"
          onItemClick={(_index, item) => {
            if (item.value) setActiveTab(item.value);
          }}
        />
      </div>
    </div>
  );
};

export default Index;