import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Footer from '@/components/Footer';

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

  const [copied, setCopied] = useState(false);

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

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Ожидает': 'bg-yellow-100 text-yellow-700',
      'Выполнено': 'bg-green-100 text-green-700',
      'Отклонено': 'bg-red-100 text-red-700',
      'начислено': 'bg-blue-100 text-blue-700',
    };
    const cls = map[status] || 'bg-gray-100 text-gray-600';
    return (
      <span className={`inline-block text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
        {status}
      </span>
    );
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
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4 py-4 md:py-8">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800">Партнёрство</h2>
          <p className="text-sm md:text-lg text-gray-500">Приглашайте друзей и зарабатывайте 1% от их обменов</p>
        </div>

        {/* Referral code card */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Icon name="Link" size={18} className="text-white md:hidden" />
              <Icon name="Link" size={22} className="text-white hidden md:block" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm md:text-lg">Ваш реферальный код</p>
              <p className="text-[10px] md:text-xs text-gray-500">Поделитесь кодом с друзьями</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Icon name="Loader2" size={24} className="text-gray-400 animate-spin" />
            </div>
          ) : referralCode ? (
            <>
              <div className="flex items-center gap-3 mb-5 md:mb-8">
                <div className="flex-1 bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl px-4 md:px-6 py-3 md:py-4 text-center">
                  <span className="text-2xl md:text-4xl font-mono font-bold tracking-[0.2em] text-gray-800">
                    {referralCode.code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 md:h-14 md:w-14 rounded-lg md:rounded-xl flex-shrink-0"
                  onClick={handleCopyCode}
                >
                  <Icon name={copied ? 'Check' : 'Copy'} size={20} className={copied ? 'text-green-600' : 'text-gray-600'} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-5 text-center">
                  <p className="text-lg md:text-2xl font-bold text-gray-800">{referralCode.total_referrals}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Рефералов</p>
                </div>
                <div className="bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-5 text-center">
                  <p className="text-lg md:text-2xl font-bold text-gray-800">${referralCode.total_earned.toFixed(2)}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Заработано</p>
                </div>
                <div className="bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-5 text-center">
                  <p className="text-lg md:text-2xl font-bold text-green-600">${balance.toFixed(2)}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Баланс</p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Apply referral code */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Icon name="UserPlus" size={18} className="text-white md:hidden" />
              <Icon name="UserPlus" size={22} className="text-white hidden md:block" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm md:text-lg">Введите реферальный код</p>
              <p className="text-[10px] md:text-xs text-gray-500">Если вас пригласил друг</p>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3">
            <Input
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="Например: AB12CD"
              maxLength={6}
              className="flex-1 font-mono tracking-wider uppercase"
            />
            <Button
              onClick={handleApplyCode}
              disabled={isApplying || !applyCode.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 md:px-6"
            >
              {isApplying ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                'Применить'
              )}
            </Button>
          </div>

          {applyMessage && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-xs md:text-sm">
              <Icon name="CheckCircle" size={14} />
              <span>{applyMessage}</span>
            </div>
          )}
          {applyError && (
            <div className="mt-3 flex items-center gap-2 text-red-500 text-xs md:text-sm">
              <Icon name="AlertCircle" size={14} />
              <span>{applyError}</span>
            </div>
          )}
        </div>

        {/* Referral list */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Users" size={18} className="text-white md:hidden" />
              <Icon name="Users" size={22} className="text-white hidden md:block" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm md:text-lg">Ваши рефералы</p>
              <p className="text-[10px] md:text-xs text-gray-500">Пользователи, зарегистрированные по вашему коду</p>
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Icon name="UserX" size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Пока нет рефералов</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-neutral-50 border border-gray-100 rounded-lg md:rounded-xl">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={14} className="text-white" />
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-800 truncate">{r.username}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 flex-shrink-0 ml-2">{formatDate(r.joined_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings list */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Coins" size={18} className="text-white md:hidden" />
              <Icon name="Coins" size={22} className="text-white hidden md:block" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm md:text-lg">Начисления</p>
              <p className="text-[10px] md:text-xs text-gray-500">1% от каждого обмена ваших рефералов</p>
            </div>
          </div>

          {earnings.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Icon name="CircleDollarSign" size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Нет начислений</p>
            </div>
          ) : (
            <div className="space-y-2">
              {earnings.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 md:p-4 bg-neutral-50 border border-gray-100 rounded-lg md:rounded-xl gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm md:text-base font-medium text-gray-800">
                        +{e.amount_usd.toFixed(4)} {e.currency}
                      </span>
                      {statusBadge(e.status)}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                      Обмен #{e.exchange_id} от {e.referred_username}
                    </p>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 flex-shrink-0">{formatDate(e.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal form */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Icon name="Wallet" size={18} className="text-white md:hidden" />
              <Icon name="Wallet" size={22} className="text-white hidden md:block" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm md:text-lg">Вывод средств</p>
              <p className="text-[10px] md:text-xs text-gray-500">Доступно: <span className="font-bold text-green-600">${balance.toFixed(2)}</span> — мин. $5</p>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1.5">Адрес кошелька</label>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Введите адрес кошелька"
                className="font-mono text-xs md:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1.5">Валюта</label>
                <div className="flex gap-1.5">
                  {['USDT', 'BTC', 'ETH'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setWithdrawCurrency(c)}
                      className={`flex-1 text-xs md:text-sm font-medium py-2 md:py-2.5 rounded-lg border transition-colors ${
                        withdrawCurrency === c
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1.5">Сумма ($)</label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Мин. 5"
                  min={5}
                  step="0.01"
                />
              </div>
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !walletAddress.trim() || !withdrawAmount}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-10 md:h-12 text-sm md:text-base"
            >
              {isWithdrawing ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : (
                <>
                  <Icon name="ArrowUpRight" size={16} />
                  Вывести
                </>
              )}
            </Button>

            {withdrawMessage && (
              <div className="flex items-center gap-2 text-green-600 text-xs md:text-sm">
                <Icon name="CheckCircle" size={14} />
                <span>{withdrawMessage}</span>
              </div>
            )}
            {withdrawError && (
              <div className="flex items-center gap-2 text-red-500 text-xs md:text-sm">
                <Icon name="AlertCircle" size={14} />
                <span>{withdrawError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal history */}
        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
              <Icon name="History" size={18} className="text-white md:hidden" />
              <Icon name="History" size={22} className="text-white hidden md:block" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm md:text-lg">История выводов</p>
              <p className="text-[10px] md:text-xs text-gray-500">Все ваши заявки на вывод</p>
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Icon name="Receipt" size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Нет выводов</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 md:p-4 bg-neutral-50 border border-gray-100 rounded-lg md:rounded-xl gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm md:text-base font-medium text-gray-800">
                        ${w.amount_usd.toFixed(2)} {w.currency}
                      </span>
                      {statusBadge(w.status)}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 truncate">
                      {w.wallet_address}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-[10px] md:text-xs text-gray-500">{formatDate(w.created_at)}</p>
                    {w.processed_at && (
                      <p className="text-[10px] text-gray-400">{formatDate(w.processed_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="rounded-xl md:rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-4 md:p-8">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6 text-center">Как работает партнёрская программа</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {[
              { step: '1', title: 'Поделитесь кодом', desc: 'Отправьте свой реферальный код друзьям', icon: 'Share2' },
              { step: '2', title: 'Друг обменивает', desc: 'Когда друг совершает обмен, вы получаете 1%', icon: 'ArrowLeftRight' },
              { step: '3', title: 'Выводите', desc: 'Накопленные средства можно вывести на кошелёк', icon: 'Banknote' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-2 md:mb-4 text-sm md:text-lg font-bold">
                  {s.step}
                </div>
                <p className="font-bold text-gray-800 text-xs md:text-base">{s.title}</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReferralTab;
