import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/radix-dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AvatarWithName } from '@/components/ui/avatar-with-name';
import { FlowButton } from '@/components/ui/flow-button';
import { OTPVerification } from '@/components/ui/otp-input';
import { FileTree } from '@/components/ui/file-tree';
import ProgressIndicator from '@/components/ui/progress-indicator';
import { MixesTable } from '@/components/ui/mixes-table';
import { GlassFilter } from '@/components/ui/liquid-radio';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UnsavePopup } from '@/components/ui/unsave-popup';
import { Info, Lock, FolderTree, FileEdit, Send, BarChart3, Copy, Wallet, CheckCircle2, Clock, RefreshCw, Mail, Shield, Zap, Scale, Package, ArrowDownToLine, ArrowUpFromLine, DollarSign, Timer, User, ClipboardList, Lightbulb, AlertTriangle, X, Check, Briefcase } from 'lucide-react';



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
  const [tutorialPage, setTutorialPage] = useState(1);
  const [mixes, setMixes] = useState<any[]>([]);
  const [isLoadingMixes, setIsLoadingMixes] = useState(false);
  const [showUnsavePopup, setShowUnsavePopup] = useState(false);
  const [shouldBlockNav, setShouldBlockNav] = useState(false);
  const [originalMixerData, setOriginalMixerData] = useState({
    inputAddress: '',
    outputAddress: '',
    amount: '',
  });

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
    const generatedAddress = `${mixerData.currency}Mix${Math.random().toString(36).substring(2, 15)}`;
    setDepositAddress(generatedAddress);
    setShowMixConfirmation(true);
    setShowUnsavePopup(false);
    setOriginalMixerData({
      inputAddress: mixerData.inputAddress,
      outputAddress: mixerData.outputAddress,
      amount: mixerData.amount,
    });
  };

  const handleMixerDataChange = (field: string, value: string) => {
    setMixerData(prev => ({ ...prev, [field]: value }));
    if (['inputAddress', 'outputAddress', 'amount'].includes(field)) {
      setShowUnsavePopup(true);
      setShouldBlockNav(true);
    }
  };

  const handleSaveForm = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setShowUnsavePopup(false);
    setOriginalMixerData({
      inputAddress: mixerData.inputAddress,
      outputAddress: mixerData.outputAddress,
      amount: mixerData.amount,
    });
  };

  const handleResetForm = () => {
    setMixerData(prev => ({
      ...prev,
      inputAddress: originalMixerData.inputAddress,
      outputAddress: originalMixerData.outputAddress,
      amount: originalMixerData.amount,
    }));
    setShowUnsavePopup(false);
    setShouldBlockNav(false);
  };

  const shouldBlockFn = () => shouldBlockNav;

  // Fetch mixes when user is authenticated and tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === 'my-mixes') {
      setIsLoadingMixes(true);
      // Временные тестовые данные
      // После деплоя backend раскомментируйте fetch запрос ниже
      const mockMixes = [
        {
          id: 1,
          user_username: telegramUsername,
          currency: 'BTC',
          amount: '0.5',
          fee: '13%',
          delay: '5-20 min',
          minimum: '0.0015 BTC',
          preset: 'Fast Mix',
          input_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          output_address: '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy',
          deposit_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          status: 'В процессе',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          user_username: telegramUsername,
          currency: 'ETH',
          amount: '2.3',
          fee: '17%',
          delay: '20-60 min',
          minimum: '0.03 ETH',
          preset: 'Standard Mix',
          input_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          output_address: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
          deposit_address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          status: 'Принят в работу',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 43200000).toISOString()
        },
        {
          id: 3,
          user_username: telegramUsername,
          currency: 'USDT-TRC20',
          amount: '1500',
          fee: '23%',
          delay: '1-4 hours',
          minimum: '100 USDT',
          preset: 'Privacy Mix',
          input_address: 'TRxJ4vKWLVg8KnNP3BdUNJTNTJNTwXLR5h',
          output_address: 'TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS',
          deposit_address: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
          status: 'Отправлено',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 4,
          user_username: telegramUsername,
          currency: 'BTC',
          amount: '1.2',
          fee: '13%',
          delay: '5-20 min',
          minimum: '0.0015 BTC',
          preset: 'Fast Mix',
          input_address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
          output_address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
          deposit_address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
          status: 'Готово!',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      
      setTimeout(() => {
        setMixes(mockMixes);
        setIsLoadingMixes(false);
      }, 500);

      /* РАСКОММЕНТИРУЙТЕ ПОСЛЕ ДЕПЛОЯ BACKEND:
      fetch('YOUR_BACKEND_URL/get-mixes', {
        headers: {
          'X-User-Username': telegramUsername
        }
      })
        .then(res => res.json())
        .then(data => {
          setMixes(data.mixes || []);
          setIsLoadingMixes(false);
        })
        .catch(err => {
          console.error('Error fetching mixes:', err);
          setMixes([]);
          setIsLoadingMixes(false);
        });
      */
    }
  }, [isAuthenticated, activeTab, telegramUsername]);

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
      <aside className="w-[360px] h-screen flex-shrink-0 border-r border-border/50 flex flex-col">
        <div className="px-6 py-6 border-b border-border/50 h-[73px] flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.2_25)]" />
              <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_85)]" />
              <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.18_150)]" />
            </div>
            <span className="text-sm text-muted-foreground ml-2">explorer</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <FileTree
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            data={fileTreeData}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border/50">
          <div className="px-8 py-6 flex items-center justify-between h-[73px]">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MIXER
            </h1>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3">
                      <AvatarWithName
                        name={telegramUsername}
                        fallback={telegramUsername.slice(1, 3).toUpperCase()}
                        size="sm"
                        direction="left"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setActiveTab('my-mixes')}>
                      Мои миксы
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('faq')}>
                      FAQ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
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
            <div className="mb-12 flex justify-start">
              <div className="inline-flex h-11 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-0.5 shadow-md border border-blue-100 overflow-hidden">
                <RadioGroup
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="group relative inline-grid grid-cols-[1fr_1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/3 after:rounded-md after:bg-gradient-to-br after:from-blue-500 after:to-blue-600 after:shadow-[0_0_6px_rgba(59,130,246,0.4),0_2px_8px_rgba(59,130,246,0.3),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.2),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.3),inset_0_0_12px_6px_rgba(59,130,246,0.15)] after:transition-all after:duration-500 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=mixer]:after:translate-x-0 data-[state=my-mixes]:after:translate-x-full data-[state=faq]:after:translate-x-[200%]"
                  data-state={activeTab}
                >
                  <div
                    className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md pointer-events-none"
                    style={{ filter: 'url("#radio-glass")' }}
                  />
                  <label className="relative z-10 inline-flex h-full min-w-[100px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-gray-600 group-data-[state=my-mixes]:text-gray-600 group-data-[state=faq]:text-gray-600 group-data-[state=mixer]:text-white group-data-[state=mixer]:font-semibold">
                    Mixer
                    <RadioGroupItem id="tab-mixer" value="mixer" className="sr-only" />
                  </label>
                  <label className="relative z-10 inline-flex h-full min-w-[100px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-gray-600 group-data-[state=mixer]:text-gray-600 group-data-[state=faq]:text-gray-600 group-data-[state=my-mixes]:text-white group-data-[state=my-mixes]:font-semibold">
                    Мои миксы
                    <RadioGroupItem id="tab-my-mixes" value="my-mixes" className="sr-only" />
                  </label>
                  <label className="relative z-10 inline-flex h-full min-w-[100px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors text-gray-600 group-data-[state=mixer]:text-gray-600 group-data-[state=my-mixes]:text-gray-600 group-data-[state=faq]:text-white group-data-[state=faq]:font-semibold">
                    FAQ
                    <RadioGroupItem id="tab-faq" value="faq" className="sr-only" />
                  </label>
                  <GlassFilter />
                </RadioGroup>
              </div>
            </div>

            <TabsContent value="mixer" className="animate-fade-in">
              <div className="max-w-4xl">
                {showMixConfirmation ? (
                  <Card className="border-2 border-gray-300 bg-white shadow-sm">
                    <CardHeader className="border-b-2 border-gray-300">
                      <CardTitle className="text-xl font-medium text-black tracking-tight">Deposit Address</CardTitle>
                      <p className="text-gray-600 mt-1 text-sm">
                        Transfer funds to initialize mixing protocol
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="p-6 bg-neutral-100 rounded-none border-2 border-gray-300">
                        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Target Wallet</h3>
                        <div className="bg-white p-4 rounded-none border-2 border-gray-400 font-mono text-sm break-all text-black">
                          {depositAddress}
                        </div>
                        <Button 
                          onClick={() => navigator.clipboard.writeText(depositAddress)}
                          className="w-full mt-4 bg-black hover:bg-gray-800 text-white h-11 rounded-none font-semibold text-xs uppercase tracking-wider transition-all"
                        >
                          Copy Address
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Parameters</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-neutral-100 rounded-none border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Currency</p>
                            <p className="text-base font-mono text-black font-medium">{mixerData.currency}</p>
                          </div>
                          <div className="p-4 bg-neutral-100 rounded-none border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Amount</p>
                            <p className="text-base font-mono text-black font-medium">{mixerData.amount} {mixerData.currency}</p>
                          </div>
                          <div className="p-4 bg-neutral-100 rounded-none border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Fee</p>
                            <p className="text-base font-mono text-black font-medium">{mixerData.fee}</p>
                          </div>
                          <div className="p-4 bg-neutral-100 rounded-none border-2 border-gray-300">
                            <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Delay</p>
                            <p className="text-base font-mono text-black font-medium">{mixerData.delay}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-neutral-100 rounded-none border-2 border-gray-300">
                          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase">Input Address</p>
                          <p className="font-mono text-xs break-all text-gray-700">{mixerData.inputAddress}</p>
                        </div>

                        <div className="p-4 bg-neutral-100 rounded-none border-2 border-gray-300">
                          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase">Output Address</p>
                          <p className="font-mono text-xs break-all text-gray-700">{mixerData.outputAddress}</p>
                        </div>

                        <div className="p-4 bg-neutral-100 rounded-none border-2 border-gray-300">
                          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase">Profile</p>
                          <p className="font-mono text-sm text-black font-medium">{selectedFile}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-200 border-2 border-gray-400 rounded-none">
                        <p className="text-xs text-gray-800 font-medium">
                          ⚠ CRITICAL: Transfer exact amount <strong className="text-black font-semibold">{mixerData.amount} {mixerData.currency}</strong> to address above. 
                          Protocol initializes after {mixerData.delay}.
                        </p>
                      </div>

                      <Button 
                        onClick={() => {
                          setShowMixConfirmation(false);
                          setMixerData(prev => ({
                            ...prev,
                            inputAddress: '',
                            outputAddress: '',
                            amount: '',
                          }));
                          setOriginalMixerData({
                            inputAddress: '',
                            outputAddress: '',
                            amount: '',
                          });
                          setShowUnsavePopup(false);
                          setShouldBlockNav(false);
                        }}
                        className="w-full h-11 bg-white hover:bg-gray-100 text-black border-2 border-gray-400 rounded-none font-semibold text-xs uppercase tracking-wider transition-all"
                      >
                        New Protocol
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 border-gray-300 bg-white shadow-sm">
                    <CardHeader className="border-b-2 border-gray-300">
                      <CardTitle className="text-xl font-medium text-black tracking-tight">Mixer Protocol</CardTitle>
                      <p className="text-gray-600 mt-1 text-sm">
                        {selectedFile ? `Active: ${selectedFile}` : 'Select profile from explorer'}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {mixerData.description ? (
                      <div className="space-y-4">
                        <div className="p-6 bg-neutral-100 rounded-none border-2 border-gray-300">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                            {mixerData.description}
                          </pre>
                        </div>
                        <Button 
                          onClick={() => setMixerData(prev => ({ ...prev, description: '' }))}
                          className="w-full h-11 bg-white hover:bg-gray-100 text-black border-2 border-gray-400 rounded-none font-semibold text-xs uppercase tracking-wider transition-all"
                        >
                          Return to Protocol
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleMixerSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Currency</label>
                            <Input value={mixerData.currency} disabled className="bg-neutral-100 border-2 border-gray-300 text-black font-mono rounded-none h-11" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Fee</label>
                            <Input value={mixerData.fee} disabled className="bg-neutral-100 border-2 border-gray-300 text-black font-mono rounded-none h-11" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Delay</label>
                            <Input value={mixerData.delay} disabled className="bg-neutral-100 border-2 border-gray-300 text-black font-mono rounded-none h-11" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Minimum</label>
                            <Input value={mixerData.minimum} disabled className="bg-neutral-100 border-2 border-gray-300 text-black font-mono rounded-none h-11" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Input Address</label>
                          <Input
                            placeholder="0x..."
                            value={mixerData.inputAddress}
                            onChange={(e) => handleMixerDataChange('inputAddress', e.target.value)}
                            className="bg-white border-2 border-gray-400 text-black font-mono placeholder:text-gray-400 rounded-none h-11"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Output Address</label>
                          <Input
                            placeholder="0x..."
                            value={mixerData.outputAddress}
                            onChange={(e) => handleMixerDataChange('outputAddress', e.target.value)}
                            className="bg-white border-2 border-gray-400 text-black font-mono placeholder:text-gray-400 rounded-none h-11"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Amount</label>
                          <Input
                            type="number"
                            step="0.00000001"
                            placeholder="0.00000000"
                            value={mixerData.amount}
                            onChange={(e) => handleMixerDataChange('amount', e.target.value)}
                            className="bg-white border-2 border-gray-400 text-black font-mono placeholder:text-gray-400 rounded-none h-11"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-11 text-xs font-semibold bg-black hover:bg-gray-800 text-white rounded-none uppercase tracking-wider transition-all" 
                          disabled={!selectedFile || !mixerData.inputAddress || !mixerData.outputAddress || !mixerData.amount}
                        >
                          Initialize Mixing
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-mixes" className="animate-fade-in">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Мои миксы</h2>
                  <p className="text-gray-600 mt-2">
                    История всех ваших транзакций микширования
                  </p>
                </div>
                {isLoadingMixes ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <MixesTable mixes={mixes} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="animate-fade-in">
              <div className="max-w-6xl mx-auto space-y-8">
                <Card className="border-2">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Как пользоваться платформой</CardTitle>
                    <p className="text-gray-600 mt-2">
                      Подробное руководство по созданию микса • Страница {tutorialPage} из 3
                    </p>
                  </CardHeader>
                  <CardContent>
                    {tutorialPage === 1 && (
                    <div className="space-y-8">
                        <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">1</div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-2 text-gray-900">Авторизация</h3>
                              <div className="flex items-center gap-2 text-gray-500">
                                <Lock size={18} strokeWidth={1.5} />
                                <span className="text-sm uppercase tracking-wide">Security Step</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-16">
                            <p className="text-gray-600 mb-6 text-base leading-relaxed">
                              Нажмите кнопку "Login with Telegram" в правом верхнем углу
                            </p>
                            <div className="bg-gray-50 p-5 rounded border border-gray-300">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">1</div>
                                  <span className="text-gray-600 text-sm">Введите ваш Telegram username (например: @username)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">2</div>
                                  <span className="text-gray-600 text-sm">Получите 4-значный код в боте</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">3</div>
                                  <span className="text-gray-600 text-sm">Введите код для входа</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">2</div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-2 text-gray-900">Выбор профиля микса</h3>
                              <div className="flex items-center gap-2 text-gray-500">
                                <FolderTree size={18} strokeWidth={1.5} />
                                <span className="text-sm uppercase tracking-wide">Configuration</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-16">
                            <p className="text-gray-600 mb-6 text-base leading-relaxed">
                              В левой панели выберите криптовалюту и тип микширования
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><Zap size={16} /> Fast Mix</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><DollarSign size={12} /> Комиссия: 13%</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><Timer size={12} /> Время: 5-20 мин</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><Scale size={16} /> Standard Mix</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><DollarSign size={12} /> Комиссия: 17%</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><Timer size={12} /> Время: 20-60 мин</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><Lock size={16} /> Privacy Mix</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><DollarSign size={12} /> Комиссия: 23%</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><Timer size={12} /> Время: 1-4 часа</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><Package size={16} /> Bulk Mix</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><DollarSign size={12} /> Комиссия: 30%</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><Timer size={12} /> Время: 6-12 часов</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">3</div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-2 text-gray-900">Заполнение данных</h3>
                              <div className="flex items-center gap-2 text-gray-500">
                                <FileEdit size={18} strokeWidth={1.5} />
                                <span className="text-sm uppercase tracking-wide">Input Required</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-16">
                            <p className="text-gray-600 mb-6 text-base leading-relaxed">
                              Укажите адреса кошельков и сумму транзакции
                            </p>
                            <div className="bg-gray-50 p-5 rounded border border-gray-300 space-y-5">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0"><ArrowDownToLine size={20} strokeWidth={1.5} className="text-gray-700" /></div>
                                <div>
                                  <div className="font-semibold text-gray-800 text-base">Input Address</div>
                                  <div className="text-sm text-gray-600">Адрес вашего кошелька, с которого отправляете</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0"><ArrowUpFromLine size={20} strokeWidth={1.5} className="text-gray-700" /></div>
                                <div>
                                  <div className="font-semibold text-gray-800 text-base">Output Address</div>
                                  <div className="text-sm text-gray-600">Адрес, на который получите чистые монеты</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0"><DollarSign size={20} strokeWidth={1.5} className="text-gray-700" /></div>
                                <div>
                                  <div className="font-semibold text-gray-800 text-base">Amount</div>
                                  <div className="text-sm text-gray-600">Сумма для микширования</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">4</div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-2 text-gray-900">Отправка криптовалюты</h3>
                              <div className="flex items-center gap-2 text-gray-500">
                                <Send size={18} strokeWidth={1.5} />
                                <span className="text-sm uppercase tracking-wide">Transaction</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-16">
                            <p className="text-gray-600 mb-6 text-base leading-relaxed">
                              После нажатия "Start Mixing" вы получите адрес для депозита
                            </p>
                            <div className="bg-gray-50 p-5 rounded border border-gray-300">
                              <div className="space-y-3">
                                <div className="font-semibold text-gray-800 text-base flex items-center gap-2"><AlertTriangle size={16} /> Важно:</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><span className="text-gray-400">•</span> Отправьте ТОЧНУЮ сумму на указанный адрес</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><span className="text-gray-400">•</span> Используйте кнопку "Copy Address" для копирования</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2"><span className="text-gray-400">•</span> Сохраните адрес депозита до завершения транзакции</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">5</div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-2 text-gray-900">Отслеживание статуса</h3>
                              <div className="flex items-center gap-2 text-gray-500">
                                <BarChart3 size={18} strokeWidth={1.5} />
                                <span className="text-sm uppercase tracking-wide">Monitoring</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-16">
                            <p className="text-gray-600 mb-6 text-base leading-relaxed">
                              Перейдите в раздел "Мои миксы" для просмотра статуса
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><Clock size={16} /> В процессе</div>
                                <div className="text-sm text-gray-600">Микс создан, ожидает депозита</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><RefreshCw size={16} /> Принят в работу</div>
                                <div className="text-sm text-gray-600">Средства получены, начато микширование</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><Send size={16} /> Отправлено</div>
                                <div className="text-sm text-gray-600">Средства отправлены на выходной адрес</div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2 text-base flex items-center gap-2"><CheckCircle2 size={16} /> Готово!</div>
                                <div className="text-sm text-gray-600">Транзакция успешно завершена</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {tutorialPage === 2 && (
                    <div className="space-y-8">
                      {/* Step 6 - Copy Address */}
                      <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">6</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Копирование адреса депозита</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <Copy className="w-4 h-4 text-gray-600" />
                              <span className="uppercase tracking-wide text-gray-600">ADDRESS RETRIEVAL</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-gray-700 mb-6">После подтверждения микса вы увидите уникальный адрес для отправки криптовалюты</p>
                          <div className="bg-gray-50 p-6 rounded border border-gray-300 space-y-4">
                            <div className="bg-white p-4 rounded border border-gray-300 font-mono text-sm break-all">
                              BTCMix7x8k9m2p4q@user
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                <span className="text-gray-600">Нажмите кнопку "Copy Address" для копирования</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                <span className="text-gray-600">Сохраните адрес в надёжном месте</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                <span className="text-gray-600">Не закрывайте страницу до отправки средств</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 7 - Open Wallet */}
                      <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">7</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Открытие криптокошелька</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <Wallet className="w-4 h-4 text-gray-600" />
                              <span className="uppercase tracking-wide text-gray-600">WALLET ACCESS</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-gray-700 mb-6">Откройте ваш криптокошелёк для отправки средств</p>
                          <div className="bg-gray-50 p-6 rounded border border-gray-300">
                            <div className="space-y-3">
                              <div className="p-4 bg-white rounded border border-gray-300">
                                <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Briefcase size={18} /> Поддерживаемые кошельки:</div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div>• Trust Wallet</div>
                                  <div>• MetaMask</div>
                                  <div>• Exodus</div>
                                  <div>• Ledger</div>
                                  <div>• Coinbase Wallet</div>
                                  <div>• Binance</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded border border-gray-300">
                                <AlertTriangle size={16} className="inline mr-2" /> Убедитесь, что выбрана правильная сеть (например, BTC mainnet, ERC20, BEP20)</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 8 - Send Funds */}
                      <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">8</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Отправка точной суммы</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <Send className="w-4 h-4 text-gray-600" />
                              <span className="uppercase tracking-wide text-gray-600">TRANSACTION INITIATION</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-gray-700 mb-6">Отправьте ТОЧНУЮ сумму, указанную в форме микса</p>
                          <div className="bg-gray-50 p-6 rounded border border-gray-300 space-y-4">
                            <div className="font-semibold text-gray-800 text-base flex items-center gap-2"><AlertTriangle size={20} /> КРИТИЧЕСКИ ВАЖНО:</div>
                            <div className="space-y-2">
                              <div className="p-3 bg-white rounded">
                                <span className="font-semibold flex items-center gap-2"><X size={16} className="text-gray-600" /> НЕ отправляйте меньше:</span> Транзакция не будет обработана
                              </div>
                              <div className="p-3 bg-white rounded">
                                <span className="font-semibold flex items-center gap-2"><X size={16} className="text-gray-600" /> НЕ отправляйте больше:</span> Излишек будет потерян
                              </div>
                              <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                <span className="font-semibold flex items-center gap-2"><Check size={16} className="text-gray-600" /> Отправьте ТОЧНО:</span> Указанную сумму с учётом комиссии сети
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              <Lightbulb size={16} className="inline mr-2" /> Совет: Учитывайте комиссию блокчейна отдельно от суммы микса
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 9 - Confirmation */}
                      <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">9</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Подтверждение транзакции</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-gray-600" />
                              <span className="uppercase tracking-wide text-gray-600">BLOCKCHAIN VERIFICATION</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-gray-700 mb-6">Подтвердите отправку средств в вашем кошельке</p>
                          <div className="bg-gray-50 p-6 rounded border border-gray-300">
                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded border border-gray-300">
                                <div className="font-semibold text-gray-800 mb-3">Проверьте перед отправкой:</div>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs flex-shrink-0">1</div>
                                    <span className="text-sm text-gray-600">Адрес получателя совпадает с адресом депозита</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs flex-shrink-0">2</div>
                                    <span className="text-sm text-gray-600">Сумма соответствует указанной в форме</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs flex-shrink-0">3</div>
                                    <span className="text-sm text-gray-600">Выбрана правильная сеть блокчейна</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-xs flex-shrink-0">4</div>
                                    <span className="text-sm text-gray-600">Баланс достаточен для оплаты комиссии сети</span>
                                  </div>
                                </div>
                              </div>
                              <Button className="w-full h-12 bg-gray-800 hover:bg-gray-900">
                                Подтвердить отправку
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                    )}

                    {tutorialPage === 3 && (
                    <div className="space-y-8">
                      {/* Step 10 - Monitor Progress */}
                      <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">10</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Переход в "Мои миксы"</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <BarChart3 className="w-4 h-4 text-gray-600" />
                              <span className="uppercase tracking-wide text-gray-600">REAL-TIME TRACKING</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-gray-700 mb-6">После отправки средств откройте раздел "Мои миксы" для отслеживания</p>
                          <div className="bg-gray-50 p-6 rounded border border-gray-300 space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center"><User size={24} strokeWidth={1.5} /></div>
                              <div className="text-gray-600">
                                <div className="font-semibold">Нажмите на иконку профиля</div>
                                <div className="text-sm">В правом верхнем углу экрана</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center"><ClipboardList size={24} strokeWidth={1.5} /></div>
                              <div className="text-gray-600">
                                <div className="font-semibold">Выберите "Мои миксы"</div>
                                <div className="text-sm">Из выпадающего меню</div>
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded border border-gray-300">
                              <div className="text-sm text-gray-600">
                                <Lightbulb size={16} className="inline mr-2" /> Также можно использовать вкладку "Мои миксы" в верхнем меню
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 11 - View Status */}
                      <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">11</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Просмотр статусов миксов</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-600" />
                              <span className="uppercase tracking-wide text-gray-600">MIXING IN PROGRESS</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-gray-700 mb-6">В таблице отображаются все ваши миксы с актуальными статусами</p>
                          <div className="bg-gray-50 p-6 rounded border border-gray-300">
                            <div className="bg-white rounded border border-gray-300 overflow-hidden">
                              <div className="grid grid-cols-7 gap-2 p-3 bg-gray-100 font-semibold text-sm">
                                <div>ID</div>
                                <div>Дата</div>
                                <div>Валюта</div>
                                <div>Сумма</div>
                                <div>Статус</div>
                                <div className="col-span-2">Адреса</div>
                              </div>
                              <div className="p-3 border-t text-sm space-y-2">
                                <div className="grid grid-cols-7 gap-2 items-center">
                                  <div className="font-mono">#001</div>
                                  <div className="text-gray-600">15.01</div>
                                  <div>BTC</div>
                                  <div className="font-semibold">0.5</div>
                                  <div><span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">⏳ В процессе</span></div>
                                  <div className="col-span-2 text-xs text-gray-500 truncate">1A1z...eP5Q → 3J98...wUt2d</div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600 space-y-2">
                              <div className="flex items-center gap-2"><BarChart3 size={16} /> <strong>ID</strong> — уникальный номер микса</div>
                              <div className="flex items-center gap-2"><Clock size={16} /> <strong>Дата</strong> — когда был создан</div>
                              <div className="flex items-center gap-2"><CheckCircle2 size={16} /> <strong>Статус</strong> — текущий этап обработки</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 12 - Wait for Processing */}
                      <div className="border-l-4 border-gray-900 pl-6 py-4 bg-white">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">12</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Ожидание обработки</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <RefreshCw className="w-4 h-4 text-gray-600" />
                              <span className="uppercase tracking-wide text-gray-600">FINAL DELIVERY</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-gray-700 mb-6">Микс проходит несколько стадий обработки — следите за изменением статуса</p>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded border border-gray-300">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">1</div>
                                <div className="font-semibold text-gray-800 flex items-center gap-2"><Clock size={18} /> В процессе</div>
                              </div>
                              <div className="text-sm text-gray-600 ml-11">
                                Ожидание поступления средств на адрес депозита. Обычно 10-30 минут в зависимости от сети.
                                </div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded border border-gray-300">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">2</div>
                                  <div className="font-semibold text-gray-800 flex items-center gap-2"><RefreshCw size={18} /> Принят в работу</div>
                                </div>
                                <div className="text-sm text-gray-600 ml-11">
                                  Средства получены, начался процесс микширования. Время зависит от выбранного профиля.
                                </div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded border border-gray-300">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">3</div>
                                  <div className="font-semibold text-gray-800 flex items-center gap-2"><Send size={18} /> Отправлено</div>
                                </div>
                                <div className="text-sm text-gray-600 ml-11">
                                  Микшированные средства отправлены на ваш выходной адрес. Ожидайте подтверждений в сети.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 13 - Final Step - Keep special green gradient styling */}
                      <div className="flex gap-6 relative">
                          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white flex items-center justify-center shadow-lg z-10">
                            <Shield size={48} strokeWidth={2} />
                          </div>
                          <div className="flex-1 pt-2">
                            <h3 className="text-2xl font-bold mb-3">Получение чистых монет</h3>
                            <p className="text-gray-700 mb-4 text-lg">
                              После завершения вы получите статус "Готово!" и средства на выходном адресе
                            </p>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-300 space-y-4">
                              <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg border-2 border-green-400">
                                <CheckCircle2 size={60} className="text-green-600" strokeWidth={2} />
                                <div>
                                  <div className="text-2xl font-bold text-green-900">Готово!</div>
                                  <div className="text-gray-700">Транзакция успешно завершена</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg">
                                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2"><RefreshCw size={16} /> Что произошло:</div>
                                  <div className="text-sm text-gray-700">
                                    Ваши монеты прошли через несколько раундов микширования с монетами других пользователей, полностью скрыв связь между входным и выходным адресами.
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2"><Shield size={16} /> Безопасность:</div>
                                  <div className="text-sm text-gray-700">
                                    Все данные о транзакции удалены с наших серверов. Отследить происхождение средств теперь невозможно.
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2"><Wallet size={16} /> Проверьте кошелёк:</div>
                                  <div className="text-sm text-gray-700">
                                    Откройте ваш кошелёк и убедитесь, что средства поступили на указанный выходной адрес.
                                  </div>
                                </div>
                              </div>
                              <div className="text-center pt-4">
                                <Button className="bg-green-600 hover:bg-green-700 h-12 px-8">
                                  Создать новый микс
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    )}

                    <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                      <div className="bg-white p-8 rounded-xl">
                        <ProgressIndicator step={tutorialPage} onStepChange={setTutorialPage} />
                      </div>
                      <p className="text-center text-gray-700 mt-4 font-medium">
                        Используйте переключатель для навигации между страницами обучения
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

      <UnsavePopup
        onSave={handleSaveForm}
        onReset={handleResetForm}
        shouldBlockFn={shouldBlockFn}
        show={showUnsavePopup}
      >
        <Info className="h-4 w-4" /> Вы изменили данные формы. Сохранить изменения?
      </UnsavePopup>
    </div>
  );
};

export default Index;