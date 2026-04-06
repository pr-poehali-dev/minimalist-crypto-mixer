import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const API = {
  setMarkup: 'https://functions.poehali.dev/6f9de021-2dff-4160-938a-cb3e8caa1b7a',
  adminExchanges: 'https://functions.poehali.dev/a2afbcdb-20fd-4338-8912-027e06990b01',
  updateStatus: 'https://functions.poehali.dev/f665b00d-ddae-42aa-8edb-1178981736e1',
  referral: 'https://functions.poehali.dev/2ae57ed9-acd8-4db7-badf-3788ebdbf00b',
};

const ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123'];

const STATUSES = ['Ожидает оплаты', 'Оплата отправлена', 'Оплата получена', 'В обработке', 'Отправлено', 'Завершено', 'Отменено', 'Не оплачена'];

interface Exchange {
  id: number;
  short_id: string;
  user_username: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  to_amount: string;
  rate: string;
  deposit_address: string;
  output_address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [markup, setMarkup] = useState('2');
  const [currentMarkup, setCurrentMarkup] = useState(2);
  const [markupSaving, setMarkupSaving] = useState(false);
  const [markupSaved, setMarkupSaved] = useState(false);

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [hashInput, setHashInput] = useState<Record<number, string>>({});
  const [showHashInput, setShowHashInput] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [referralData, setReferralData] = useState<any>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('exchange_username');
    if (stored && ADMIN_USERNAMES.includes(stored.toLowerCase())) {
      setUsername(stored);
      setIsAdmin(true);
    }
  }, []);

  const fetchMarkup = useCallback(async () => {
    if (!username) return;
    try {
      const resp = await fetch(API.setMarkup, {
        headers: { 'X-User-Username': username },
      });
      const data = await resp.json();
      if (data.markup_percent !== undefined) {
        setCurrentMarkup(data.markup_percent);
        setMarkup(String(data.markup_percent));
      }
    } catch (e) {
      console.error('Failed to fetch markup', e);
    }
  }, [username]);

  const fetchExchanges = useCallback(async () => {
    if (!username) return;
    setLoadingExchanges(true);
    try {
      const resp = await fetch(API.adminExchanges, {
        headers: { 'X-User-Username': username },
      });
      const data = await resp.json();
      setExchanges(data.exchanges || []);
    } catch (e) {
      console.error('Failed to fetch exchanges', e);
    }
    setLoadingExchanges(false);
  }, [username]);

  const fetchReferrals = useCallback(async () => {
    if (!username) return;
    setLoadingReferrals(true);
    try {
      const resp = await fetch(API.referral, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': username },
        body: JSON.stringify({ action: 'admin_get_referrals' }),
      });
      const data = await resp.json();
      setReferralData(data);
    } catch (e) {
      console.error('Failed to fetch referrals', e);
    }
    setLoadingReferrals(false);
  }, [username]);

  useEffect(() => {
    if (isAdmin) {
      fetchMarkup();
      fetchExchanges();
      fetchReferrals();
    }
  }, [isAdmin, fetchMarkup, fetchExchanges, fetchReferrals]);

  const handleSaveMarkup = async () => {
    const val = parseFloat(markup);
    console.log('[ADMIN] Save markup:', { markup, val, username });
    if (isNaN(val) || val < 0 || val > 99) return;
    setMarkupSaving(true);
    try {
      const resp = await fetch(API.setMarkup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': username },
        body: JSON.stringify({ markup_percent: val }),
      });
      console.log('[ADMIN] Response status:', resp.status);
      const data = await resp.json();
      console.log('[ADMIN] Response data:', data);
      if (data.success) {
        setCurrentMarkup(val);
        setMarkupSaved(true);
        setTimeout(() => setMarkupSaved(false), 2000);
      }
    } catch (e) {
      console.error('Failed to save markup', e);
    }
    setMarkupSaving(false);
  };

  const handleStatusChange = (exchangeId: number, newStatus: string) => {
    if (newStatus === 'Отправлено') {
      setShowHashInput(exchangeId);
      return;
    }
    handleUpdateStatus(exchangeId, newStatus, '');
  };

  const handleUpdateStatus = async (exchangeId: number, newStatus: string, txHash: string) => {
    setUpdatingId(exchangeId);
    try {
      const resp = await fetch(API.updateStatus, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': username },
        body: JSON.stringify({ exchange_id: exchangeId, status: newStatus, tx_hash: txHash }),
      });
      const data = await resp.json();
      if (data.success) {
        setExchanges(prev => prev.map(ex =>
          ex.id === exchangeId ? { ...ex, status: newStatus, updated_at: new Date().toISOString() } : ex
        ));
        setShowHashInput(null);
        setHashInput(prev => { const n = { ...prev }; delete n[exchangeId]; return n; });
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
    setUpdatingId(null);
  };

  const handleProcessWithdrawal = async (withdrawalId: number, status: string) => {
    setProcessingWithdrawal(withdrawalId);
    try {
      await fetch(API.referral, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': username },
        body: JSON.stringify({ action: 'admin_process_withdrawal', withdrawal_id: withdrawalId, status }),
      });
      fetchReferrals();
    } catch (e) {
      console.error('Failed to process withdrawal', e);
    }
    setProcessingWithdrawal(null);
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      'Ожидает оплаты': 'bg-yellow-50 border-yellow-200 text-yellow-700',
      'Оплата получена': 'bg-blue-50 border-blue-200 text-blue-700',
      'В обработке': 'bg-indigo-50 border-indigo-200 text-indigo-700',
      'Отправлено': 'bg-purple-50 border-purple-200 text-purple-700',
      'Завершено': 'bg-green-50 border-green-200 text-green-700',
      'Отменено': 'bg-red-50 border-red-200 text-red-700',
      'Оплата отправлена': 'bg-cyan-50 border-cyan-200 text-cyan-700',
      'Не оплачена': 'bg-orange-50 border-orange-200 text-orange-700',
    };
    return map[status] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-96 border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-center">Админ-панель</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 text-center">Доступ только для администраторов</p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border/50">
        <div className="px-8 py-6 flex items-center justify-between h-[73px]">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            ADMIN PANEL
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-mono">{username}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={14} className="mr-2" />
              На сайт
            </Button>
          </div>
        </div>
      </header>

      <main className="px-8 py-8 max-w-6xl mx-auto space-y-8">
        <Card className="border-2 border-gray-300">
          <CardHeader className="border-b-2 border-gray-300">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="Percent" size={18} />
              Наценка на курсы
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Процент наценки
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="99"
                    value={markup}
                    onChange={(e) => setMarkup(e.target.value)}
                    className="border-2 border-gray-400 font-mono h-11 w-32"
                  />
                  <span className="text-lg font-semibold text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Текущая наценка: {currentMarkup}%</p>
              </div>
              <Button
                onClick={handleSaveMarkup}
                disabled={markupSaving}
                className="h-11 bg-black hover:bg-gray-800 text-white font-semibold text-xs uppercase tracking-wider"
              >
                {markupSaving ? 'Сохранение...' : markupSaved ? 'Сохранено!' : 'Сохранить'}
              </Button>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-xs text-blue-800">
              Наценка применяется ко всем обменным операциям. При наценке {markup}% курс для клиента будет на {markup}% менее выгодным, чем рыночный.
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-300">
          <CardHeader className="border-b-2 border-gray-300 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="ClipboardList" size={18} />
              Все заявки на обмен
              <span className="text-sm font-normal text-gray-400">({exchanges.length})</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchExchanges} disabled={loadingExchanges}>
              <Icon name="RefreshCw" size={14} className={loadingExchanges ? 'animate-spin' : ''} />
            </Button>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {loadingExchanges && exchanges.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : exchanges.length === 0 ? (
              <p className="text-center text-gray-400 py-12">Заявок пока нет</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-neutral-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Дата</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Пользователь</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Пара</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Сумма</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchanges.map(ex => (
                      <>
                        <tr
                          key={ex.id}
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === ex.id ? null : ex.id)}
                        >
                          <td className="px-4 py-3 font-mono text-sm font-bold text-black">{ex.short_id || ex.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ex.created_at)}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-800">{ex.user_username}</td>
                          <td className="px-4 py-3 font-mono text-sm font-semibold">{ex.from_currency} → {ex.to_currency}</td>
                          <td className="px-4 py-3 font-mono text-sm">{parseFloat(ex.from_amount).toFixed(6)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-sm border ${getStatusStyle(ex.status)}`}>
                              {ex.status}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1">
                              <select
                                value={showHashInput === ex.id ? 'Отправлено' : ex.status}
                                onChange={(e) => handleStatusChange(ex.id, e.target.value)}
                                disabled={updatingId === ex.id}
                                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white font-mono"
                              >
                                {STATUSES.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              {showHashInput === ex.id && (
                                <div className="flex gap-1 mt-1">
                                  <input
                                    type="text"
                                    placeholder="TX Hash..."
                                    value={hashInput[ex.id] || ''}
                                    onChange={(e) => setHashInput(prev => ({ ...prev, [ex.id]: e.target.value }))}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 font-mono flex-1 min-w-0"
                                  />
                                  <button
                                    onClick={() => handleUpdateStatus(ex.id, 'Отправлено', hashInput[ex.id] || '')}
                                    disabled={updatingId === ex.id}
                                    className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800"
                                  >
                                    OK
                                  </button>
                                  <button
                                    onClick={() => setShowHashInput(null)}
                                    className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedRow === ex.id && (
                          <tr key={`${ex.id}-details`} className="bg-neutral-50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500 uppercase tracking-wider">Адрес пополнения</span>
                                  <p className="font-mono mt-1 break-all">{ex.deposit_address}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 uppercase tracking-wider">Адрес получения</span>
                                  <p className="font-mono mt-1 break-all">{ex.output_address}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 uppercase tracking-wider">Получает</span>
                                  <p className="font-mono mt-1">{parseFloat(ex.to_amount).toFixed(8)} {ex.to_currency}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 uppercase tracking-wider">Курс</span>
                                  <p className="font-mono mt-1">1 {ex.from_currency} = {parseFloat(ex.rate).toFixed(6)} {ex.to_currency}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Management */}
        <Card className="border-2 border-gray-300">
          <CardHeader className="border-b-2 border-gray-300 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon name="Gift" size={18} />
              Реферальная программа
              {referralData?.success && (
                <span className="text-sm font-normal text-gray-400">
                  ({referralData.codes?.length || 0} кодов)
                </span>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchReferrals} disabled={loadingReferrals}>
              <Icon name="RefreshCw" size={14} className={loadingReferrals ? 'animate-spin' : ''} />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingReferrals && !referralData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : !referralData?.success ? (
              <p className="text-center text-gray-400 py-8">Нет данных</p>
            ) : (
              <div className="space-y-8">
                {/* Stats overview */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Кодов', value: referralData.codes?.length || 0, icon: 'Hash' },
                    { label: 'Связей', value: referralData.links?.length || 0, icon: 'Link' },
                    { label: 'Начислений', value: referralData.earnings?.length || 0, icon: 'Coins' },
                    {
                      label: 'Ожидают вывод',
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value: referralData.withdrawals?.filter((w: any) => w.status === 'Ожидает').length || 0,
                      icon: 'Clock',
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="border border-gray-200 rounded-lg p-4 text-center bg-neutral-50">
                      <Icon name={stat.icon} size={18} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Pending withdrawals */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Icon name="AlertCircle" size={14} />
                    Заявки на вывод
                  </h3>
                  {(!referralData.withdrawals || referralData.withdrawals.length === 0) ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Нет заявок на вывод</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300 bg-neutral-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Пользователь</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Сумма</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Кошелёк</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Дата</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Действие</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {referralData.withdrawals.map((w: any) => (
                            <tr key={w.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 font-mono text-sm font-bold text-black">{w.id}</td>
                              <td className="px-4 py-3 text-sm font-mono text-gray-800">{w.username}</td>
                              <td className="px-4 py-3 font-mono text-sm font-semibold">
                                ${w.amount_usd?.toFixed(2)} {w.currency}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono text-gray-600 max-w-[200px] truncate" title={w.wallet_address}>
                                {w.wallet_address}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {w.created_at ? formatDate(w.created_at) : '-'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-sm border ${
                                  w.status === 'Ожидает' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                  w.status === 'Выполнено' ? 'bg-green-50 border-green-200 text-green-700' :
                                  w.status === 'Отклонено' ? 'bg-red-50 border-red-200 text-red-700' :
                                  'bg-gray-50 border-gray-200 text-gray-700'
                                }`}>
                                  {w.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {w.status === 'Ожидает' ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleProcessWithdrawal(w.id, 'Выполнено')}
                                      disabled={processingWithdrawal === w.id}
                                      className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 font-semibold"
                                    >
                                      {processingWithdrawal === w.id ? '...' : 'Одобрить'}
                                    </button>
                                    <button
                                      onClick={() => handleProcessWithdrawal(w.id, 'Отклонено')}
                                      disabled={processingWithdrawal === w.id}
                                      className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 font-semibold"
                                    >
                                      Отклонить
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* All referral codes */}
                {referralData.codes && referralData.codes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Icon name="Hash" size={14} />
                      Все реферальные коды
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {referralData.codes.map((c: any) => (
                        <div key={c.id} className="border border-gray-200 rounded-lg p-3 bg-neutral-50 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-bold text-gray-800">{c.code}</p>
                            <p className="text-xs text-gray-500 truncate">{c.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent earnings */}
                {referralData.earnings && referralData.earnings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Icon name="Coins" size={14} />
                      Последние начисления
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300 bg-neutral-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Реферер</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Реферал</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Обмен</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Сумма</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Статус</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Дата</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {referralData.earnings.slice(0, 20).map((e: any) => (
                            <tr key={e.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-mono text-gray-800">{e.referrer_username}</td>
                              <td className="px-4 py-3 text-sm font-mono text-gray-600">{e.referred_username}</td>
                              <td className="px-4 py-3 font-mono text-sm text-gray-600">#{e.exchange_id}</td>
                              <td className="px-4 py-3 font-mono text-sm font-semibold">
                                {e.amount_usd?.toFixed(4)} {e.currency}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-sm border ${
                                  e.status === 'начислено' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                  'bg-gray-50 border-gray-200 text-gray-700'
                                }`}>
                                  {e.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {e.created_at ? formatDate(e.created_at) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;