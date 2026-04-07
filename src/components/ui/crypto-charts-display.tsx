import { motion } from 'framer-motion';
import Icon from '@/components/ui/icon';

const ADVANTAGES = [
  {
    icon: 'Zap',
    title: 'Мгновенный обмен',
    desc: 'Обмен проходит примерно за 5 минут. Никаких очередей и ожиданий — всё автоматизировано.',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-500',
    accent: 'text-amber-700',
  },
  {
    icon: 'ShieldCheck',
    title: 'Полная анонимность',
    desc: 'Без регистрации, верификации и KYC. Ваши данные остаются только у вас.',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-500',
    accent: 'text-emerald-700',
  },
  {
    icon: 'TrendingUp',
    title: 'Лучшие курсы',
    desc: 'Курсы обновляются каждые 30 секунд. Минимальная наценка — максимум выгоды.',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-500',
    accent: 'text-blue-700',
  },
  {
    icon: 'Clock',
    title: 'Поддержка 24/7',
    desc: 'Операторы на связи круглосуточно. Среднее время ответа — 15 минут.',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-500',
    accent: 'text-violet-700',
  },
  {
    icon: 'Coins',
    title: '50+ криптовалют',
    desc: 'BTC, ETH, USDT, SOL, TON и другие. Все популярные сети и токены.',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-500',
    accent: 'text-orange-700',
  },
  {
    icon: 'Lock',
    title: 'Безопасные сделки',
    desc: 'Каждая транзакция защищена. Мы не храним ваши средства — только пересылаем.',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconBg: 'bg-rose-500',
    accent: 'text-rose-700',
  },
];

export default function CryptoChartsDisplay() {
  return (
    <div className="w-full h-full bg-white p-4 md:p-6 flex flex-col overflow-hidden">
      <div className="text-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">Почему выбирают нас</h3>
        <p className="text-xs text-gray-400 mt-1">6 причин доверить нам ваш обмен</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 flex-1 min-h-0">
        {ADVANTAGES.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`flex flex-col ${item.bg} border ${item.border} rounded-xl p-3 md:p-4 transition-all`}
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 ${item.iconBg} rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-sm`}>
              <Icon name={item.icon} size={18} className="text-white" />
            </div>
            <span className={`text-sm md:text-base font-bold ${item.accent} leading-tight`}>{item.title}</span>
            <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-1.5 leading-snug">{item.desc}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}