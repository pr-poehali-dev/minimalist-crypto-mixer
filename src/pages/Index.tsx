import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface Transaction {
  id: string;
  date: string;
  amount: string;
  currency: string;
  status: 'completed' | 'processing' | 'pending';
  fromAddress: string;
  toAddress: string;
}

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<'phone' | 'code'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');

  const [mixerData, setMixerData] = useState({
    inputAddress: '',
    outputAddress: '',
    amount: '',
    currency: 'BTC',
  });

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2026-01-15 14:32',
      amount: '0.5',
      currency: 'BTC',
      status: 'completed',
      fromAddress: '1A1zP1...eP5QGefi',
      toAddress: '3J98t1...WpEZ73C',
    },
    {
      id: '2',
      date: '2026-01-14 09:15',
      amount: '1.2',
      currency: 'BTC',
      status: 'processing',
      fromAddress: '1BvBM...SgN3zq',
      toAddress: '3FZbgi...29wHZr',
    },
  ];

  const handleAuthSubmit = () => {
    if (authStep === 'phone') {
      setAuthStep('code');
    } else if (authStep === 'code' && otpCode.length === 6) {
      setIsAuthenticated(true);
      setTelegramUsername('@cryptouser');
      setIsAuthOpen(false);
      setAuthStep('phone');
      setOtpCode('');
    }
  };

  const handleMixerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">CRYPTOMIXER</h1>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{telegramUsername}</span>
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-white" />
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="bg-black text-white hover:bg-black/90 font-medium"
              >
                <Icon name="Send" size={16} className="mr-2" />
                Войти через Telegram
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="mixer" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="mixer" className="font-medium">
              Миксер
            </TabsTrigger>
            <TabsTrigger value="history" className="font-medium">
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mixer" className="animate-fade-in">
            <Card className="max-w-2xl mx-auto border-black/10 shadow-lg">
              <CardHeader className="border-b border-black/10">
                <CardTitle className="text-2xl">Микшировать криптовалюту</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Обеспечьте анонимность ваших транзакций
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleMixerSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Валюта</label>
                    <div className="flex gap-2">
                      {['BTC', 'ETH', 'USDT'].map((curr) => (
                        <Button
                          key={curr}
                          type="button"
                          variant={mixerData.currency === curr ? 'default' : 'outline'}
                          className={
                            mixerData.currency === curr
                              ? 'bg-black text-white hover:bg-black/90'
                              : 'border-black/20 hover:border-black'
                          }
                          onClick={() => setMixerData({ ...mixerData, currency: curr })}
                        >
                          {curr}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Входящий адрес</label>
                    <Input
                      placeholder="Введите адрес отправителя"
                      value={mixerData.inputAddress}
                      onChange={(e) =>
                        setMixerData({ ...mixerData, inputAddress: e.target.value })
                      }
                      className="border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Исходящий адрес</label>
                    <Input
                      placeholder="Введите адрес получателя"
                      value={mixerData.outputAddress}
                      onChange={(e) =>
                        setMixerData({ ...mixerData, outputAddress: e.target.value })
                      }
                      className="border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Сумма</label>
                    <Input
                      type="number"
                      step="0.00000001"
                      placeholder="0.00000000"
                      value={mixerData.amount}
                      onChange={(e) => setMixerData({ ...mixerData, amount: e.target.value })}
                      className="border-black/20 focus:border-black font-mono"
                    />
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Комиссия сервиса</span>
                      <span className="font-medium">1.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Время обработки</span>
                      <span className="font-medium">15-45 мин</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-black/90 h-12 text-base font-medium"
                  >
                    <Icon name="Shuffle" size={18} className="mr-2" />
                    Начать микширование
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold mb-6">История операций</h2>
              
              {!isAuthenticated ? (
                <Card className="border-black/10">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Icon name="Lock" size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Требуется авторизация</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Войдите через Telegram, чтобы просмотреть историю операций
                    </p>
                    <Button
                      onClick={() => setIsAuthOpen(true)}
                      className="bg-black text-white hover:bg-black/90"
                    >
                      <Icon name="Send" size={16} className="mr-2" />
                      Войти через Telegram
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mockTransactions.map((tx) => (
                  <Card key={tx.id} className="border-black/10 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold">
                              {tx.amount} {tx.currency}
                            </span>
                            <span
                              className={`text-xs font-medium px-3 py-1 rounded-full ${
                                tx.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : tx.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {tx.status === 'completed'
                                ? 'Завершено'
                                : tx.status === 'processing'
                                ? 'В обработке'
                                : 'Ожидание'}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="ArrowUp" size={14} />
                              <span className="font-mono">{tx.fromAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="ArrowDown" size={14} />
                              <span className="font-mono">{tx.toAddress}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-muted-foreground">
                          {tx.date}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {authStep === 'phone' ? 'Вход через Telegram' : 'Введите код'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {authStep === 'phone' ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Введите ваш Telegram username, мы отправим 6-значный код для входа
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telegram username</label>
                  <Input
                    placeholder="@username"
                    className="border-black/20 focus:border-black"
                  />
                </div>
                <Button
                  onClick={handleAuthSubmit}
                  className="w-full bg-black text-white hover:bg-black/90"
                >
                  Получить код
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Мы отправили 6-значный код в ваш Telegram
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="border-black/20" />
                      <InputOTPSlot index={1} className="border-black/20" />
                      <InputOTPSlot index={2} className="border-black/20" />
                      <InputOTPSlot index={3} className="border-black/20" />
                      <InputOTPSlot index={4} className="border-black/20" />
                      <InputOTPSlot index={5} className="border-black/20" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleAuthSubmit}
                  disabled={otpCode.length !== 6}
                  className="w-full bg-black text-white hover:bg-black/90 disabled:opacity-50"
                >
                  Войти
                </Button>
                <button
                  onClick={() => setAuthStep('phone')}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Изменить username
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-black/10 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 CryptoMixer. Анонимность гарантирована.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Поддержка
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                FAQ
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                API
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
