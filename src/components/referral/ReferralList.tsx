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

const ReferralList = ({ referrals, earnings }: ReferralListProps) => {
  return (
    <>
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
    </>
  );
};

export default ReferralList;
