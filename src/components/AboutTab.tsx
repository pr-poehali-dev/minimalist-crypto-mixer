import { COINS_LIST } from '@/lib/coins';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';

const AboutTab = () => {
  return (
    <div className="space-y-8 md:space-y-16 max-w-6xl mx-auto">

      <div className="text-center space-y-4 md:space-y-6 py-4 md:py-8">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">Мгновенный обмен<br/>криптовалют</h2>
        <p className="text-base md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Наш сервис создан для тех, кто ценит скорость, конфиденциальность и простоту. Обменивайте криптовалюты без регистрации аккаунта, без лимитов и без скрытых комиссий.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { value: '15+', label: 'Криптовалют', icon: 'Coins', color: 'from-blue-500 to-indigo-500' },
          { value: '24/7', label: 'Без выходных', icon: 'Clock', color: 'from-green-500 to-emerald-500' },
          { value: '~15 мин', label: 'Время обмена', icon: 'Zap', color: 'from-yellow-500 to-orange-500' },
          { value: '0%', label: 'Скрытых комиссий', icon: 'BadgePercent', color: 'from-purple-500 to-pink-500' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8 text-center">
            <div className={`mx-auto w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 md:mb-5`}>
              <Icon name={stat.icon} size={22} className="text-white md:hidden" />
              <Icon name={stat.icon} size={28} className="text-white hidden md:block" />
            </div>
            <p className="text-xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl md:text-3xl font-bold text-center text-gray-800 mb-6 md:mb-10">Почему выбирают нас</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {[
            { icon: 'Shield', color: '#3B82F6', title: 'Безопасность', desc: 'Мы не храним ваши средства. Каждый обмен — это прямая транзакция между кошельками. Никаких депозитов, никаких рисков.' },
            { icon: 'Gauge', color: '#F97316', title: 'Скорость', desc: 'Большинство обменов завершаются в течение 15-30 минут. Оператор обрабатывает заявки в режиме реального времени.' },
            { icon: 'Eye', color: '#22C55E', title: 'Прозрачность', desc: 'Курс фиксируется в момент создания заявки. Вы видите точную сумму получения до начала обмена.' },
            { icon: 'Lock', color: '#8B5CF6', title: 'Конфиденциальность', desc: 'Минимум данных для обмена. Мы не требуем KYC-верификацию и не передаём данные третьим лицам.' },
            { icon: 'Headphones', color: '#EC4899', title: 'Поддержка 24/7', desc: 'Наша команда всегда на связи. Возникли вопросы — напишите нам в Telegram, и мы поможем.' },
            { icon: 'TrendingUp', color: '#06B6D4', title: 'Лучшие курсы', desc: 'Курсы обновляются каждые 30 секунд. Мы агрегируем данные с ведущих бирж для лучших котировок.' },
          ].map(feature => (
            <div key={feature.title} className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
              <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5" style={{ backgroundColor: feature.color + '15' }}>
                <Icon name={feature.icon} size={22} style={{ color: feature.color }} className="md:hidden" />
                <Icon name={feature.icon} size={26} style={{ color: feature.color }} className="hidden md:block" />
              </div>
              <p className="font-bold text-gray-800 text-base md:text-xl mb-1 md:mb-2">{feature.title}</p>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-5 md:p-12">
        <h3 className="text-xl md:text-3xl font-bold text-center text-gray-800 mb-6 md:mb-12">Как это работает</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          {[
            { step: '01', title: 'Выберите валюту', desc: 'Укажите какую криптовалюту хотите обменять и какую получить. Курс рассчитается автоматически.', icon: 'ArrowLeftRight' },
            { step: '02', title: 'Отправьте средства', desc: 'Переведите указанную сумму на предоставленный адрес. Нажмите "Я отправил" для подтверждения.', icon: 'Send' },
            { step: '03', title: 'Получите результат', desc: 'После подтверждения оплаты оператор отправит криптовалюту на ваш кошелёк. Отслеживайте статус онлайн.', icon: 'CheckCircle' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl shadow-blue-500/20">
                <Icon name={s.icon} size={28} className="text-white md:hidden" />
                <Icon name={s.icon} size={36} className="text-white hidden md:block" />
              </div>
              <span className="text-xs md:text-sm font-bold text-blue-500 uppercase tracking-wider">Шаг {s.step}</span>
              <p className="text-base md:text-xl font-bold text-gray-800 mt-1 md:mt-2">{s.title}</p>
              <p className="text-sm md:text-base text-gray-500 mt-2 md:mt-3 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-5 md:p-12">
        <h3 className="text-xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-8">Поддерживаемые криптовалюты</h3>
        <p className="text-center text-gray-500 mb-6 md:mb-10 text-sm md:text-lg">Обменивайте любую из представленных валют в любом направлении</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
          {COINS_LIST.map(coin => (
            <div key={coin.symbol} className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2.5 md:py-4 bg-neutral-50 border border-gray-200 rounded-lg md:rounded-xl hover:border-gray-300 hover:shadow-sm transition-all">
              <img src={coin.logo} alt={coin.symbol} className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
              <div className="min-w-0">
                <span className="font-bold text-sm md:text-base text-gray-800 block truncate">{coin.rateKey}</span>
                {coin.network && <span className="text-[9px] md:text-[10px] bg-gray-200 text-gray-600 px-1 md:px-1.5 py-0.5 rounded">{coin.network}</span>}
                {!coin.network && <span className="text-[10px] md:text-xs text-gray-400 truncate block">{coin.name}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutTab;
