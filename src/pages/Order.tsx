import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const API_GET_ORDER = 'https://functions.poehali.dev/da825e7a-ffdb-4fe2-8ced-a59edb04e1e6';
const API_CONFIRM = 'https://functions.poehali.dev/57779eea-72f4-4cc7-8605-2ae935a9a5a0';

import { getCoinInfo, isFiat } from '@/lib/coins';

const STATUS_STYLES: Record<string, string> = {
  'Ожидает оплаты': 'bg-yellow-50 border-yellow-300 text-yellow-700',
  'Оплата отправлена': 'bg-cyan-50 border-cyan-300 text-cyan-700',
  'Оплата получена': 'bg-blue-50 border-blue-300 text-blue-700',
  'В обработке': 'bg-indigo-50 border-indigo-300 text-indigo-700',
  'Отправлено': 'bg-purple-50 border-purple-300 text-purple-700',
  'Завершено': 'bg-green-50 border-green-300 text-green-700',
  'Отменено': 'bg-red-50 border-red-300 text-red-700',
  'Не оплачена': 'bg-orange-50 border-orange-300 text-orange-700',
  'Ожидание менеджера': 'bg-amber-50 border-amber-300 text-amber-700',
  'Истекла': 'bg-red-50 border-red-300 text-red-700',
};

const TRACKING_STEPS = [
  { key: 'Ожидает оплаты', label: 'Ожидание оплаты', icon: 'Clock', color: '#F97316' },
  { key: 'Оплата отправлена', label: 'Оплата отправлена', icon: 'Send', color: '#06B6D4' },
  { key: 'Оплата получена', label: 'Оплата получена', icon: 'CheckCircle', color: '#3B82F6' },
  { key: 'В обработке', label: 'Обработка обмена', icon: 'RefreshCw', color: '#8B5CF6' },
  { key: 'Отправлено', label: 'Средства отправлены', icon: 'ArrowUpRight', color: '#EC4899' },
  { key: 'Завершено', label: 'Завершено', icon: 'Check', color: '#22C55E' },
];

const CASH_TRACKING_STEPS = [
  { key: 'Ожидание менеджера', label: 'Ожидание менеджера', icon: 'Clock', color: '#F97316' },
  { key: 'В обработке', label: 'Обработка обмена', icon: 'RefreshCw', color: '#8B5CF6' },
  { key: 'Завершено', label: 'Завершено', icon: 'Check', color: '#22C55E' },
];

interface OrderData {
  id: number; short_id: string; from_currency: string; to_currency: string;
  from_amount: string; to_amount: string; rate: string; deposit_address: string;
  output_address: string; status: string; tx_hash?: string; created_at: string; updated_at: string;
  is_cash?: boolean; expires_at?: string; city?: string;
}

const Order = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!shortId) return;
    try {
      const resp = await fetch(`${API_GET_ORDER}?id=${shortId}`);
      const data = await resp.json();
      if (data.order) {
        setOrder(data.order);
        const isCashOrder = data.order.is_cash || isFiat(data.order.from_currency) || isFiat(data.order.to_currency);
        if (isCashOrder && data.order.expires_at) {
          const expiresStr = data.order.expires_at.endsWith('Z') ? data.order.expires_at : data.order.expires_at + 'Z';
          const remaining = Math.max(0, Math.floor((new Date(expiresStr).getTime() - Date.now()) / 1000));
          setTimer(remaining);
        } else {
          const createdStr = data.order.created_at.endsWith('Z') ? data.order.created_at : data.order.created_at + 'Z';
          const remaining = Math.max(0, Math.floor((new Date(createdStr).getTime() + 1800000 - Date.now()) / 1000));
          setTimer(remaining);
        }
      } else {
        setError('Заказ не найден');
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError('Ошибка загрузки');
    }
    setLoading(false);
  }, [shortId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [timer]);
  useEffect(() => {
    if (!order || ['Завершено', 'Отменено', 'Не оплачена', 'Истекла'].includes(order.status)) return;
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);
  useEffect(() => {
    if (timer === 0 && order && (order.status === 'Ожидает оплаты' || order.status === 'Ожидание менеджера')) fetchOrder();
  }, [timer, order, fetchOrder]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    const storedUsername = localStorage.getItem('exchange_username');
    if (!storedUsername) return;
    setConfirming(true);
    try {
      const resp = await fetch(API_CONFIRM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Username': storedUsername },
        body: JSON.stringify({ short_id: order.short_id }),
      });
      const data = await resp.json();
      if (data.success) setOrder(prev => prev ? { ...prev, status: 'Оплата отправлена' } : null);
    } catch (e) { console.error('Confirm error:', e); }
    setConfirming(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-96 border-2 border-gray-300">
        <CardContent className="pt-6 text-center space-y-4">
          <Icon name="AlertCircle" size={40} className="mx-auto text-gray-400" />
          <p className="text-gray-600">{error || 'Заказ не найден'}</p>
          <Button variant="outline" onClick={() => navigate('/')}>На главную</Button>
        </CardContent>
      </Card>
    </div>
  );

  const from = getCoinInfo(order.from_currency);
  const to = getCoinInfo(order.to_currency);
  const isCash = order.is_cash || isFiat(order.from_currency) || isFiat(order.to_currency);
  const receivingCash = isFiat(order.to_currency);
  const isWaiting = order.status === 'Ожидает оплаты';
  const isWaitingManager = order.status === 'Ожидание менеджера';
  const isTerminal = ['Завершено', 'Отменено', 'Не оплачена', 'Истекла'].includes(order.status);
  const isTracking = !isWaiting && !isWaitingManager && !isTerminal;
  const steps = isCash ? CASH_TRACKING_STEPS : TRACKING_STEPS;

  const getStepStatus = (stepKey: string) => {
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    const currentIndex = steps.findIndex(s => s.key === order.status);
    if (currentIndex < 0) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const fmtAmount = (val: string, cash: boolean) => {
    const n = parseFloat(val);
    return cash ? n.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : n.toFixed(6);
  };
  const rateFormatted = parseFloat(order.rate) >= 100 ? parseFloat(order.rate).toFixed(2) : parseFloat(order.rate).toFixed(4);
  const networkLabel = (info: ReturnType<typeof getCoinInfo>) => info.network && info.network !== 'Cash' ? info.network : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card">
        <div className="px-4 py-3 md:px-8 md:py-6 flex items-center justify-between h-[57px] md:h-[73px]">
          <button onClick={() => navigate('/')} className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            BLQOU
          </button>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={14} className="mr-1.5" />
            Назад
          </Button>
        </div>
      </header>

      <main className="px-3 py-6 md:px-4 md:py-10 max-w-3xl mx-auto">
        <Card className="border border-gray-200 md:border-2 md:border-gray-300 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-200 md:border-b-2 md:border-gray-300 px-4 py-3 md:px-6 md:py-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base md:text-xl font-medium text-gray-800 flex items-center gap-1.5 flex-wrap">
                  <span>#{order.short_id}</span>
                  {isCash && <span className="text-[10px] md:text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Наличные</span>}
                </CardTitle>
                <p className="text-gray-400 mt-0.5 text-[11px] md:text-sm">
                  {new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                  {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold rounded border whitespace-nowrap ${STATUS_STYLES[order.status] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                {order.status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:pt-6 md:px-6 space-y-4 md:space-y-5">
            {/* Суммы обмена — компактно */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 p-3 bg-neutral-50" style={{ borderLeft: `3px solid ${from.color}` }}>
                <img src={from.logo} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Отправляете</p>
                  <p className="text-base font-bold font-mono text-gray-800 truncate">
                    {fmtAmount(order.from_amount, isFiat(order.from_currency))} <span style={{ color: from.color }}>{from.rateKey}</span>
                    {networkLabel(from) && <span className="text-[9px] ml-1 bg-gray-200 text-gray-500 px-1 rounded font-normal">{networkLabel(from)}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center py-0.5 bg-gray-100">
                <Icon name="ArrowDown" size={14} className="text-gray-400" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50" style={{ borderLeft: `3px solid ${to.color}` }}>
                <img src={to.logo} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Получаете</p>
                  <p className="text-base font-bold font-mono text-gray-800 truncate">
                    {fmtAmount(order.to_amount, isFiat(order.to_currency))} <span style={{ color: to.color }}>{to.rateKey}</span>
                    {networkLabel(to) && <span className="text-[9px] ml-1 bg-gray-200 text-gray-500 px-1 rounded font-normal">{networkLabel(to)}</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Наличные: ожидание менеджера */}
            {isWaitingManager && isCash && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="MessageCircle" size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-800 text-sm">Ожидание менеджера</p>
                      <p className="text-amber-600 text-xs mt-0.5">Свяжемся с вами в Telegram</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {order.city && (
                      <div className="bg-white/70 rounded-lg p-2.5 flex items-center gap-2">
                        <Icon name="MapPin" size={14} className="text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase">Город</p>
                          <p className="text-xs font-semibold text-gray-800">{order.city}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-white/70 rounded-lg p-2.5 flex items-center gap-2">
                      <Icon name="Clock" size={14} className={timer <= 3600 ? 'text-red-500' : 'text-amber-500'} />
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase">Осталось</p>
                        <p className={`text-xs font-bold font-mono ${timer <= 3600 ? 'text-red-600' : 'text-gray-800'}`}>{fmt(timer)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Крипто: ожидание оплаты */}
            {isWaiting && !isCash && (
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 bg-neutral-50 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
                    Отправьте <span className="font-semibold" style={{ color: from.color }}>{order.from_amount} {from.rateKey}</span> на адрес
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs md:text-sm font-bold text-gray-800 break-all flex-1">{order.deposit_address}</p>
                    <button onClick={() => navigator.clipboard.writeText(order.deposit_address)} className="text-gray-400 hover:text-gray-800 transition-colors flex-shrink-0 p-1">
                      <Icon name="Copy" size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-3 border border-yellow-300 bg-yellow-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-yellow-800 uppercase">Время на оплату</p>
                    <p className="text-[10px] text-yellow-600">После истечения — отмена</p>
                  </div>
                  <p className={`text-xl font-bold font-mono ${timer <= 300 ? 'text-red-600' : 'text-yellow-800'}`}>
                    {fmt(timer)}
                  </p>
                </div>

                {timer > 0 && localStorage.getItem('exchange_username') && (
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={confirming}
                    className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm"
                  >
                    <Icon name="Check" size={16} className="mr-1.5" />
                    {confirming ? 'Подтверждение...' : 'Я отправил'}
                  </Button>
                )}
              </div>
            )}

            {/* Трекинг */}
            {(isTracking || order.status === 'Завершено') && (
              <div className="p-3 md:p-5 border border-gray-200 bg-neutral-50 rounded-lg">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Статус заказа</p>
                <div className="space-y-0">
                  {steps.map((step, i) => {
                    const status = getStepStatus(step.key);
                    const nextStep = steps[i + 1];
                    const isLast = i === steps.length - 1;
                    return (
                      <div key={step.key} className="flex items-start gap-2.5">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${status === 'active' ? 'animate-pulse' : ''}`}
                            style={{
                              backgroundColor: status !== 'pending' ? step.color : '#e5e7eb',
                              color: status !== 'pending' ? '#fff' : '#9ca3af',
                              boxShadow: status === 'active' ? `0 0 8px ${step.color}50` : undefined,
                            }}
                          >
                            <Icon name={status === 'completed' ? 'Check' : step.icon} size={12} />
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-5 rounded-full" style={{
                              backgroundColor: status === 'completed' && nextStep ? step.color : '#e5e7eb',
                            }} />
                          )}
                        </div>
                        <p className={`text-xs pt-1.5 ${status === 'pending' ? 'text-gray-400' : 'font-semibold'}`}
                          style={{ color: status !== 'pending' ? step.color : undefined }}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {order.tx_hash && (
                  <div className="mt-3 p-2 border border-green-200 bg-green-50 rounded">
                    <p className="text-[9px] text-green-600 uppercase font-semibold mb-0.5">TX Hash</p>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-[10px] text-green-800 break-all flex-1">{order.tx_hash}</p>
                      <button onClick={() => navigator.clipboard.writeText(order.tx_hash || '')} className="text-green-400 hover:text-green-700 flex-shrink-0">
                        <Icon name="Copy" size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Терминальные статусы */}
            {(order.status === 'Не оплачена' || order.status === 'Истекла') && (
              <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg text-center">
                <p className="text-sm font-semibold text-orange-800">
                  {order.status === 'Истекла' ? 'Заявка истекла' : 'Время на оплату истекло'}
                </p>
                <p className="text-xs text-orange-600 mt-0.5">Создайте новую заявку</p>
              </div>
            )}

            {/* Детали */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-neutral-50 border border-gray-100 rounded-lg text-center">
                <p className="text-[9px] text-gray-400 uppercase">Номер</p>
                <p className="text-sm font-bold font-mono text-gray-800">{order.short_id}</p>
              </div>
              <div className="p-2.5 bg-neutral-50 border border-gray-100 rounded-lg text-center">
                <p className="text-[9px] text-gray-400 uppercase">Курс</p>
                <p className="text-[11px] font-mono text-gray-800">1 {from.rateKey} = {rateFormatted} {to.rateKey}</p>
              </div>
            </div>

            {order.output_address && (
              <div className="p-3 border border-gray-200 bg-neutral-50 rounded-lg">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Адрес получения</p>
                <p className="font-mono text-xs text-gray-800 break-all">{order.output_address}</p>
              </div>
            )}

            {isCash && receivingCash && !order.output_address && (
              <div className="p-3 border border-blue-100 bg-blue-50 rounded-lg flex items-start gap-2">
                <Icon name="Info" size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-600">Детали получения наличных будут согласованы менеджером</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Order;