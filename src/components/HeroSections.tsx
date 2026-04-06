import { motion } from 'framer-motion';
import Icon from '@/components/ui/icon';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export const HowItWorks = () => {
  const steps = [
    { num: '01', icon: 'Coins', title: 'Выберите валюты', desc: 'Укажите что отдаёте и что хотите получить из 170+ криптовалют' },
    { num: '02', icon: 'Wallet', title: 'Введите адрес', desc: 'Укажите адрес кошелька для получения обменянной криптовалюты' },
    { num: '03', icon: 'Send', title: 'Отправьте средства', desc: 'Переведите указанную сумму на адрес, который мы предоставим' },
    { num: '04', icon: 'CheckCircle', title: 'Получите крипту', desc: 'Средства поступят на ваш кошелёк в течение 2–15 минут' },
  ];

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-black"
        >
          Как это работает
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-gray-500 mt-3 text-lg"
        >
          4 простых шага до обмена
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{step.num}</span>
            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto mt-3 mb-4 group-hover:scale-105 transition-transform">
              <Icon name={step.icon} size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-black text-base">{step.title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{step.desc}</p>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-4 text-gray-300">
                <Icon name="ChevronRight" size={18} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const PopularPairs = () => {
  const pairs = [
    { from: 'BTC', to: 'ETH', fromLogo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', toLogo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', fromColor: '#F7931A', toColor: '#627EEA' },
    { from: 'BTC', to: 'USDT', fromLogo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', toLogo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', fromColor: '#F7931A', toColor: '#26A17B' },
    { from: 'ETH', to: 'USDT', fromLogo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', toLogo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', fromColor: '#627EEA', toColor: '#26A17B' },
    { from: 'SOL', to: 'BTC', fromLogo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', toLogo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', fromColor: '#9945FF', toColor: '#F7931A' },
    { from: 'XMR', to: 'BTC', fromLogo: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png', toLogo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', fromColor: '#FF6600', toColor: '#F7931A' },
    { from: 'TON', to: 'USDT', fromLogo: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png', toLogo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', fromColor: '#0098EA', toColor: '#26A17B' },
  ];

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-black"
        >
          Популярные направления
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-gray-500 mt-3"
        >
          Самые востребованные обменные пары
        </motion.p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pairs.map((pair, i) => (
          <motion.div
            key={`${pair.from}-${pair.to}`}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src={pair.fromLogo} alt={pair.from} className="w-9 h-9 rounded-full border-2 border-white relative z-10" />
                <img src={pair.toLogo} alt={pair.to} className="w-9 h-9 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-bold text-black text-sm">
                  <span style={{ color: pair.fromColor }}>{pair.from}</span>
                  <span className="text-gray-400 mx-1.5">→</span>
                  <span style={{ color: pair.toColor }}>{pair.to}</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Мгновенный обмен</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const StatsSection = () => {
  const stats = [
    { value: '170+', label: 'Криптовалют', icon: 'Coins' },
    { value: '50K+', label: 'Обменов', icon: 'ArrowLeftRight' },
    { value: '2 мин', label: 'Среднее время', icon: 'Zap' },
    { value: '24/7', label: 'Поддержка', icon: 'Headphones' },
  ];

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <div className="bg-black rounded-3xl p-8 md:p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Icon name={stat.icon} size={22} className="text-white" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Testimonials = () => {
  const reviews = [
    { name: 'Алексей М.', text: 'Обменял BTC на ETH за 5 минут. Курс был лучше, чем на других обменниках. Рекомендую!', rating: 5, time: '2 дня назад' },
    { name: 'Дмитрий К.', text: 'Поддержка ответила моментально, помогли разобраться с первым обменом. Теперь пользуюсь постоянно.', rating: 5, time: '5 дней назад' },
    { name: 'Мария С.', text: 'Никакой верификации, всё анонимно. Обмен прошёл быстро и без проблем, буду пользоваться снова.', rating: 5, time: '1 неделю назад' },
    { name: 'Иван Р.', text: 'Пробовал много обменников — этот самый удобный. Минимальная комиссия и понятный интерфейс.', rating: 4, time: '2 недели назад' },
    { name: 'Ольга В.', text: 'Обмен SOL на USDT прошёл за пару минут. Интерфейс интуитивный, всё просто и понятно.', rating: 5, time: '3 недели назад' },
    { name: 'Сергей Т.', text: 'Отличный сервис! Менял Monero на Bitcoin, всё пришло быстро. Поддержка на высоте.', rating: 5, time: '1 месяц назад' },
  ];

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-black"
        >
          Отзывы клиентов
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-gray-500 mt-3"
        >
          Нам доверяют тысячи пользователей
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reviews.map((review, i) => (
          <motion.div
            key={review.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, si) => (
                <Icon
                  key={si}
                  name="Star"
                  size={14}
                  className={si < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{review.name[0]}</span>
                </div>
                <span className="text-sm font-semibold text-black">{review.name}</span>
              </div>
              <span className="text-[11px] text-gray-400">{review.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const TrustBanner = () => {
  return (
    <section className="max-w-5xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Начните обмен прямо сейчас</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">Без регистрации, без KYC. Просто выберите валюту, укажите адрес — и получите крипту за считанные минуты.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <Icon name="ShieldCheck" size={16} className="text-green-300" />
              <span className="text-sm text-white font-medium">Анонимно</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <Icon name="Zap" size={16} className="text-yellow-300" />
              <span className="text-sm text-white font-medium">2–15 минут</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <Icon name="TrendingUp" size={16} className="text-emerald-300" />
              <span className="text-sm text-white font-medium">Лучшие курсы</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default { HowItWorks, PopularPairs, StatsSection, Testimonials, TrustBanner };
