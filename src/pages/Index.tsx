import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/base-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AvatarWithName } from '@/components/ui/avatar-with-name';
import { FlowButton } from '@/components/ui/flow-button';
import { OTPVerification } from '@/components/ui/otp-input';
import { FileTree } from '@/components/ui/file-tree';
import ProgressIndicator from '@/components/ui/progress-indicator';



const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [activeTab, setActiveTab] = useState('mixer');

  const [mixerData, setMixerData] = useState({
    inputAddress: '',
    outputAddress: '',
    amount: '',
    currency: 'BTC',
    delay: '5-20 min',
    fee: '13%',
    minimum: '0.001 BTC',
    preset: 'Fast Mix',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState('');
  const [showMixConfirmation, setShowMixConfirmation] = useState(false);
  const [depositAddress, setDepositAddress] = useState('');

  const handleFileSelect = (settings: any) => {
    setMixerData(prev => ({ 
      ...prev, 
      currency: settings.currency || prev.currency,
      fee: settings.fee || prev.fee,
      delay: settings.delay || prev.delay,
      minimum: settings.minimum || prev.minimum,
      preset: settings.name || '',
      description: settings.description || '',
    }));
    setSelectedFile(settings.name || '');
  };

  const handleRequestCode = () => {
    if (!inputUsername.trim()) return;
    setTelegramUsername(inputUsername);
    setIsCodeSent(true);
  };

  const handleVerifyCode = (code: string) => {
    console.log('Verifying code:', code);
    setIsAuthenticated(true);
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
    if (!isAuthenticated) {
      alert('Please login to start mixing');
      return;
    }
    if (!mixerData.inputAddress || !mixerData.outputAddress || !mixerData.amount) {
      alert('Please fill all fields');
      return;
    }
    // Generate deposit address
    const generatedAddress = `${mixerData.currency}Mix${Math.random().toString(36).substring(2, 15)}`;
    setDepositAddress(generatedAddress);
    setShowMixConfirmation(true);
  };

  const fileTreeData = [
    {
      name: "Mixer",
      type: "folder",
      children: [
        {
          name: "Bitcoin (BTC)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'BTC', fee: '13%', delay: '5-20 min', minimum: '0.0015 BTC', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'BTC', fee: '17%', delay: '20-60 min', minimum: '0.0015 BTC', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'BTC', fee: '23%', delay: '1-4 hours', minimum: '0.0075 BTC', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'BTC', fee: '30%', delay: '6-12 hours', minimum: '0.015 BTC', preset: 'Bulk Mix' } },
          ]
        },
        {
          name: "Ethereum (ETH)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'ETH', fee: '13%', delay: '5-20 min', minimum: '0.03 ETH', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'ETH', fee: '17%', delay: '20-60 min', minimum: '0.03 ETH', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'ETH', fee: '23%', delay: '1-4 hours', minimum: '0.15 ETH', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'ETH', fee: '30%', delay: '6-12 hours', minimum: '0.3 ETH', preset: 'Bulk Mix' } },
          ]
        },
        {
          name: "Monero (XMR)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'XMR', fee: '13%', delay: '5-20 min', minimum: '0.6 XMR', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'XMR', fee: '17%', delay: '20-60 min', minimum: '0.6 XMR', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'XMR', fee: '23%', delay: '1-4 hours', minimum: '3 XMR', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'XMR', fee: '30%', delay: '6-12 hours', minimum: '6 XMR', preset: 'Bulk Mix' } },
          ]
        },
        {
          name: "Tether (USDT)",
          type: "folder",
          extension: "json",
          children: [
            {
              name: "TRC20",
              type: "folder",
              extension: "json",
              children: [
                { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'USDT-TRC20', fee: '13%', delay: '5-20 min', minimum: '100 USDT', preset: 'Fast Mix' } },
                { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'USDT-TRC20', fee: '17%', delay: '20-60 min', minimum: '100 USDT', preset: 'Standard Mix' } },
                { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'USDT-TRC20', fee: '23%', delay: '1-4 hours', minimum: '500 USDT', preset: 'Privacy Mix' } },
                { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'USDT-TRC20', fee: '30%', delay: '6-12 hours', minimum: '1000 USDT', preset: 'Bulk Mix' } },
              ]
            },
            {
              name: "ERC20",
              type: "folder",
              extension: "json",
              children: [
                { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'USDT-ERC20', fee: '13%', delay: '5-20 min', minimum: '100 USDT', preset: 'Fast Mix' } },
                { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'USDT-ERC20', fee: '17%', delay: '20-60 min', minimum: '100 USDT', preset: 'Standard Mix' } },
                { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'USDT-ERC20', fee: '23%', delay: '1-4 hours', minimum: '500 USDT', preset: 'Privacy Mix' } },
                { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'USDT-ERC20', fee: '30%', delay: '6-12 hours', minimum: '1000 USDT', preset: 'Bulk Mix' } },
              ]
            },
            {
              name: "SOL",
              type: "folder",
              extension: "json",
              children: [
                { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'USDT-SOL', fee: '13%', delay: '5-20 min', minimum: '100 USDT', preset: 'Fast Mix' } },
                { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'USDT-SOL', fee: '17%', delay: '20-60 min', minimum: '100 USDT', preset: 'Standard Mix' } },
                { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'USDT-SOL', fee: '23%', delay: '1-4 hours', minimum: '500 USDT', preset: 'Privacy Mix' } },
                { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'USDT-SOL', fee: '30%', delay: '6-12 hours', minimum: '1000 USDT', preset: 'Bulk Mix' } },
              ]
            },
            {
              name: "BEP20",
              type: "folder",
              extension: "json",
              children: [
                { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'USDT-BEP20', fee: '13%', delay: '5-20 min', minimum: '100 USDT', preset: 'Fast Mix' } },
                { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'USDT-BEP20', fee: '17%', delay: '20-60 min', minimum: '100 USDT', preset: 'Standard Mix' } },
                { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'USDT-BEP20', fee: '23%', delay: '1-4 hours', minimum: '500 USDT', preset: 'Privacy Mix' } },
                { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'USDT-BEP20', fee: '30%', delay: '6-12 hours', minimum: '1000 USDT', preset: 'Bulk Mix' } },
              ]
            },
          ]
        },
        {
          name: "USD Coin (USDC)",
          type: "folder",
          extension: "json",
          children: [
            {
              name: "ERC20",
              type: "folder",
              extension: "json",
              children: [
                { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'USDC-ERC20', fee: '13%', delay: '5-20 min', minimum: '100 USDC', preset: 'Fast Mix' } },
                { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'USDC-ERC20', fee: '17%', delay: '20-60 min', minimum: '100 USDC', preset: 'Standard Mix' } },
                { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'USDC-ERC20', fee: '23%', delay: '1-4 hours', minimum: '500 USDC', preset: 'Privacy Mix' } },
                { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'USDC-ERC20', fee: '30%', delay: '6-12 hours', minimum: '1000 USDC', preset: 'Bulk Mix' } },
              ]
            },
            {
              name: "SOL",
              type: "folder",
              extension: "json",
              children: [
                { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'USDC-SOL', fee: '13%', delay: '5-20 min', minimum: '100 USDC', preset: 'Fast Mix' } },
                { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'USDC-SOL', fee: '17%', delay: '20-60 min', minimum: '100 USDC', preset: 'Standard Mix' } },
                { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'USDC-SOL', fee: '23%', delay: '1-4 hours', minimum: '500 USDC', preset: 'Privacy Mix' } },
                { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'USDC-SOL', fee: '30%', delay: '6-12 hours', minimum: '1000 USDC', preset: 'Bulk Mix' } },
              ]
            },
            {
              name: "BEP20",
              type: "folder",
              extension: "json",
              children: [
                { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'USDC-BEP20', fee: '13%', delay: '5-20 min', minimum: '100 USDC', preset: 'Fast Mix' } },
                { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'USDC-BEP20', fee: '17%', delay: '20-60 min', minimum: '100 USDC', preset: 'Standard Mix' } },
                { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'USDC-BEP20', fee: '23%', delay: '1-4 hours', minimum: '500 USDC', preset: 'Privacy Mix' } },
                { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'USDC-BEP20', fee: '30%', delay: '6-12 hours', minimum: '1000 USDC', preset: 'Bulk Mix' } },
              ]
            },
          ]
        },
        {
          name: "Dai (DAI)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'DAI', fee: '13%', delay: '5-20 min', minimum: '100 DAI', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'DAI', fee: '17%', delay: '20-60 min', minimum: '100 DAI', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'DAI', fee: '23%', delay: '1-4 hours', minimum: '500 DAI', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'DAI', fee: '30%', delay: '6-12 hours', minimum: '1000 DAI', preset: 'Bulk Mix' } },
          ]
        },
        {
          name: "Litecoin (LTC)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'LTC', fee: '13%', delay: '5-20 min', minimum: '1 LTC', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'LTC', fee: '17%', delay: '20-60 min', minimum: '1 LTC', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'LTC', fee: '23%', delay: '1-4 hours', minimum: '5 LTC', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'LTC', fee: '30%', delay: '6-12 hours', minimum: '10 LTC', preset: 'Bulk Mix' } },
          ]
        },
        {
          name: "Binance Coin (BNB)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'BNB', fee: '13%', delay: '5-20 min', minimum: '0.2 BNB', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'BNB', fee: '17%', delay: '20-60 min', minimum: '0.2 BNB', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'BNB', fee: '23%', delay: '1-4 hours', minimum: '0.8 BNB', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'BNB', fee: '30%', delay: '6-12 hours', minimum: '1.6 BNB', preset: 'Bulk Mix' } },
          ]
        },
        {
          name: "Cardano (ADA)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'ADA', fee: '13%', delay: '5-20 min', minimum: '100 ADA', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'ADA', fee: '17%', delay: '20-60 min', minimum: '100 ADA', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'ADA', fee: '23%', delay: '1-4 hours', minimum: '500 ADA', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'ADA', fee: '30%', delay: '6-12 hours', minimum: '1000 ADA', preset: 'Bulk Mix' } },
          ]
        },
        {
          name: "Solana (SOL)",
          type: "folder",
          extension: "json",
          children: [
            { name: "Fast Mix", type: "file", extension: "svg", settings: { currency: 'SOL', fee: '13%', delay: '5-20 min', minimum: '0.6 SOL', preset: 'Fast Mix' } },
            { name: "Standard Mix", type: "file", extension: "svg", settings: { currency: 'SOL', fee: '17%', delay: '20-60 min', minimum: '0.6 SOL', preset: 'Standard Mix' } },
            { name: "Privacy Mix", type: "file", extension: "svg", settings: { currency: 'SOL', fee: '23%', delay: '1-4 hours', minimum: '3 SOL', preset: 'Privacy Mix' } },
            { name: "Bulk Mix", type: "file", extension: "svg", settings: { currency: 'SOL', fee: '30%', delay: '6-12 hours', minimum: '6 SOL', preset: 'Bulk Mix' } },
          ]
        },
      ]
    },
    {
      name: "Help to choose",
      type: "folder",
      children: [
        { 
          name: "Fast Mix", 
          type: "file", 
          extension: "css", 
          settings: { 
            preset: 'Fast Mix',
            description: '⚡ Fast Mix - Quick & Efficient\n\n🕐 Processing Time: 5-20 minutes\n💰 Fee: 13%\n💵 Minimum: $100 equivalent\n\n📋 Best for:\n• Quick transactions when you need speed\n• Everyday mixing needs\n• Lower amounts that need fast processing\n\n✨ Features:\n• Fastest processing time\n• Moderate anonymity level\n• Ideal for time-sensitive operations\n• Lower minimum amount requirement\n\nRecommended for users who prioritize speed over maximum anonymity.'
          }
        },
        { 
          name: "Standard Mix", 
          type: "file", 
          extension: "css", 
          settings: { 
            preset: 'Standard Mix',
            description: '⚖️ Standard Mix - Balanced Solution\n\n🕐 Processing Time: 20-60 minutes\n💰 Fee: 17%\n💵 Minimum: $100 equivalent\n\n📋 Best for:\n• Regular mixing operations\n• Balanced privacy and speed\n• Medium-sized transactions\n\n✨ Features:\n• Good balance of speed and privacy\n• Enhanced anonymity through extended mixing\n• Suitable for most use cases\n• Optimal cost-to-privacy ratio\n\nRecommended for users seeking a balance between processing time and privacy level.'
          }
        },
        { 
          name: "Privacy Mix", 
          type: "file", 
          extension: "css", 
          settings: { 
            preset: 'Privacy Mix',
            description: '🔒 Privacy Mix - Maximum Anonymity\n\n🕐 Processing Time: 1-4 hours\n💰 Fee: 23%\n💵 Minimum: $500 equivalent\n\n📋 Best for:\n• High-value transactions\n• Maximum privacy requirements\n• Sensitive operations\n• Long-term security\n\n✨ Features:\n• Highest anonymity level\n• Multiple mixing rounds\n• Advanced obfuscation techniques\n• Maximum transaction unlinkability\n\nRecommended for users who prioritize privacy above all else and can wait longer for processing.'
          }
        },
        { 
          name: "Bulk Mix", 
          type: "file", 
          extension: "css", 
          settings: { 
            preset: 'Bulk Mix',
            description: '📦 Bulk Mix - Large Volume Operations\n\n🕐 Processing Time: 6-12 hours\n💰 Fee: 30%\n💵 Minimum: $1,000 equivalent\n\n📋 Best for:\n• Large volume transactions\n• Enterprise-level operations\n• Maximum security requirements\n• Professional mixing needs\n\n✨ Features:\n• Ultimate privacy and security\n• Extended mixing periods\n• Multiple transaction splitting\n• Institutional-grade anonymization\n• Comprehensive trail elimination\n\nRecommended for large-scale operations where maximum security justifies higher fees and longer processing times.'
          }
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-[400px] h-screen flex-shrink-0 border-r border-border/50">
        <FileTree
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          data={fileTreeData}
        />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border/50">
          <div className="px-8 py-6 flex items-center justify-end">
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
                      <button className="w-full text-left" onClick={() => setActiveTab('my-mixes')}>
                        Мои миксы
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button className="w-full text-left" onClick={() => setActiveTab('faq')}>
                        FAQ
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button className="w-full text-left" onClick={handleLogout}>
                        Logout
                      </button>
                    </MenuItem>
                  </MenuContent>
                </Menu>
              ) : (
                <Popover>
                  <PopoverTrigger>
                    <Button variant="outline">Login with Telegram</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    {!isCodeSent ? (
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2 text-center">
                          Login with Telegram
                        </h3>
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

        <main className="flex-1 pl-4 pr-4 py-12 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-12">
              <TabsTrigger value="mixer" className="font-medium">
                Mixer
              </TabsTrigger>
              <TabsTrigger value="my-mixes" className="font-medium">
                Мои миксы
              </TabsTrigger>
              <TabsTrigger value="faq" className="font-medium">
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mixer" className="animate-fade-in">
              <div className="max-w-4xl">
                {showMixConfirmation ? (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-2xl">Send Cryptocurrency for Mixing</CardTitle>
                      <p className="text-gray-600 mt-2">
                        Send your crypto to the address below to start the mixing process
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                        <h3 className="text-lg font-semibold mb-4 text-blue-900">Deposit Address</h3>
                        <div className="bg-white p-4 rounded-md border border-blue-300 font-mono text-sm break-all">
                          {depositAddress}
                        </div>
                        <Button 
                          onClick={() => navigator.clipboard.writeText(depositAddress)}
                          variant="outline"
                          className="w-full mt-4"
                        >
                          Copy Address
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Mix Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Currency</p>
                            <p className="text-lg font-semibold">{mixerData.currency}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="text-lg font-semibold">{mixerData.amount} {mixerData.currency}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Fee</p>
                            <p className="text-lg font-semibold">{mixerData.fee}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Delay</p>
                            <p className="text-lg font-semibold">{mixerData.delay}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Input Address</p>
                          <p className="font-mono text-sm break-all">{mixerData.inputAddress}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Output Address</p>
                          <p className="font-mono text-sm break-all">{mixerData.outputAddress}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Mixing Profile</p>
                          <p className="font-semibold">{selectedFile}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Please send exactly <strong>{mixerData.amount} {mixerData.currency}</strong> to the deposit address above. 
                          The mixing process will start automatically after {mixerData.delay}.
                        </p>
                      </div>

                      <Button 
                        onClick={() => {
                          setShowMixConfirmation(false);
                          setMixerData({
                            inputAddress: '',
                            outputAddress: '',
                            amount: '',
                            currency: 'BTC',
                            delay: '5-20 min',
                            fee: '13%',
                            minimum: '0.001 BTC',
                            preset: 'Fast Mix',
                            description: '',
                          });
                          setSelectedFile('');
                        }}
                        variant="outline"
                        className="w-full h-12"
                      >
                        Start New Mix
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-2xl">Mix Your Cryptocurrency</CardTitle>
                      <p className="text-gray-600 mt-2">
                        {selectedFile ? `Using: ${selectedFile}` : 'Select a mixing profile from the sidebar'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {mixerData.description ? (
                      <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                            {mixerData.description}
                          </pre>
                        </div>
                        <Button 
                          onClick={() => setMixerData(prev => ({ ...prev, description: '' }))}
                          variant="outline"
                          className="w-full h-12"
                        >
                          Back to Mixer Form
                        </Button>
                      </div>
                    ) : (
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

                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base" 
                          disabled={!selectedFile || !mixerData.inputAddress || !mixerData.outputAddress || !mixerData.amount}
                        >
                          Start Mixing
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-mixes" className="animate-fade-in">
              <div className="max-w-7xl mx-auto">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl">Мои миксы</CardTitle>
                    <p className="text-gray-600 mt-2">
                      История всех ваших транзакций микширования
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium text-gray-600">ID</th>
                            <th className="text-left p-4 font-medium text-gray-600">Дата</th>
                            <th className="text-left p-4 font-medium text-gray-600">Валюта</th>
                            <th className="text-left p-4 font-medium text-gray-600">Сумма</th>
                            <th className="text-left p-4 font-medium text-gray-600">Статус</th>
                            <th className="text-left p-4 font-medium text-gray-600">Input Address</th>
                            <th className="text-left p-4 font-medium text-gray-600">Output Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td colSpan={7} className="p-8 text-center text-gray-500">
                              У вас пока нет миксов
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="animate-fade-in">
              <div className="max-w-6xl mx-auto space-y-8">
                <Card className="border-2">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Как пользоваться платформой</CardTitle>
                    <p className="text-gray-600 mt-2">
                      Пошаговое руководство по созданию микса
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-[52px] top-20 bottom-20 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500"></div>
                      
                      <div className="space-y-12">
                        <div className="flex gap-6 relative">
                          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg z-10">
                            1
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="text-2xl font-bold mb-3">Авторизация</h3>
                            <p className="text-gray-700 mb-4 text-lg">
                              Нажмите кнопку "Login with Telegram" в правом верхнем углу
                            </p>
                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="text-gray-700">Введите ваш Telegram username (например: @username)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="text-gray-700">Получите 4-значный код в боте</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="text-gray-700">Введите код для входа</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-6 relative">
                          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg z-10">
                            2
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="text-2xl font-bold mb-3">Выбор профиля микса</h3>
                            <p className="text-gray-700 mb-4 text-lg">
                              В левой панели выберите криптовалюту и тип микширования
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                                <div className="font-bold text-blue-900 mb-2">⚡ Fast Mix</div>
                                <div className="text-sm text-gray-700">Комиссия: 13%</div>
                                <div className="text-sm text-gray-700">Время: 5-20 мин</div>
                              </div>
                              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                                <div className="font-bold text-green-900 mb-2">🔧 Standard Mix</div>
                                <div className="text-sm text-gray-700">Комиссия: 17%</div>
                                <div className="text-sm text-gray-700">Время: 20-60 мин</div>
                              </div>
                              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                                <div className="font-bold text-purple-900 mb-2">🔒 Privacy Mix</div>
                                <div className="text-sm text-gray-700">Комиссия: 23%</div>
                                <div className="text-sm text-gray-700">Время: 1-4 часа</div>
                              </div>
                              <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                                <div className="font-bold text-orange-900 mb-2">📦 Bulk Mix</div>
                                <div className="text-sm text-gray-700">Комиссия: 30%</div>
                                <div className="text-sm text-gray-700">Время: 6-12 часов</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-6 relative">
                          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg z-10">
                            3
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="text-2xl font-bold mb-3">Заполнение данных</h3>
                            <p className="text-gray-700 mb-4 text-lg">
                              Укажите адреса кошельков и сумму транзакции
                            </p>
                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 space-y-4">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">📥</div>
                                <div>
                                  <div className="font-semibold text-gray-900">Input Address</div>
                                  <div className="text-sm text-gray-600">Адрес вашего кошелька, с которого отправляете</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">📤</div>
                                <div>
                                  <div className="font-semibold text-gray-900">Output Address</div>
                                  <div className="text-sm text-gray-600">Адрес, на который получите чистые монеты</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">💰</div>
                                <div>
                                  <div className="font-semibold text-gray-900">Amount</div>
                                  <div className="text-sm text-gray-600">Сумма для микширования</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-6 relative">
                          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg z-10">
                            4
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="text-2xl font-bold mb-3">Отправка криптовалюты</h3>
                            <p className="text-gray-700 mb-4 text-lg">
                              После нажатия "Start Mixing" вы получите адрес для депозита
                            </p>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                              <div className="space-y-3">
                                <div className="font-semibold text-orange-900">⚠️ Важно:</div>
                                <div className="text-sm text-gray-700">• Отправьте ТОЧНУЮ сумму на указанный адрес</div>
                                <div className="text-sm text-gray-700">• Используйте кнопку "Copy Address" для копирования</div>
                                <div className="text-sm text-gray-700">• Сохраните адрес депозита до завершения транзакции</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-6 relative">
                          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg z-10">
                            5
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="text-2xl font-bold mb-3">Отслеживание статуса</h3>
                            <p className="text-gray-700 mb-4 text-lg">
                              Перейдите в раздел "Мои миксы" для просмотра статуса
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                                <div className="font-bold text-yellow-900 mb-2">⏳ В процессе</div>
                                <div className="text-sm text-gray-700">Микс создан, ожидает депозита</div>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                                <div className="font-bold text-blue-900 mb-2">🔄 Принят в работу</div>
                                <div className="text-sm text-gray-700">Средства получены, начато микширование</div>
                              </div>
                              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                                <div className="font-bold text-purple-900 mb-2">📤 Отправлено</div>
                                <div className="text-sm text-gray-700">Средства отправлены на выходной адрес</div>
                              </div>
                              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                                <div className="font-bold text-green-900 mb-2">✅ Готово!</div>
                                <div className="text-sm text-gray-700">Транзакция успешно завершена</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                      <div className="bg-white p-8 rounded-xl">
                        <ProgressIndicator />
                      </div>
                      <p className="text-center text-gray-700 mt-4 font-medium">
                        Используйте интерактивный переключатель выше для навигации по этапам
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>

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