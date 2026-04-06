import { useState } from 'react';
import Icon from '@/components/ui/icon';

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

interface ReferralListProps {
  referrals: Referral[];
  earnings: Earning[];
}

const formatDate = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const ReferralList = ({ referrals, earnings }: ReferralListProps) => {
  const [tab, setTab] = useState<'referrals' | 'earnings'>('referrals');

  const totalEarned = earnings.reduce((s, e) => s + e.amount_usd, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setTab('referrals')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            tab === 'referrals' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon name="Users" size={15} />
          Рефералы
          {referrals.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{referrals.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('earnings')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            tab === 'earnings' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon name="DollarSign" size={15} />
          Начисления
          {earnings.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{earnings.length}</span>
          )}
        </button>
      </div>

      {tab === 'referrals' && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {referrals.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Icon name="UserPlus" size={22} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-600 mb-1">Пока нет рефералов</p>
              <p className="text-xs text-gray-400">Поделитесь кодом — когда друг его применит, он появится здесь</p>
            </div>
          ) : (
            <div>
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</span>
              </div>
              <div className="divide-y divide-gray-50">
                {referrals.map((r, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{r.username.replace('@', '').charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{r.username}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(r.joined_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'earnings' && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {earnings.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Icon name="DollarSign" size={22} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-600 mb-1">Нет начислений</p>
              <p className="text-xs text-gray-400">Когда реферал совершит обмен, вы получите 1% комиссию</p>
            </div>
          ) : (
            <div>
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">От кого</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</span>
              </div>
              <div className="divide-y divide-gray-50">
                {earnings.map(e => (
                  <div key={e.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <Icon name="ArrowDownLeft" size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{e.referred_username}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(e.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+${e.amount_usd.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400">{e.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Итого</span>
                <span className="text-sm font-bold text-gray-800">${totalEarned.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralList;
