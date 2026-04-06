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

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Icon name="Link" size={18} className="text-white md:hidden" />
            <Icon name="Link" size={22} className="text-white hidden md:block" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm md:text-lg">Ваш реферальный код</p>
            <p className="text-[10px] md:text-xs text-gray-500">Поделитесь кодом с друзьями</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Icon name="Loader2" size={24} className="text-gray-400 animate-spin" />
          </div>
        ) : referralCode ? (
          <>
            <div className="flex items-center gap-3 mb-5 md:mb-8">
              <div className="flex-1 bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl px-4 md:px-6 py-3 md:py-4 text-center">
                <span className="text-2xl md:text-4xl font-mono font-bold tracking-[0.2em] text-gray-800">
                  {referralCode.code}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 md:h-14 md:w-14 rounded-lg md:rounded-xl flex-shrink-0"
                onClick={handleCopyCode}
              >
                <Icon name={copied ? 'Check' : 'Copy'} size={20} className={copied ? 'text-green-600' : 'text-gray-600'} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-5 text-center">
                <p className="text-lg md:text-2xl font-bold text-gray-800">{referralCode.total_referrals}</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Рефералов</p>
              </div>
              <div className="bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-5 text-center">
                <p className="text-lg md:text-2xl font-bold text-gray-800">${referralCode.total_earned.toFixed(2)}</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Заработано</p>
              </div>
              <div className="bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-5 text-center">
                <p className="text-lg md:text-2xl font-bold text-green-600">${balance.toFixed(2)}</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Баланс</p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <Icon name="UserPlus" size={18} className="text-white md:hidden" />
            <Icon name="UserPlus" size={22} className="text-white hidden md:block" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm md:text-lg">Введите реферальный код</p>
            <p className="text-[10px] md:text-xs text-gray-500">Если вас пригласил друг</p>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <Input
            value={applyCode}
            onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
            placeholder="Например: AB12CD"
            maxLength={6}
            className="flex-1 font-mono tracking-wider uppercase"
          />
          <Button
            onClick={onApplyCode}
            disabled={isApplying || !applyCode.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 md:px-6"
          >
            {isApplying ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              'Применить'
            )}
          </Button>
        </div>

        {applyMessage && (
          <div className="mt-3 flex items-center gap-2 text-green-600 text-xs md:text-sm">
            <Icon name="CheckCircle" size={14} />
            <span>{applyMessage}</span>
          </div>
        )}
        {applyError && (
          <div className="mt-3 flex items-center gap-2 text-red-500 text-xs md:text-sm">
            <Icon name="AlertCircle" size={14} />
            <span>{applyError}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ReferralCodeCard;
