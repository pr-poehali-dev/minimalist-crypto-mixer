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

const ReferralTab = ({ telegramUsername, isAuthenticated }: ReferralTabProps) => {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

    if (!walletAddress.trim()) {
      setWithdrawError('Укажите адрес кошелька');
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Укажите корректную сумму');
      return;
    }
    if (amount < 5) {
      setWithdrawError('Минимальная сумма вывода $5');
      return;
    }

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
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-3 md:space-y-4 py-4 md:py-8">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800">Партнёрство</h2>
          <p className="text-sm md:text-lg text-gray-500">Приглашайте друзей и зарабатывайте 1% от их обменов</p>
        </div>
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-6 md:p-12 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl shadow-blue-500/20">
            <Icon name="Lock" size={28} className="text-white md:hidden" />
            <Icon name="Lock" size={36} className="text-white hidden md:block" />
          </div>
          <p className="text-base md:text-xl font-bold text-gray-800">Авторизуйтесь для доступа к партнёрской программе</p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">Войдите через Telegram, чтобы получить свой реферальный код</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-5 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4 py-4 md:py-8">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800">Партнёрство</h2>
          <p className="text-sm md:text-lg text-gray-500">Приглашайте друзей и зарабатывайте 1% от их обменов</p>
        </div>

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

        <ReferralList
          referrals={referrals}
          earnings={earnings}
        />

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
      </div>

      <Footer />
    </div>
  );
};

export default ReferralTab;
