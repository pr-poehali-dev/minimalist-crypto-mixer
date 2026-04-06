import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReferralCodeData {
  code: string;
  total_referrals: number;
  total_earned: number;
  balance: number;
}

interface ReferralCodeCardProps {
  referralCode: ReferralCodeData | null;
  balance: number;
  isLoading: boolean;
  applyCode: string;
  setApplyCode: (v: string) => void;
  onApplyCode: () => Promise<void>;
  isApplying: boolean;
  applyMessage: string;
  applyError: string;
}

const ReferralCodeCard = ({
  referralCode,
  balance,
  isLoading,
  applyCode,
  setApplyCode,
  onApplyCode,
  isApplying,
  applyMessage,
  applyError,
}: ReferralCodeCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showApply, setShowApply] = useState(false);

  const handleCopy = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stats = [
    { icon: 'Users', label: 'Рефералы', value: referralCode?.total_referrals ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: 'TrendingUp', label: 'Заработано', value: `$${(referralCode?.total_earned ?? 0).toFixed(2)}`, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: 'Wallet', label: 'Баланс', value: `$${balance.toFixed(2)}`, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-4 md:p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Ваш реферальный код</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg md:text-xl font-bold text-gray-800 tracking-widest text-center select-all">
              {referralCode?.code || '—'}
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="h-12 px-4 border-gray-200 shrink-0"
            >
              <Icon name={copied ? 'Check' : 'Copy'} size={18} className={copied ? 'text-green-500' : ''} />
            </Button>
          </div>
          {copied && <p className="text-xs text-green-600 mt-2 text-center">Скопировано</p>}
        </div>

        <div className="grid grid-cols-3 border-t border-gray-100">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`p-3 md:p-4 text-center ${i > 0 ? 'border-l border-gray-100' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon name={s.icon} size={16} className={s.color} />
              </div>
              <p className="text-base md:text-lg font-bold text-gray-800">{s.value}</p>
              <p className="text-[10px] md:text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
        <button
          onClick={() => setShowApply(!showApply)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Icon name="Ticket" size={16} className="text-orange-500" />
            </div>
            <span className="text-sm font-medium text-gray-700">У вас есть промокод?</span>
          </div>
          <Icon name={showApply ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400" />
        </button>

        {showApply && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                value={applyCode}
                onChange={e => setApplyCode(e.target.value.toUpperCase())}
                placeholder="Введите код"
                className="font-mono tracking-wider uppercase"
              />
              <Button
                onClick={onApplyCode}
                disabled={isApplying || !applyCode.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 px-6"
              >
                {isApplying ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : 'Применить'}
              </Button>
            </div>
            {applyMessage && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2.5 rounded-lg">
                <Icon name="CheckCircle" size={16} />
                {applyMessage}
              </div>
            )}
            {applyError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">
                <Icon name="AlertCircle" size={16} />
                {applyError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralCodeCard;
