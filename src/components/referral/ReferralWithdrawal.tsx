import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Withdrawal {
  id: number;
  amount_usd: number;
  wallet_address: string;
  currency: string;
  status: string;
  created_at: string | null;
  processed_at: string | null;
}

interface ReferralWithdrawalProps {
  balance: number;
  withdrawals: Withdrawal[];
  walletAddress: string;
  setWalletAddress: (v: string) => void;
  withdrawCurrency: string;
  setWithdrawCurrency: (v: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (v: string) => void;
  onWithdraw: () => Promise<void>;
  isWithdrawing: boolean;
  withdrawMessage: string;
  withdrawError: string;
}

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

const ReferralWithdrawal = ({
  balance,
  withdrawals,
  walletAddress,
  setWalletAddress,
  withdrawCurrency,
  setWithdrawCurrency,
  withdrawAmount,
  setWithdrawAmount,
  onWithdraw,
  isWithdrawing,
  withdrawMessage,
  withdrawError,
}: ReferralWithdrawalProps) => {
  return (
    <>
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
            onClick={onWithdraw}
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
    </>
  );
};

export default ReferralWithdrawal;
