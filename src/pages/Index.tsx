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
              <div onClick={() => setIsAuthOpen(true)}>
                <FlowButton text="Sign in" />
              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-[600px_1fr] gap-6 max-w-7xl mx-auto">
              <FileTree
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                data={[
                  {
                    name: "Bitcoin (BTC)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (15-30 min, 1.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (15-30 min, 1.5%)",
                          currency: 'BTC', 
                          delay: '15-30 min', 
                          fee: '1.5%', 
                          minimum: '0.001 BTC' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-60 min, 1.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-60 min, 1.0%)",
                          currency: 'BTC', 
                          delay: '30-60 min', 
                          fee: '1.0%', 
                          minimum: '0.005 BTC' 
                        }
                      },
                      { 
                        name: "Deep Mix (2-4 hours, 0.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Deep Mix (2-4 hours, 0.5%)",
                          currency: 'BTC', 
                          delay: '2-4 hours', 
                          fee: '0.5%', 
                          minimum: '0.01 BTC' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Ethereum (ETH)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (10-20 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (10-20 min, 2.0%)",
                          currency: 'ETH', 
                          delay: '10-20 min', 
                          fee: '2.0%', 
                          minimum: '0.05 ETH' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-45 min, 1.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-45 min, 1.5%)",
                          currency: 'ETH', 
                          delay: '30-45 min', 
                          fee: '1.5%', 
                          minimum: '0.1 ETH' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Tether (USDT)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (5-15 min, 2.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (5-15 min, 2.5%)",
                          currency: 'USDT', 
                          delay: '5-15 min', 
                          fee: '2.5%', 
                          minimum: '100 USDT' 
                        }
                      },
                      { 
                        name: "Standard Mix (20-40 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (20-40 min, 2.0%)",
                          currency: 'USDT', 
                          delay: '20-40 min', 
                          fee: '2.0%', 
                          minimum: '500 USDT' 
                        }
                      },
                    ],
                  },
                  {
                    name: "USD Coin (USDC)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (5-15 min, 2.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (5-15 min, 2.5%)",
                          currency: 'USDC', 
                          delay: '5-15 min', 
                          fee: '2.5%', 
                          minimum: '100 USDC' 
                        }
                      },
                      { 
                        name: "Standard Mix (20-40 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (20-40 min, 2.0%)",
                          currency: 'USDC', 
                          delay: '20-40 min', 
                          fee: '2.0%', 
                          minimum: '500 USDC' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Binance Coin (BNB)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (10-20 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (10-20 min, 2.0%)",
                          currency: 'BNB', 
                          delay: '10-20 min', 
                          fee: '2.0%', 
                          minimum: '0.1 BNB' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-45 min, 1.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-45 min, 1.5%)",
                          currency: 'BNB', 
                          delay: '30-45 min', 
                          fee: '1.5%', 
                          minimum: '0.5 BNB' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Solana (SOL)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (8-18 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (8-18 min, 2.0%)",
                          currency: 'SOL', 
                          delay: '8-18 min', 
                          fee: '2.0%', 
                          minimum: '0.5 SOL' 
                        }
                      },
                      { 
                        name: "Standard Mix (25-40 min, 1.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (25-40 min, 1.5%)",
                          currency: 'SOL', 
                          delay: '25-40 min', 
                          fee: '1.5%', 
                          minimum: '2 SOL' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Cardano (ADA)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (12-25 min, 2.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (12-25 min, 2.5%)",
                          currency: 'ADA', 
                          delay: '12-25 min', 
                          fee: '2.5%', 
                          minimum: '100 ADA' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-50 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-50 min, 2.0%)",
                          currency: 'ADA', 
                          delay: '30-50 min', 
                          fee: '2.0%', 
                          minimum: '500 ADA' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Ripple (XRP)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (5-12 min, 2.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (5-12 min, 2.5%)",
                          currency: 'XRP', 
                          delay: '5-12 min', 
                          fee: '2.5%', 
                          minimum: '50 XRP' 
                        }
                      },
                      { 
                        name: "Standard Mix (20-35 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (20-35 min, 2.0%)",
                          currency: 'XRP', 
                          delay: '20-35 min', 
                          fee: '2.0%', 
                          minimum: '200 XRP' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Polkadot (DOT)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (15-25 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (15-25 min, 2.0%)",
                          currency: 'DOT', 
                          delay: '15-25 min', 
                          fee: '2.0%', 
                          minimum: '5 DOT' 
                        }
                      },
                      { 
                        name: "Standard Mix (35-50 min, 1.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (35-50 min, 1.5%)",
                          currency: 'DOT', 
                          delay: '35-50 min', 
                          fee: '1.5%', 
                          minimum: '20 DOT' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Dogecoin (DOGE)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (10-20 min, 3.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (10-20 min, 3.0%)",
                          currency: 'DOGE', 
                          delay: '10-20 min', 
                          fee: '3.0%', 
                          minimum: '1000 DOGE' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-45 min, 2.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-45 min, 2.5%)",
                          currency: 'DOGE', 
                          delay: '30-45 min', 
                          fee: '2.5%', 
                          minimum: '5000 DOGE' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Avalanche (AVAX)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (10-20 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (10-20 min, 2.0%)",
                          currency: 'AVAX', 
                          delay: '10-20 min', 
                          fee: '2.0%', 
                          minimum: '1 AVAX' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-45 min, 1.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-45 min, 1.5%)",
                          currency: 'AVAX', 
                          delay: '30-45 min', 
                          fee: '1.5%', 
                          minimum: '5 AVAX' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Polygon (MATIC)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (8-15 min, 2.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (8-15 min, 2.5%)",
                          currency: 'MATIC', 
                          delay: '8-15 min', 
                          fee: '2.5%', 
                          minimum: '50 MATIC' 
                        }
                      },
                      { 
                        name: "Standard Mix (25-40 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (25-40 min, 2.0%)",
                          currency: 'MATIC', 
                          delay: '25-40 min', 
                          fee: '2.0%', 
                          minimum: '200 MATIC' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Litecoin (LTC)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (12-25 min, 1.8%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (12-25 min, 1.8%)",
                          currency: 'LTC', 
                          delay: '12-25 min', 
                          fee: '1.8%', 
                          minimum: '0.1 LTC' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-50 min, 1.3%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-50 min, 1.3%)",
                          currency: 'LTC', 
                          delay: '30-50 min', 
                          fee: '1.3%', 
                          minimum: '0.5 LTC' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Chainlink (LINK)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (15-28 min, 2.2%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (15-28 min, 2.2%)",
                          currency: 'LINK', 
                          delay: '15-28 min', 
                          fee: '2.2%', 
                          minimum: '10 LINK' 
                        }
                      },
                      { 
                        name: "Standard Mix (35-50 min, 1.8%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (35-50 min, 1.8%)",
                          currency: 'LINK', 
                          delay: '35-50 min', 
                          fee: '1.8%', 
                          minimum: '50 LINK' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Monero (XMR)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (20-35 min, 1.2%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (20-35 min, 1.2%)",
                          currency: 'XMR', 
                          delay: '20-35 min', 
                          fee: '1.2%', 
                          minimum: '0.5 XMR' 
                        }
                      },
                      { 
                        name: "Deep Mix (1-3 hours, 0.8%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Deep Mix (1-3 hours, 0.8%)",
                          currency: 'XMR', 
                          delay: '1-3 hours', 
                          fee: '0.8%', 
                          minimum: '2 XMR' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Tron (TRX)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (8-18 min, 2.8%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (8-18 min, 2.8%)",
                          currency: 'TRX', 
                          delay: '8-18 min', 
                          fee: '2.8%', 
                          minimum: '500 TRX' 
                        }
                      },
                      { 
                        name: "Standard Mix (25-40 min, 2.3%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (25-40 min, 2.3%)",
                          currency: 'TRX', 
                          delay: '25-40 min', 
                          fee: '2.3%', 
                          minimum: '2000 TRX' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Shiba Inu (SHIB)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (10-22 min, 3.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (10-22 min, 3.5%)",
                          currency: 'SHIB', 
                          delay: '10-22 min', 
                          fee: '3.5%', 
                          minimum: '1000000 SHIB' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-48 min, 3.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-48 min, 3.0%)",
                          currency: 'SHIB', 
                          delay: '30-48 min', 
                          fee: '3.0%', 
                          minimum: '5000000 SHIB' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Uniswap (UNI)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (12-25 min, 2.3%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (12-25 min, 2.3%)",
                          currency: 'UNI', 
                          delay: '12-25 min', 
                          fee: '2.3%', 
                          minimum: '5 UNI' 
                        }
                      },
                      { 
                        name: "Standard Mix (30-45 min, 1.9%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (30-45 min, 1.9%)",
                          currency: 'UNI', 
                          delay: '30-45 min', 
                          fee: '1.9%', 
                          minimum: '20 UNI' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Cosmos (ATOM)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (15-28 min, 2.1%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (15-28 min, 2.1%)",
                          currency: 'ATOM', 
                          delay: '15-28 min', 
                          fee: '2.1%', 
                          minimum: '5 ATOM' 
                        }
                      },
                      { 
                        name: "Standard Mix (35-52 min, 1.7%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (35-52 min, 1.7%)",
                          currency: 'ATOM', 
                          delay: '35-52 min', 
                          fee: '1.7%', 
                          minimum: '20 ATOM' 
                        }
                      },
                    ],
                  },
                  {
                    name: "DAI Stablecoin (DAI)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (5-15 min, 2.5%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (5-15 min, 2.5%)",
                          currency: 'DAI', 
                          delay: '5-15 min', 
                          fee: '2.5%', 
                          minimum: '100 DAI' 
                        }
                      },
                      { 
                        name: "Standard Mix (20-40 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (20-40 min, 2.0%)",
                          currency: 'DAI', 
                          delay: '20-40 min', 
                          fee: '2.0%', 
                          minimum: '500 DAI' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Arbitrum (ARB)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (8-18 min, 2.4%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (8-18 min, 2.4%)",
                          currency: 'ARB', 
                          delay: '8-18 min', 
                          fee: '2.4%', 
                          minimum: '50 ARB' 
                        }
                      },
                      { 
                        name: "Standard Mix (25-42 min, 2.0%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (25-42 min, 2.0%)",
                          currency: 'ARB', 
                          delay: '25-42 min', 
                          fee: '2.0%', 
                          minimum: '200 ARB' 
                        }
                      },
                    ],
                  },
                  {
                    name: "Optimism (OP)",
                    type: "folder",
                    extension: "json",
                    children: [
                      { 
                        name: "Fast Mix (10-22 min, 2.3%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Fast Mix (10-22 min, 2.3%)",
                          currency: 'OP', 
                          delay: '10-22 min', 
                          fee: '2.3%', 
                          minimum: '20 OP' 
                        }
                      },
                      { 
                        name: "Standard Mix (28-45 min, 1.9%)", 
                        type: "file", 
                        extension: "json",
                        settings: { 
                          name: "Standard Mix (28-45 min, 1.9%)",
                          currency: 'OP', 
                          delay: '28-45 min', 
                          fee: '1.9%', 
                          minimum: '100 OP' 
                        }
                      },
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
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Selected Currency</span>
                      <span className="text-lg font-bold">{mixerData.currency}</span>
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
                      <span className="text-muted-foreground">Selected Profile</span>
                      <span className="font-medium">{selectedFile || 'None'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="font-medium">{mixerData.fee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing Time</span>
                      <span className="font-medium">{mixerData.delay}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Minimum Amount</span>
                      <span className="font-medium">{mixerData.minimum}</span>
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
                    <div onClick={() => setIsAuthOpen(true)}>
                      <FlowButton text="Sign in" />
                    </div>
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
                <div onClick={handleRequestCode} className="w-full">
                  <FlowButton text="Get Code" />
                </div>
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