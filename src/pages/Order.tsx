import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const API_GET_ORDER = 'https://functions.poehali.dev/da825e7a-ffdb-4fe2-8ced-a59edb04e1e6';
const API_CONFIRM = 'https://functions.poehali.dev/57779eea-72f4-4cc7-8605-2ae935a9a5a0';

interface CoinInfo {
  symbol: string; name: string; logo: string; color: string; network?: string; rateKey: string;
}

const COINS_LIST: CoinInfo[] = [
  { symbol: 'BTC', name: 'Bitcoin', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', rateKey: 'BTC', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', rateKey: 'ETH', color: '#627EEA' },
  { symbol: 'USDT-TRC20', name: 'Tether', logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', network: 'TRC20', rateKey: 'USDT', color: '#26A17B' },
  { symbol: 'USDT-ERC20', name: 'Tether', logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', network: 'ERC20', rateKey: 'USDT', color: '#26A17B' },
  { symbol: 'USDC-ERC20', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', network: 'ERC20', rateKey: 'USDC', color: '#2775CA' },
  { symbol: 'USDC-TRC20', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', network: 'TRC20', rateKey: 'USDC', color: '#2775CA' },
  { symbol: 'BNB', name: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', rateKey: 'BNB', color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', rateKey: 'SOL', color: '#9945FF' },
  { symbol: 'XRP', name: 'Ripple', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', rateKey: 'XRP', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', rateKey: 'ADA', color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', logo: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', rateKey: 'DOGE', color: '#C2A633' },
  { symbol: 'LTC', name: 'Litecoin', logo: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', rateKey: 'LTC', color: '#345D9D' },
  { symbol: 'XMR', name: 'Monero', logo: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png', rateKey: 'XMR', color: '#FF6600' },
  { symbol: 'TRX', name: 'TRON', logo: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png', rateKey: 'TRX', color: '#EF0027' },
  { symbol: 'TON', name: 'Toncoin', logo: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png', rateKey: 'TON', color: '#0098EA' },
];

const getCoinInfo = (symbol: string): CoinInfo =>
  COINS_LIST.find(c => c.symbol === symbol) || { symbol, name: symbol, logo: '', rateKey: symbol, color: '#666' };

const STATUS_STYLES: Record<string, string> = {
  'Ожидает оплаты': 'bg-yellow-50 border-yellow-300 text-yellow-700',
  'Оплата отправлена': 'bg-cyan-50 border-cyan-300 text-cyan-700',
  'Оплата получена': 'bg-blue-50 border-blue-300 text-blue-700',
  'В обработке': 'bg-indigo-50 border-indigo-300 text-indigo-700',
  'Отправлено': 'bg-purple-50 border-purple-300 text-purple-700',
  'Завершено': 'bg-green-50 border-green-300 text-green-700',
  'Отменено': 'bg-red-50 border-red-300 text-red-700',
  'Не оплачена': 'bg-orange-50 border-orange-300 text-orange-700',
};

const TRACKING_STEPS = [
  { key: 'Ожидает оплаты', label: 'Ожидание оплаты', icon: 'Clock', color: '#F97316' },
  { key: 'Оплата отправлена', label: 'Оплата отправлена', icon: 'Send', color: '#06B6D4' },
  { key: 'Оплата получена', label: 'Оплата получена', icon: 'CheckCircle', color: '#3B82F6' },
  { key: 'В обработке', label: 'Обработка обмена', icon: 'RefreshCw', color: '#8B5CF6' },
  { key: 'Отправлено', label: 'Средства отправлены', icon: 'ArrowUpRight', color: '#EC4899' },
  { key: 'Завершено', label: 'Завершено', icon: 'Check', color: '#22C55E' },
];

interface OrderData {
  id: number; short_id: string; from_currency: string; to_currency: string;
  from_amount: string; to_amount: string; rate: string; deposit_address: string;
  output_address: string; status: string; tx_hash?: string; created_at: string; updated_at: string;
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
        const createdStr = data.order.created_at.endsWith('Z') ? data.order.created_at : data.order.created_at + 'Z';
        const created = new Date(createdStr).getTime();
        const remaining = Math.max(0, Math.floor((created + 1800000 - Date.now()) / 1000));
        setTimer(remaining);
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
    if (!order || order.status === 'Завершено' || order.status === 'Отменено' || order.status === 'Не оплачена') return;
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  useEffect(() => {
    if (timer === 0 && order && order.status === 'Ожидает оплаты') {
      fetchOrder();
    }
  }, [timer, order, fetchOrder]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleConfirmPayment = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      const resp = await fetch(API_CONFIRM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_id: order.short_id }),
      });
      const data = await resp.json();
      if (data.success) {
        setOrder(prev => prev ? { ...prev, status: 'Оплата отправлена' } : null);
      }
    } catch (e) {
      console.error('Confirm error:', e);
    }
    setConfirming(false);
  };

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'pending';
    const stepIndex = TRACKING_STEPS.findIndex(s => s.key === stepKey);
    const currentIndex = TRACKING_STEPS.findIndex(s => s.key === order.status);
    if (currentIndex < 0) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96 border-2 border-gray-300">
          <CardContent className="pt-6 text-center space-y-4">
            <Icon name="AlertCircle" size={40} className="mx-auto text-gray-400" />
            <p className="text-gray-600">{error || 'Заказ не найден'}</p>
            <Button variant="outline" onClick={() => navigate('/')}>На главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const from = getCoinInfo(order.from_currency);
  const to = getCoinInfo(order.to_currency);
  const isWaiting = order.status === 'Ожидает оплаты';
  const isTerminal = ['Завершено', 'Отменено', 'Не оплачена'].includes(order.status);
  const isTracking = !isWaiting && !isTerminal;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card">
        <div className="px-8 py-6 flex items-center justify-between h-[73px]">
          <button onClick={() => navigate('/')} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            EXCHANGE
          </button>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={14} className="mr-2" />
            На главную
          </Button>
        </div>
      </header>

      <main className="px-4 py-10 max-w-3xl mx-auto">
        <Card className="border-2 border-gray-300 bg-white shadow-sm">
          <CardHeader className="border-b-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium text-black tracking-tight flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Заказ #{order.short_id}
                </CardTitle>
                <p className="text-gray-500 mt-1 text-sm">
                  {new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                  {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-sm border ${STATUS_STYLES[order.status] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                {order.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex-1 p-4 border-2 bg-neutral-50" style={{ borderColor: from.color + '40' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: from.color }}>Отправляете</p>
                <div className="flex items-center gap-2">
                  <img src={from.logo} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-lg font-bold font-mono text-black">{order.from_amount}</span>
                  <span className="font-mono font-semibold" style={{ color: from.color }}>{from.rateKey}</span>
                  {from.network && <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded">{from.network}</span>}
                </div>
              </div>
              <Icon name="ArrowRight" size={20} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 p-4 border-2 bg-neutral-50" style={{ borderColor: to.color + '40' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: to.color }}>Получаете</p>
                <div className="flex items-center gap-2">
                  <img src={to.logo} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-lg font-bold font-mono text-black">{parseFloat(order.to_amount).toFixed(6)}</span>
                  <span className="font-mono font-semibold" style={{ color: to.color }}>{to.rateKey}</span>
                  {to.network && <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded">{to.network}</span>}
                </div>
              </div>
            </div>

            {isWaiting && (
              <>
                <div className="p-4 border-2 border-gray-300 bg-neutral-50">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                    Отправьте <span style={{ color: from.color }}>{order.from_amount} {from.rateKey}</span> на адрес
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-bold text-black break-all flex-1">{order.deposit_address}</p>
                    <button onClick={() => navigator.clipboard.writeText(order.deposit_address)} className="text-gray-400 hover:text-black transition-colors flex-shrink-0 p-1">
                      <Icon name="Copy" size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 border-2 border-yellow-300 bg-yellow-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wider">Время на оплату</p>
                    <p className="text-xs text-yellow-600 mt-0.5">После истечения заявка будет отменена</p>
                  </div>
                  <p className={`text-2xl font-bold font-mono ${timer <= 300 ? 'text-red-600' : 'text-yellow-800'}`}>
                    {fmt(timer)}
                  </p>
                </div>

                {timer > 0 && (
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={confirming}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-sm uppercase tracking-wider"
                  >
                    <Icon name="Check" size={18} className="mr-2" />
                    {confirming ? 'Подтверждение...' : 'Я отправил'}
                  </Button>
                )}
              </>
            )}

            {(isTracking || order.status === 'Завершено') && (
              <div className="p-5 border-2 border-gray-200 bg-neutral-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Отслеживание заказа</p>
                <div className="space-y-0">
                  {TRACKING_STEPS.map((step, i) => {
                    const status = getStepStatus(step.key);
                    const nextStep = TRACKING_STEPS[i + 1];
                    const isLast = i === TRACKING_STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                              status === 'active' ? 'animate-pulse shadow-lg' : ''
                            }`}
                            style={{
                              backgroundColor: status !== 'pending' ? step.color : undefined,
                              color: status !== 'pending' ? '#fff' : undefined,
                              boxShadow: status === 'active' ? `0 0 12px ${step.color}60` : undefined,
                            }}
                          >
                            {status === 'pending' ? (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <Icon name={step.icon} size={14} />
                              </div>
                            ) : (
                              <Icon name={status === 'completed' ? 'Check' : step.icon} size={14} />
                            )}
                          </div>
                          {!isLast && (
                            <div className="w-1 h-6 rounded-full overflow-hidden">
                              {status === 'completed' && nextStep ? (
                                <div
                                  className="w-full h-full"
                                  style={{
                                    background: `linear-gradient(to bottom, ${step.color}, ${nextStep.color})`,
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p
                            className={`text-sm font-medium transition-colors ${status === 'pending' ? 'text-gray-400' : 'font-semibold'}`}
                            style={{ color: status !== 'pending' ? step.color : undefined }}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.tx_hash && (
                  <div className="mt-4 p-3 border border-green-200 bg-green-50">
                    <p className="text-[10px] text-green-600 uppercase tracking-wider font-semibold mb-1">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-green-800 break-all flex-1">{order.tx_hash}</p>
                      <button onClick={() => navigator.clipboard.writeText(order.tx_hash || '')} className="text-green-400 hover:text-green-700 transition-colors flex-shrink-0">
                        <Icon name="Copy" size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {order.status === 'Не оплачена' && (
              <div className="p-4 border-2 border-orange-300 bg-orange-50 text-center">
                <p className="text-sm font-semibold text-orange-800">Время на оплату истекло</p>
                <p className="text-xs text-orange-600 mt-1">Создайте новую заявку на обмен</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 border border-gray-200 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Номер заказа</p>
                <p className="text-base font-bold font-mono text-black mt-1">{order.short_id}</p>
              </div>
              <div className="p-3 bg-neutral-50 border border-gray-200 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Курс</p>
                <p className="text-xs font-mono text-black mt-1">1 {from.rateKey} = {parseFloat(order.rate).toFixed(4)} {to.rateKey}</p>
              </div>
            </div>

            <div className="p-4 border-2 border-gray-300 bg-neutral-50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Адрес получения {to.rateKey}</p>
              <p className="font-mono text-sm text-black break-all">{order.output_address}</p>
            </div>


          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Order;