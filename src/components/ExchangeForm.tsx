import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { getCoinInfo, isFiat } from '@/lib/coins';
import CurrencySelector from '@/components/CurrencySelector';

const CITIES: Record<string, string[]> = {
  'Россия': ['Москва', 'Ростов-на-Дону', 'Краснодар', 'Новороссийск'],
  'Швейцария': ['Цюрих', 'Женева', 'Люцерн', 'Берн'],
  'Германия': ['Берлин', 'Мюнхен', 'Франкфурт', 'Кёльн'],
};

interface ExchangeFormProps {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  outputAddress: string;
  rates: Record<string, number>;
  currentRate: number;
  isLoadingRates: boolean;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  hasReferralDiscount: boolean;
  showFromDropdown: boolean;
  showToDropdown: boolean;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  setShowFromDropdown: (v: boolean) => void;
  setShowToDropdown: (v: boolean) => void;
  setOutputAddress: (v: string) => void;
  onFromAmountChange: (v: string) => void;
  onToAmountChange: (v: string) => void;
  onSwapCurrencies: () => void;
  onSelectFromCurrency: (coin: string) => void;
  onSelectToCurrency: (coin: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ExchangeForm = ({
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  outputAddress,
  rates,
  currentRate,
  isLoadingRates,
  isSubmitting,
  isAuthenticated,
  hasReferralDiscount,
  showFromDropdown,
  showToDropdown,
  selectedCity,
  setSelectedCity,
  setShowFromDropdown,
  setShowToDropdown,
  setOutputAddress,
  onFromAmountChange,
  onToAmountChange,
  onSwapCurrencies,
  onSelectFromCurrency,
  onSelectToCurrency,
  onSubmit,
}: ExchangeFormProps) => {
  const fromInfo = getCoinInfo(fromCurrency);
  const toInfo = getCoinInfo(toCurrency);
  const isCashExchange = isFiat(fromCurrency) || isFiat(toCurrency);
  const receivingCash = isFiat(toCurrency);
  const needsAddress = !receivingCash;

  const formatRate = (value: number) => {
    if (value >= 1000) return value.toFixed(2);
    if (value >= 1) return value.toFixed(4);
    return value.toFixed(6);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Мгновенный обмен криптовалют</h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Быстро, анонимно, без регистрации</p>
      </div>

      {hasReferralDiscount && (
        <div className="mb-4 relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Icon name="Percent" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm md:text-base">Скидка 1% на этот обмен</p>
              <p className="text-green-600 text-xs md:text-sm">Активирована по реферальному коду — действует на первый обмен</p>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-1 bg-green-100 text-green-700 font-bold text-lg px-4 py-1.5 rounded-lg">
              <span>−1%</span>
            </div>
          </div>
        </div>
      )}

      <Card className="border border-gray-200 md:border-2 md:border-gray-300 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200 md:border-b-2 md:border-gray-300 px-4 py-4 md:px-6 md:py-6">
          <CardTitle className="text-lg md:text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
            <Icon name="ArrowLeftRight" size={18} className="md:hidden" />
            <Icon name="ArrowLeftRight" size={20} className="hidden md:block" />
            {isCashExchange ? 'Обмен наличных' : 'Обмен криптовалюты'}
          </CardTitle>
          <p className="text-gray-600 mt-1 text-xs md:text-sm">
            {isLoadingRates ? 'Загрузка курсов...' : hasReferralDiscount ? 'Курсы обновляются каждые 30 сек · скидка 1% применена' : 'Курсы обновляются каждые 30 сек'}
          </p>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="flex flex-col md:flex-row items-stretch md:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: fromInfo.color }}>Отправляете</label>
                  <span className="text-xs" style={{ color: fromInfo.color }}>{fromInfo.name}{fromInfo.network && fromInfo.network !== 'Cash' ? ` (${fromInfo.network})` : ''}</span>
                </div>
                <div className="flex items-center border border-gray-200 bg-neutral-50 h-12 rounded-lg transition-colors" style={{ borderColor: fromInfo.color + '25' }}>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => onFromAmountChange(e.target.value)}
                    className="border-0 bg-transparent text-gray-800 font-mono placeholder:text-gray-400 h-full text-lg font-semibold shadow-none focus-visible:ring-0 rounded-lg"
                  />
                  <CurrencySelector
                    selected={fromCurrency}
                    isOpen={showFromDropdown}
                    setIsOpen={(v) => { setShowFromDropdown(v); setShowToDropdown(false); }}
                    onSelect={onSelectFromCurrency}
                    rates={rates}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <span className="text-[11px] font-mono">
                    {currentRate > 0 && (
                      <span style={{ color: fromInfo.color }}>
                        1 {fromInfo.rateKey} = {formatRate(currentRate)} {toInfo.rateKey}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: fromInfo.color + 'AA' }}>
                    {fromAmount && rates[fromInfo.rateKey] ? `$${(Number(fromAmount) * rates[fromInfo.rateKey]).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center md:pt-8">
                <motion.button
                  type="button"
                  onClick={onSwapCurrencies}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:bg-neutral-50 hover:border-gray-400 transition-all"
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Icon name="ArrowUpDown" size={16} className="text-gray-600 md:hidden" />
                  <Icon name="ArrowLeftRight" size={16} className="text-gray-600 hidden md:block" />
                </motion.button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: toInfo.color }}>Получаете</label>
                  <span className="text-xs" style={{ color: toInfo.color }}>{toInfo.name}{toInfo.network && toInfo.network !== 'Cash' ? ` (${toInfo.network})` : ''}</span>
                </div>
                <div className="flex items-center border border-gray-200 bg-neutral-50 h-12 rounded-lg transition-colors" style={{ borderColor: toInfo.color + '25' }}>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => onToAmountChange(e.target.value)}
                    className="border-0 bg-transparent text-gray-800 font-mono placeholder:text-gray-400 h-full text-lg font-semibold shadow-none focus-visible:ring-0 rounded-lg"
                  />
                  <CurrencySelector
                    selected={toCurrency}
                    isOpen={showToDropdown}
                    setIsOpen={(v) => { setShowToDropdown(v); setShowFromDropdown(false); }}
                    onSelect={onSelectToCurrency}
                    rates={rates}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <span className="text-[11px] font-mono">
                    {currentRate > 0 && (
                      <span style={{ color: toInfo.color }}>
                        1 {toInfo.rateKey} = {formatRate(1 / currentRate)} {fromInfo.rateKey}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: toInfo.color + 'AA' }}>
                    {toAmount && rates[toInfo.rateKey] ? `$${(Number(toAmount) * rates[toInfo.rateKey]).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {isCashExchange && (
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Город встречи</label>
                <div className="space-y-2">
                  {Object.entries(CITIES).map(([country, cities]) => (
                    <div key={country}>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">{country}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cities.map(city => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => setSelectedCity(city)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                              selectedCity === city
                                ? 'bg-blue-500 text-white border-blue-500 font-semibold'
                                : 'bg-neutral-50 text-gray-700 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {needsAddress && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Адрес получения</label>
                  <span className="text-xs text-gray-400">{toInfo.name}{toInfo.network && toInfo.network !== 'Cash' ? ` (${toInfo.network})` : ''}</span>
                </div>
                <Input
                  placeholder={`Ваш ${toInfo.name}${toInfo.network && toInfo.network !== 'Cash' ? ` (${toInfo.network})` : ''} адрес`}
                  value={outputAddress}
                  onChange={(e) => setOutputAddress(e.target.value)}
                  className="bg-neutral-50 border-2 border-gray-300 text-gray-800 font-mono placeholder:text-gray-400 h-12"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white uppercase tracking-wider transition-all"
              disabled={!fromAmount || !toAmount || (needsAddress && !outputAddress) || (isCashExchange && !selectedCity) || isSubmitting || isLoadingRates}
            >
              {isSubmitting ? 'Создание заявки...' : isCashExchange ? `Заявка: ${fromInfo.rateKey} → ${toInfo.rateKey}` : `Обменять ${fromInfo.rateKey} на ${toInfo.rateKey}`}
            </Button>

            <p className="text-center text-[11px] text-gray-400">
              Минимальная сумма обмена — $25
            </p>

            {!isAuthenticated && (
              <p className="text-center text-xs text-gray-400">
                Для создания обмена необходима авторизация
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeForm;