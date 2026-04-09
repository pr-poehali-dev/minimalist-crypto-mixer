import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ExchangesTable, Exchange } from '@/components/ui/exchanges-table';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import CryptoChartsDisplay from '@/components/ui/crypto-charts-display';
import { useNavigate } from 'react-router-dom';
import { getCoinInfo, isFiat } from '@/lib/coins';
import AboutTab from '@/components/AboutTab';
import SupportTab from '@/components/SupportTab';
import FaqTab from '@/components/FaqTab';
import Footer from '@/components/Footer';
import { HowItWorks, PopularPairs, StatsSection, TrustBanner } from '@/components/HeroSections';
import { InteractiveMenu, InteractiveMenuItem } from '@/components/ui/modern-mobile-menu';
import { ArrowLeftRight, ClipboardList, Headphones, HelpCircle, Gift } from 'lucide-react';
import ReferralTab from '@/components/ReferralTab';
import AppHeader from '@/components/AppHeader';
import ExchangeForm from '@/components/ExchangeForm';

const API = {
  getRates: 'https://functions.poehali.dev/a3025fda-cd60-410f-b176-1e71ee19f4bf',
  createExchange: 'https://functions.poehali.dev/db89b501-844e-4f7e-b839-35b396842720',
  getExchanges: 'https://functions.poehali.dev/f55bda70-6145-4587-85c3-8b37d3275358',
  telegramAuth: 'https://functions.poehali.dev/aba6998f-8142-4edd-8e22-c24c005cf258',
  referral: 'https://functions.poehali.dev/2ae57ed9-acd8-4db7-badf-3788ebdbf00b',
};

const MOBILE_MENU_ITEMS: InteractiveMenuItem[] = [
  { label: 'Обмен', icon: ArrowLeftRight, value: 'exchange' },
  { label: 'Мои обмены', icon: ClipboardList, value: 'my-exchanges' },
  { label: 'Партнёрство', icon: Gift, value: 'referral' },
  { label: 'Поддержка', icon: Headphones, value: 'support' },
  { label: 'FAQ', icon: HelpCircle, value: 'faq' },
];

const TAB_TO_INDEX: Record<string, number> = {
  'exchange': 0,
  'my-exchanges': 1,
  'referral': 2,
  'support': 3,
  'about': 0,
  'faq': 4,
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
  const [selectedCity, setSelectedCity] = useState('');

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
    const newFrom = toCurrency;
    const newTo = fromCurrency;
    const newFromAmount = fromAmount;
    setFromCurrency(newFrom);
    setToCurrency(newTo);
    setFromAmount(newFromAmount);
    const fromKey = getCoinInfo(newFrom).rateKey;
    const toKey = getCoinInfo(newTo).rateKey;
    if (newFromAmount && !isNaN(Number(newFromAmount)) && rates[fromKey] && rates[toKey]) {
      const rawRate = rates[fromKey] / rates[toKey];
      const effectiveMarkup = hasReferralDiscount ? Math.max(0, markupPercent - 1) : markupPercent;
      const withMarkup = rawRate * (1 - effectiveMarkup / 100);
      setToAmount(withMarkup > 0 ? (Number(newFromAmount) * withMarkup).toFixed(8) : '');
    } else {
      setToAmount('');
    }
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

  const handleVerifyCode = async (code: string): Promise<boolean> => {
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
        return true;
      } else {
        setAuthError(data.error || 'Неверный код');
        return false;
      }
    } catch (e) {
      console.error('Verify error', e);
      setAuthError('Ошибка соединения');
      return false;
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
    const isCash = isFiat(fromCurrency) || isFiat(toCurrency);
    const receivingCash = isFiat(toCurrency);
    if (!fromAmount || !toAmount || (!receivingCash && !outputAddress)) {
      alert('Заполните все поля');
      return;
    }
    if (isCash && !selectedCity) {
      alert('Выберите город встречи');
      return;
    }

    const fromRateKey = getCoinInfo(fromCurrency).rateKey;
    const fromUsdValue = Number(fromAmount) * (rates[fromRateKey] || 0);
    const minAmount = isCash ? 10000 : 25;
    if (fromUsdValue < minAmount) {
      alert(`Минимальная сумма обмена — $${minAmount.toLocaleString()}. Текущая сумма: $${fromUsdValue.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch(API.createExchange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': telegramUsername },
        body: JSON.stringify({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          from_amount: fromAmount,
          output_address: receivingCash ? '' : outputAddress,
          use_discount: hasReferralDiscount,
          is_cash: isCash,
          city: isCash ? selectedCity : '',
        }),
      });
      const data = await resp.json();
      if (data.success) {
        if (data.discount_applied) setHasReferralDiscount(false);
        navigate(`/order/${data.short_id}`);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error('Exchange creation failed', err);
    }
    setIsSubmitting(false);
  };

  const currentRate = getExchangeRate(fromCurrency, toCurrency);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAuthenticated={isAuthenticated}
        telegramUsername={telegramUsername}
        isCodeSent={isCodeSent}
        authError={authError}
        inputUsername={inputUsername}
        setInputUsername={setInputUsername}
        setAuthError={setAuthError}
        onRequestCode={handleRequestCode}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-3 py-6 md:px-4 md:py-12 pb-20 md:pb-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="exchange" className="animate-fade-in">
              <ExchangeForm
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                fromAmount={fromAmount}
                toAmount={toAmount}
                outputAddress={outputAddress}
                rates={rates}
                currentRate={currentRate}
                isLoadingRates={isLoadingRates}
                isSubmitting={isSubmitting}
                isAuthenticated={isAuthenticated}
                hasReferralDiscount={hasReferralDiscount}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                showFromDropdown={showFromDropdown}
                showToDropdown={showToDropdown}
                setShowFromDropdown={setShowFromDropdown}
                setShowToDropdown={setShowToDropdown}
                setOutputAddress={setOutputAddress}
                onFromAmountChange={handleFromAmountChange}
                onToAmountChange={handleToAmountChange}
                onSwapCurrencies={handleSwapCurrencies}
                onSelectFromCurrency={selectFromCurrency}
                onSelectToCurrency={selectToCurrency}
                onSubmit={handleSubmitExchange}
              />

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