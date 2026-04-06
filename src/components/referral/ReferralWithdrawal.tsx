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

const CURRENCIES = ['USDT', 'BTC', 'ETH', 'TON'];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'В обработке', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  processing: { label: 'Выполняется', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  completed: { label: 'Выплачено', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  rejected: { label: 'Отклонено', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
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
  const canWithdraw = balance >= 5;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Доступно к выводу</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${canWithdraw ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              мин. $5
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">${balance.toFixed(2)}</p>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Валюта вывода</label>
            <div className="flex gap-2">
              {CURRENCIES.map(c => (
                <button
                  key={c}
                  onClick={() => setWithdrawCurrency(c)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    withdrawCurrency === c
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Сумма (USD)</label>
            <div className="relative">
              <Input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="5"
                step="0.01"
                className="pr-20"
              />
              {balance >= 5 && (
                <button
                  onClick={() => setWithdrawAmount(balance.toFixed(2))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium hover:text-blue-700"
                >
                  Всё (${balance.toFixed(2)})
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Адрес кошелька ({withdrawCurrency})</label>
            <Input
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              placeholder={`Адрес ${withdrawCurrency} кошелька`}
              className="font-mono text-sm"
            />
          </div>

          {withdrawMessage && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-lg">
              <Icon name="CheckCircle" size={16} />
              {withdrawMessage}
            </div>
          )}
          {withdrawError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              <Icon name="AlertCircle" size={16} />
              {withdrawError}
            </div>
          )}

          <Button
            onClick={onWithdraw}
            disabled={isWithdrawing || !canWithdraw}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
          >
            {isWithdrawing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <Icon name="ArrowUpRight" size={16} className="mr-2" />
                Вывести средства
              </>
            )}
          </Button>
        </div>
      </div>

      {withdrawals.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">История выводов</span>
          </div>
          <div className="divide-y divide-gray-50">
            {withdrawals.map(w => {
              const st = STATUS_MAP[w.status] || { label: w.status, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
              return (
                <div key={w.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                      <Icon name="ArrowUpRight" size={14} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">${w.amount_usd.toFixed(2)} → {w.currency}</p>
                      <p className="text-[10px] text-gray-400 font-mono truncate max-w-[140px] md:max-w-[250px]">{w.wallet_address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(w.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralWithdrawal;
