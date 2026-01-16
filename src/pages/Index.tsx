import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { OTPVerification } from '@/components/ui/otp-input';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/base-menu';
import { FileTree } from '@/components/ui/file-tree';
import { AvatarWithName } from '@/components/ui/avatar-with-name';
import { FlowButton } from '@/components/ui/flow-button';

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
    delay: '15-45 min',
    fee: '1.5%',
    minimum: '0.001 BTC',
  });

  const [selectedFile, setSelectedFile] = useState('');

  const handleFileSelect = (settings: any) => {
    setMixerData({ ...mixerData, ...settings });
    setSelectedFile(settings.name || '');
  };

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

  const fileTreeData = [
    {
      name: "Bitcoin (BTC)",
      type: "folder",
      extension: "json",
      children: [
        { name: "Standard Mix", type: "file", extension: "json", settings: { currency: 'BTC', fee: '1.5%', delay: '15-45 min', minimum: '0.001 BTC' } },
        { name: "Fast Mix", type: "file", extension: "json", settings: { currency: 'BTC', fee: '2.5%', delay: '5-15 min', minimum: '0.005 BTC' } },
        { name: "Stealth Mix", type: "file", extension: "json", settings: { currency: 'BTC', fee: '3.0%', delay: '60-120 min', minimum: '0.01 BTC' } },
      ]
    },
    {
      name: "Ethereum (ETH)",
      type: "folder",
      extension: "json",
      children: [
        { name: "Standard Mix", type: "file", extension: "json", settings: { currency: 'ETH', fee: '1.2%', delay: '10-30 min', minimum: '0.01 ETH' } },
        { name: "Fast Mix", type: "file", extension: "json", settings: { currency: 'ETH', fee: '2.0%', delay: '5-10 min', minimum: '0.05 ETH' } },
      ]
    },
    {
      name: "Monero (XMR)",
      type: "folder",
      extension: "json",
      children: [
        { name: "Privacy Mix", type: "file", extension: "json", settings: { currency: 'XMR', fee: '0.8%', delay: '20-40 min', minimum: '0.1 XMR' } },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left sidebar with file tree */}
      <aside className="w-[600px] h-screen flex-shrink-0 border-r border-border/50">
        <FileTree
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          data={fileTreeData}
        />
      </aside>

      {/* Right content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50">
          <div className="px-8 py-6 flex items-center justify-between">
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
                          direction="left"
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
                <Popover open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                  <PopoverTrigger asChild>
                    <div>
                      <FlowButton text="Sign in" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-0" align="end" sideOffset={12}>
                    {authStep === 'username' ? (
                      <div className="bg-white rounded-xl p-6">
                        <div className="flex justify-center mb-4">
                          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-semibold text-center mb-2">Sign in via Telegram</h2>
                        <p className="text-center text-gray-600 mb-6 text-sm">
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
                          <div onClick={handleRequestCode} className="w-full">
                            <FlowButton text="Get Code" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <OTPVerification
                          inputCount={4}
                          onVerify={handleVerifyCode}
                          onResend={handleResendCode}
                          telegram_username={telegramUsername}
                        />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-8 py-12 overflow-y-auto">
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
              <div className="max-w-4xl mx-auto">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl">Mix Your Cryptocurrency</CardTitle>
                    <p className="text-gray-600 mt-2">
                      {selectedFile ? `Using: ${selectedFile}` : 'Select a mixing profile from the sidebar'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleMixerSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Currency</label>
                          <Input value={mixerData.currency} disabled className="bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fee</label>
                          <Input value={mixerData.fee} disabled className="bg-gray-50" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Delay</label>
                          <Input value={mixerData.delay} disabled className="bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Minimum</label>
                          <Input value={mixerData.minimum} disabled className="bg-gray-50" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Input Address</label>
                        <Input
                          placeholder="Enter your input address"
                          value={mixerData.inputAddress}
                          onChange={(e) => setMixerData({ ...mixerData, inputAddress: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Output Address</label>
                        <Input
                          placeholder="Enter your output address"
                          value={mixerData.outputAddress}
                          onChange={(e) => setMixerData({ ...mixerData, outputAddress: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <Input
                          type="number"
                          step="0.00000001"
                          placeholder="0.00000000"
                          value={mixerData.amount}
                          onChange={(e) => setMixerData({ ...mixerData, amount: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full h-12 text-base" disabled={!selectedFile}>
                        Start Mixing
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="animate-fade-in">
              <div className="max-w-6xl mx-auto">
                <div className="space-y-4">
                  {mockTransactions.map((tx) => (
                    <Card key={tx.id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">{tx.date}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                tx.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">From:</span> {tx.fromAddress}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">To:</span> {tx.toAddress}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{tx.amount} {tx.currency}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>2026 CryptoMixer. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-black transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
