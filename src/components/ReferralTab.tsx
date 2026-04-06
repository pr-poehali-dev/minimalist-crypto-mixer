import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';
import ReferralCodeCard from '@/components/referral/ReferralCodeCard';
import ReferralList from '@/components/referral/ReferralList';
import ReferralWithdrawal from '@/components/referral/ReferralWithdrawal';

const API_URL = 'https://functions.poehali.dev/2ae57ed9-acd8-4db7-badf-3788ebdbf00b';

interface ReferralTabProps {
  telegramUsername: string;
  isAuthenticated: boolean;
}

interface ReferralCode {
  code: string;
  total_referrals: number;
  total_earned: number;
  balance: number;
}

interface Referral {
  username: string;
  joined_at: string | null;
}

interface Earning {
  id: number;
  referred_username: string;
  exchange_id: number;
  amount_usd: number;
  currency: string;
  status: string;
  created_at: string | null;
}

interface Withdrawal {
  id: number;
  amount_usd: number;
  wallet_address: string;
  currency: string;
  status: string;
  created_at: string | null;
  processed_at: string | null;
}

const STEPS = [
  { icon: 'Link', title: 'Поделитесь кодом', desc: 'Отправьте свой код друзьям' },
  { icon: 'UserPlus', title: 'Друг регистрируется', desc: 'Использует ваш код при обмене' },
  { icon: 'Wallet', title: 'Вы получаете 1%', desc: 'С каждого обмена реферала' },
];

const ReferralTab = ({ telegramUsername, isAuthenticated }: ReferralTabProps) => {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'referrals' | 'withdraw'>('overview');

  const [applyCode, setApplyCode] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const apiCall = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Username': telegramUsername,
      },
      body: JSON.stringify({ action, ...extra }),
    });
    return resp.json();
  }, [telegramUsername]);

  const fetchReferralCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiCall('get_referral_code');
      if (data.success) {
        setReferralCode({
          code: data.code,
          total_referrals: data.total_referrals,
          total_earned: data.total_earned,
          balance: data.balance,
        });
        setBalance(data.balance);
      }
    } catch (e) {
      console.error('Failed to load referral code', e);
    }
    setIsLoading(false);
  }, [apiCall]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiCall('get_referral_stats');
      if (data.success) {
        setReferrals(data.referrals || []);
        setEarnings(data.earnings || []);
        setWithdrawals(data.withdrawals || []);
        setBalance(data.balance);
      }
    } catch (e) {
      console.error('Failed to load referral stats', e);
    }
  }, [apiCall]);

  useEffect(() => {
    if (isAuthenticated && telegramUsername) {
      fetchReferralCode();
      fetchStats();
    }
  }, [isAuthenticated, telegramUsername, fetchReferralCode, fetchStats]);

  const handleApplyCode = async () => {
    if (!applyCode.trim()) return;
    setApplyMessage('');
    setApplyError('');
    setIsApplying(true);
    try {
      const data = await apiCall('apply_referral_code', { code: applyCode.trim() });
      if (data.success) {
        setApplyMessage(data.message || 'Код применён');
        setApplyCode('');
      } else {
        setApplyError(data.error || 'Ошибка');
      }
    } catch {
      setApplyError('Ошибка соединения');
    }
    setIsApplying(false);
  };

  const handleWithdraw = async () => {
    setWithdrawMessage('');
    setWithdrawError('');
    if (!walletAddress.trim()) { setWithdrawError('Укажите адрес кошелька'); return; }
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) { setWithdrawError('Укажите корректную сумму'); return; }
    if (amount < 5) { setWithdrawError('Минимальная сумма вывода $5'); return; }

    setIsWithdrawing(true);
    try {
      const data = await apiCall('request_withdrawal', {
        wallet_address: walletAddress.trim(),
        currency: withdrawCurrency,
        amount,
      });
      if (data.success) {
        setWithdrawMessage(data.message || 'Заявка создана');
        setWalletAddress('');
        setWithdrawAmount('');
        setBalance(data.new_balance ?? balance - amount);
        fetchStats();
      } else {
        setWithdrawError(data.error || 'Ошибка');
      }
    } catch {
      setWithdrawError('Ошибка соединения');
    }
    setIsWithdrawing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-6 md:py-10">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">Партнёрская программа</h2>
          <p className="text-sm md:text-base text-gray-500">Зарабатывайте 1% с каждого обмена ваших рефералов</p>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="relative rounded-xl border border-gray-200 bg-white p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Icon name={s.icon} size={20} className="text-blue-600" />
              </div>
              <p className="font-semibold text-gray-800 text-xs md:text-sm mb-1">{s.title}</p>
              <p className="text-[10px] md:text-xs text-gray-500">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300">
                  <Icon name="ChevronRight" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={24} className="text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">Войдите для доступа</p>
          <p className="text-sm text-gray-500">Авторизуйтесь через Telegram, чтобы получить реферальный код</p>
        </div>
        <Footer />
      </div>
    );
  }

  const sections = [
    { id: 'overview' as const, icon: 'LayoutDashboard', label: 'Обзор' },
    { id: 'referrals' as const, icon: 'Users', label: 'Рефералы' },
    { id: 'withdraw' as const, icon: 'ArrowDownToLine', label: 'Вывод' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center py-6 md:py-10">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">Партнёрская программа</h2>
        <p className="text-sm md:text-base text-gray-500">Зарабатывайте 1% с каждого обмена ваших рефералов</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
              activeSection === s.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name={s.icon} size={16} />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-5">
          <ReferralCodeCard
            referralCode={referralCode}
            balance={balance}
            isLoading={isLoading}
            applyCode={applyCode}
            setApplyCode={setApplyCode}
            onApplyCode={handleApplyCode}
            isApplying={isApplying}
            applyMessage={applyMessage}
            applyError={applyError}
          />

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {STEPS.map((s, i) => (
              <div key={i} className="relative rounded-xl border border-gray-200 bg-white p-4 md:p-5 text-center">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                  <Icon name={s.icon} size={18} className="text-blue-600" />
                </div>
                <p className="font-semibold text-gray-800 text-[11px] md:text-sm">{s.title}</p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300">
                    <Icon name="ChevronRight" size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'referrals' && (
        <ReferralList referrals={referrals} earnings={earnings} />
      )}

      {activeSection === 'withdraw' && (
        <ReferralWithdrawal
          balance={balance}
          withdrawals={withdrawals}
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          withdrawCurrency={withdrawCurrency}
          setWithdrawCurrency={setWithdrawCurrency}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          onWithdraw={handleWithdraw}
          isWithdrawing={isWithdrawing}
          withdrawMessage={withdrawMessage}
          withdrawError={withdrawError}
        />
      )}

      <Footer />
    </div>
  );
};

export default ReferralTab;
