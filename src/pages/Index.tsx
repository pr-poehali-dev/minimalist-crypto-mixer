import { useState, useEffect, useCallback } from 'react';
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
import Icon from '@/components/ui/icon';

const API = {
  getRates: 'https://functions.poehali.dev/a3025fda-cd60-410f-b176-1e71ee19f4bf',
  createExchange: 'https://functions.poehali.dev/db89b501-844e-4f7e-b839-35b396842720',
  getExchanges: 'https://functions.poehali.dev/f55bda70-6145-4587-85c3-8b37d3275358',
  telegramAuth: 'https://functions.poehali.dev/aba6998f-8142-4edd-8e22-c24c005cf258',
};

const COIN_ICONS: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Gem', USDT: 'DollarSign', USDC: 'CircleDollarSign',
  BNB: 'Hexagon', SOL: 'Sun', XRP: 'Droplets', ADA: 'Heart',
  DOGE: 'Dog', LTC: 'Coins', XMR: 'Shield', TRX: 'Triangle', TON: 'Diamond',
};

interface Rates {
  [key: string]: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [activeTab, setActiveTab] = useState('exchange');

  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [outputAddress, setOutputAddress] = useState('');

  const [rates, setRates] = useState<Rates>({});
  const [markupPercent, setMarkupPercent] = useState(2);
  const [coins, setCoins] = useState<string[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(false);

  const [depositAddress, setDepositAddress] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdExchange, setCreatedExchange] = useState<{
    fromCurrency: string; toCurrency: string; fromAmount: string;
    toAmount: string; rate: number; outputAddress: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const resp = await fetch(API.getRates);
      const data = await resp.json();
      setRates(data.rates || {});
      setMarkupPercent(data.markup_percent || 2);
      setCoins(data.coins || []);
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
    if (!rates[from] || !rates[to]) return 0;
    const rawRate = rates[to] / rates[from];
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
    const username = inputUsername.startsWith('@') ? inputUsername : '@' + inputUsername;
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
      }
    } catch {
      setTelegramUsername(username);
      setIsCodeSent(true);
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      const resp = await fetch(API.telegramAuth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', telegram_username: telegramUsername, code }),
      });
      const data = await resp.json();
      if (data.success) {
        setIsAuthenticated(true);
      }
    } catch {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTelegramUsername('');
    setInputUsername('');
    setIsCodeSent(false);
    setActiveTab('exchange');
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
        setDepositAddress(data.deposit_address);
        setCreatedExchange({
          fromCurrency, toCurrency, fromAmount, toAmount, rate, outputAddress,
        });
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error('Exchange creation failed', err);
    }
    setIsSubmitting(false);
  };

  const handleNewExchange = () => {
    setShowConfirmation(false);
    setDepositAddress('');
    setCreatedExchange(null);
    setFromAmount('');
    setToAmount('');
    setOutputAddress('');
  };

  const currentRate = getExchangeRate(fromCurrency, toCurrency);

  const CurrencySelector = ({
    selected,
    isOpen,
    setIsOpen,
    onSelect,
    label,
  }: {
    selected: string;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    onSelect: (coin: string) => void;
    label: string;
  }) => (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-neutral-100 border-2 border-gray-300 px-4 h-11 text-black font-mono text-sm hover:border-gray-400 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon name={COIN_ICONS[selected] || 'Circle'} size={16} />
          {selected}
        </span>
        <Icon name="ChevronDown" size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-y-auto">
          {coins.map(coin => (
            <button
              key={coin}
              type="button"
              onClick={() => onSelect(coin)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-mono hover:bg-neutral-100 transition-colors ${coin === selected ? 'bg-neutral-100 font-semibold' : ''}`}
            >
              <Icon name={COIN_ICONS[coin] || 'Circle'} size={14} />
              {coin}
              {rates[coin] && <span className="ml-auto text-xs text-gray-400">${rates[coin].toLocaleString()}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-border/50">
        <div className="px-8 py-6 flex items-center justify-between h-[73px]">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            EXCHANGE
          </h1>
          <div className="flex items-center gap-4">
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
                      <p className="text-center text-gray-600 mb-6 text-sm">
                        Введите username, мы отправим вам код
                      </p>
                      <div className="space-y-4">
                        <Input
                          placeholder="@username"
                          value={inputUsername}
                          onChange={(e) => setInputUsername(e.target.value)}
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
            <div className="mb-12 flex justify-center">
              <div className="inline-flex h-11 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-0.5 shadow-md border border-blue-100 overflow-hidden">
                <RadioGroup
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="group relative inline-grid grid-cols-[1fr_1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/3 after:rounded-md after:bg-gradient-to-br after:from-blue-500 after:to-blue-600 after:shadow-[0_0_6px_rgba(59,130,246,0.4),0_2px_8px_rgba(59,130,246,0.3)] after:transition-all after:duration-500 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=exchange]:after:translate-x-0 data-[state=my-exchanges]:after:translate-x-full data-[state=faq]:after:translate-x-[200%]"
                  data-state={activeTab}
                >
                  <div
                    className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md pointer-events-none"
                    style={{ filter: 'url("#radio-glass")' }}
                  />
                  <label className="relative z-10 inline-flex h-full min-w-[100px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-gray-600 group-data-[state=exchange]:text-white group-data-[state=exchange]:font-semibold">
                    Обмен
                    <RadioGroupItem id="tab-exchange" value="exchange" className="sr-only" />
                  </label>
                  <label className="relative z-10 inline-flex h-full min-w-[100px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-gray-600 group-data-[state=my-exchanges]:text-white group-data-[state=my-exchanges]:font-semibold">
                    Мои обмены
                    <RadioGroupItem id="tab-my-exchanges" value="my-exchanges" className="sr-only" />
                  </label>
                  <label className="relative z-10 inline-flex h-full min-w-[100px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-gray-600 group-data-[state=faq]:text-white group-data-[state=faq]:font-semibold">
                    FAQ
                    <RadioGroupItem id="tab-faq" value="faq" className="sr-only" />
                  </label>
                  <GlassFilter />
                </RadioGroup>
              </div>
            </div>

            <TabsContent value="exchange" className="animate-fade-in">
              <div className="max-w-2xl mx-auto">
                {showConfirmation && createdExchange ? (
                  <Card className="border-2 border-gray-300 bg-white shadow-sm">
                    <CardHeader className="border-b-2 border-gray-300">
                      <CardTitle className="text-xl font-medium text-black tracking-tight">Заявка создана</CardTitle>
                      <p className="text-gray-600 mt-1 text-sm">
                        Переведите средства на указанный адрес
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="p-6 bg-neutral-100 border-2 border-gray-300">
                        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Адрес для оплаты</h3>
                        <div className="bg-white p-4 border-2 border-gray-400 font-mono text-sm break-all text-black">
                          {depositAddress}
                        </div>
                        <Button
                          onClick={() => navigator.clipboard.writeText(depositAddress)}
                          className="w-full mt-4 bg-black hover:bg-gray-800 text-white h-11 font-semibold text-xs uppercase tracking-wider transition-all"
                        >
                          Копировать адрес
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Параметры обмена</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-neutral-100 border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Отдаёте</p>
                            <p className="text-base font-mono text-black font-medium">{createdExchange.fromAmount} {createdExchange.fromCurrency}</p>
                          </div>
                          <div className="p-4 bg-neutral-100 border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Получаете</p>
                            <p className="text-base font-mono text-black font-medium">{parseFloat(createdExchange.toAmount).toFixed(8)} {createdExchange.toCurrency}</p>
                          </div>
                          <div className="p-4 bg-neutral-100 border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Курс</p>
                            <p className="text-sm font-mono text-black">1 {createdExchange.fromCurrency} = {createdExchange.rate.toFixed(6)} {createdExchange.toCurrency}</p>
                          </div>
                          <div className="p-4 bg-neutral-100 border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Адрес получения</p>
                            <p className="font-mono text-xs break-all text-gray-700">{createdExchange.outputAddress}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-200 border-2 border-gray-400">
                        <p className="text-xs text-gray-800 font-medium">
                          Переведите точно <strong className="text-black font-semibold">{createdExchange.fromAmount} {createdExchange.fromCurrency}</strong> на адрес выше.
                          После подтверждения оплаты оператор обработает вашу заявку.
                        </p>
                      </div>

                      <Button
                        onClick={handleNewExchange}
                        className="w-full h-11 bg-white hover:bg-gray-100 text-black border-2 border-gray-400 font-semibold text-xs uppercase tracking-wider transition-all"
                      >
                        Новый обмен
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
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
                      <form onSubmit={handleSubmitExchange} className="space-y-4">
                        <div className="p-5 bg-neutral-50 border-2 border-gray-200 space-y-4">
                          <div className="grid grid-cols-[1fr_140px] gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Отдаёте</label>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={fromAmount}
                                onChange={(e) => handleFromAmountChange(e.target.value)}
                                className="bg-white border-2 border-gray-400 text-black font-mono placeholder:text-gray-400 h-11"
                              />
                            </div>
                            <CurrencySelector
                              selected={fromCurrency}
                              isOpen={showFromDropdown}
                              setIsOpen={(v) => { setShowFromDropdown(v); setShowToDropdown(false); }}
                              onSelect={selectFromCurrency}
                              label="Валюта"
                            />
                          </div>
                        </div>

                        <div className="flex justify-center -my-1">
                          <button
                            type="button"
                            onClick={handleSwapCurrencies}
                            className="w-10 h-10 border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all hover:border-gray-400 rounded-full shadow-sm"
                          >
                            <Icon name="ArrowUpDown" size={16} className="text-gray-600" />
                          </button>
                        </div>

                        <div className="p-5 bg-neutral-50 border-2 border-gray-200 space-y-4">
                          <div className="grid grid-cols-[1fr_140px] gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Получаете</label>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={toAmount}
                                onChange={(e) => handleToAmountChange(e.target.value)}
                                className="bg-white border-2 border-gray-400 text-black font-mono placeholder:text-gray-400 h-11"
                              />
                            </div>
                            <CurrencySelector
                              selected={toCurrency}
                              isOpen={showToDropdown}
                              setIsOpen={(v) => { setShowToDropdown(v); setShowFromDropdown(false); }}
                              onSelect={selectToCurrency}
                              label="Валюта"
                            />
                          </div>
                        </div>

                        {currentRate > 0 && fromAmount && (
                          <div className="p-3 bg-blue-50 border border-blue-200 flex items-center justify-between">
                            <span className="text-xs text-blue-700 font-medium">Курс обмена</span>
                            <span className="font-mono text-sm text-blue-900 font-semibold">
                              1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                            Адрес для получения {toCurrency}
                          </label>
                          <Input
                            placeholder={`Ваш ${toCurrency} адрес...`}
                            value={outputAddress}
                            onChange={(e) => setOutputAddress(e.target.value)}
                            className="bg-white border-2 border-gray-400 text-black font-mono placeholder:text-gray-400 h-11"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-sm font-semibold bg-black hover:bg-gray-800 text-white uppercase tracking-wider transition-all"
                          disabled={!fromAmount || !toAmount || !outputAddress || isSubmitting || isLoadingRates}
                        >
                          {isSubmitting ? 'Создание заявки...' : `Обменять ${fromCurrency} на ${toCurrency}`}
                        </Button>

                        {!isAuthenticated && (
                          <p className="text-center text-xs text-gray-400">
                            Для создания обмена необходима авторизация
                          </p>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                )}

                {!showConfirmation && !isLoadingRates && Object.keys(rates).length > 0 && (
                  <Card className="border-2 border-gray-300 bg-white shadow-sm mt-6">
                    <CardHeader className="border-b border-gray-200 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <Icon name="TrendingUp" size={14} />
                        Текущие курсы (USD)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {coins.filter(c => rates[c]).map(coin => (
                          <div key={coin} className="p-2.5 bg-neutral-50 border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Icon name={COIN_ICONS[coin] || 'Circle'} size={12} className="text-gray-500" />
                              <span className="text-xs font-semibold text-gray-700">{coin}</span>
                            </div>
                            <p className="font-mono text-xs text-black">${rates[coin].toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3 text-center">
                        <button onClick={fetchRates} className="hover:text-gray-600 transition-colors inline-flex items-center gap-1">
                          <Icon name="RefreshCw" size={10} />
                          Обновить курсы
                        </button>
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
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
                        {coins.map(coin => (
                          <span key={coin} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-sm font-mono">
                            <Icon name={COIN_ICONS[coin] || 'Circle'} size={12} />
                            {coin}
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