import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OTPVerification } from '@/components/ui/otp-input';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/base-menu';
import { FileTree } from '@/components/ui/file-tree';
import { AvatarWithName } from '@/components/ui/avatar-with-name';

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
  const [authStep, setAuthStep] = useState<'username' | 'code'>('username');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [activeTab, setActiveTab] = useState('mixer');

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

  const handleRequestCode = () => {
    if (!inputUsername.trim()) return;
    const username = inputUsername.startsWith('@') ? inputUsername : '@' + inputUsername;
    setTelegramUsername(username);
    setAuthStep('code');
  };

  const handleVerifyCode = async (code: string) => {
    if (code.length === 4) {
      setIsAuthenticated(true);
      setTimeout(() => {
        setIsAuthOpen(false);
        setAuthStep('username');
        setInputUsername('');
      }, 2000);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTelegramUsername('');
    setInputUsername('');
    setActiveTab('mixer');
  };

  const handleResendCode = () => {
    console.log('Resending code to', telegramUsername);
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
              <Menu>
                <MenuTrigger
                  render={
                    <button className="flex items-center gap-3">
                      <AvatarWithName
                        name={telegramUsername}
                        fallback={telegramUsername.slice(1, 3).toUpperCase()}
                        size="sm"
                        direction="bottom"
                      />
                    </button>
                  }
                />
                <MenuContent sideOffset={8} align="end" className="w-56">
                  <MenuItem>
                    <Icon name="User" />
                    <span>Profile</span>
                  </MenuItem>
                  <MenuItem>
                    <Icon name="Settings" />
                    <span>Settings</span>
                  </MenuItem>
                  <MenuItem onClick={() => setActiveTab('history')}>
                    <Icon name="History" />
                    <span>Transaction History</span>
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem variant="destructive" onClick={handleLogout}>
                    <Icon name="LogOut" />
                    <span>Logout</span>
                  </MenuItem>
                </MenuContent>
              </Menu>
            ) : (
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="bg-black text-white hover:bg-black/90 font-medium"
              >
                <Icon name="Send" size={16} className="mr-2" />
                Sign in via Telegram
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="mixer" className="font-medium">
              Mixer
            </TabsTrigger>
            <TabsTrigger value="history" className="font-medium">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mixer" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 max-w-6xl mx-auto">
              <FileTree
                data={[
                  {
                    name: "Mixer Settings",
                    type: "folder",
                    children: [
                      { name: "Delay: 15-45 min", type: "file", extension: "ts" },
                      { name: "Fee: 1.5%", type: "file", extension: "ts" },
                      { name: "Minimum: 0.001 BTC", type: "file", extension: "ts" },
                    ],
                  },
                  {
                    name: "Security",
                    type: "folder",
                    children: [
                      { name: "Encryption: AES-256", type: "file", extension: "ts" },
                      { name: "No-logs policy", type: "file", extension: "md" },
                    ],
                  },
                  {
                    name: "Networks",
                    type: "folder",
                    children: [
                      { name: "Bitcoin (BTC)", type: "file", extension: "json" },
                      { name: "Ethereum (ETH)", type: "file", extension: "json" },
                      { name: "Tether (USDT)", type: "file", extension: "json" },
                    ],
                  },
                ]}
                className="h-fit"
              />
              
              <Card className="border-black/10 shadow-lg">
                <CardHeader className="border-b border-black/10">
                  <CardTitle className="text-2xl">Mix Cryptocurrency</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ensure anonymity of your transactions
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleMixerSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Currency</label>
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
                    <label className="text-sm font-medium">Input Address</label>
                    <Input
                      placeholder="Enter sender address"
                      value={mixerData.inputAddress}
                      onChange={(e) =>
                        setMixerData({ ...mixerData, inputAddress: e.target.value })
                      }
                      className="border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output Address</label>
                    <Input
                      placeholder="Enter recipient address"
                      value={mixerData.outputAddress}
                      onChange={(e) =>
                        setMixerData({ ...mixerData, outputAddress: e.target.value })
                      }
                      className="border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
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
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="font-medium">1.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing Time</span>
                      <span className="font-medium">15-45 min</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-black/90 h-12 text-base font-medium"
                  >
                    <Icon name="Shuffle" size={18} className="mr-2" />
                    Start Mixing
                  </Button>
                </form>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
              
              {!isAuthenticated ? (
                <Card className="border-black/10">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Icon name="Lock" size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Sign in via Telegram to view transaction history
                    </p>
                    <Button
                      onClick={() => setIsAuthOpen(true)}
                      className="bg-black text-white hover:bg-black/90"
                    >
                      <Icon name="Send" size={16} className="mr-2" />
                      Sign in via Telegram
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
                                ? 'Completed'
                                : tx.status === 'processing'
                                ? 'Processing'
                                : 'Pending'}
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
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          {authStep === 'username' ? (
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-center mb-2">Sign in via Telegram</h2>
              <p className="text-center text-gray-600 mb-8">
                Enter your username, we'll send you a 4-digit code
              </p>
              
              <div className="space-y-4">
                <Input
                  placeholder="@username"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestCode()}
                  className="border-black/20 focus:border-black h-12"
                />
                <Button
                  onClick={handleRequestCode}
                  className="w-full bg-black text-white hover:bg-black/90 h-12"
                  disabled={!inputUsername.trim()}
                >
                  Get Code
                </Button>
              </div>
            </div>
          ) : (
            <OTPVerification
              inputCount={4}
              onVerify={handleVerifyCode}
              onResend={handleResendCode}
              telegram_username={telegramUsername}
            />
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t border-black/10 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 CryptoMixer. Anonymity guaranteed.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">
                Support
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