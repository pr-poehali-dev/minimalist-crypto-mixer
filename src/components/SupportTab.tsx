import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';

const SupportTab = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800">Поддержка</h2>
          <p className="text-sm md:text-lg text-gray-500">Мы всегда на связи — выберите удобный способ</p>
        </div>

        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <a
            href="https://t.me/blqou_help_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 p-4 md:p-6 border-2 border-blue-100 bg-blue-50/50 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Icon name="HeadphonesIcon" size={22} className="text-white md:hidden" />
              <Icon name="HeadphonesIcon" size={28} className="text-white hidden md:block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base md:text-xl text-gray-800">Написать в поддержку</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">@blqou_help_bot — бот поддержки</p>
              <p className="text-xs text-blue-600 mt-1 md:mt-2 font-medium">Создайте тикет или просто напишите вопрос — оператор ответит</p>
            </div>
            <Icon name="ExternalLink" size={20} className="text-gray-400 flex-shrink-0 hidden md:block" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-6">
          <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-3 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2 md:mb-4">
              <Icon name="Clock" size={18} className="text-green-600 md:hidden" />
              <Icon name="Clock" size={22} className="text-green-600 hidden md:block" />
            </div>
            <p className="font-bold text-gray-800 text-sm md:text-lg">24/7</p>
            <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Без выходных</p>
          </div>
          <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-3 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2 md:mb-4">
              <Icon name="MessageCircle" size={18} className="text-blue-600 md:hidden" />
              <Icon name="MessageCircle" size={22} className="text-blue-600 hidden md:block" />
            </div>
            <p className="font-bold text-gray-800 text-sm md:text-lg">~15 мин</p>
            <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Время ответа</p>
          </div>
          <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-3 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2 md:mb-4">
              <Icon name="Languages" size={18} className="text-purple-600 md:hidden" />
              <Icon name="Languages" size={22} className="text-purple-600 hidden md:block" />
            </div>
            <p className="font-bold text-gray-800 text-sm md:text-lg">RU / EN</p>
            <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Языки</p>
          </div>
        </div>

        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Как мы можем помочь</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
              { icon: 'HelpCircle', title: 'Вопросы по обмену', desc: 'Помощь с созданием заявки, выбором валюты и курсами', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: 'AlertCircle', title: 'Проблемы с заказом', desc: 'Задержка обмена, неверная сумма, ошибка адреса', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: 'Shield', title: 'Безопасность аккаунта', desc: 'Подозрительная активность, восстановление доступа', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: 'MessageSquare', title: 'Предложения и отзывы', desc: 'Ваши идеи помогают нам становиться лучше', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={item.icon} size={18} className={`${item.color} md:hidden`} />
                  <Icon name={item.icon} size={20} className={`${item.color} hidden md:block`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 md:mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Как создать тикет</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {[
              { step: '1', title: 'Откройте бота', desc: 'Перейдите по ссылке @blqou_help_bot в Telegram', icon: 'ExternalLink' },
              { step: '2', title: 'Опишите проблему', desc: 'Напишите сообщение или используйте /ticket', icon: 'PenLine' },
              { step: '3', title: 'Получите ответ', desc: 'Оператор ответит в том же чате в течение 15 минут', icon: 'CheckCircle' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-2 md:mb-4 text-sm md:text-lg font-bold">
                  {s.step}
                </div>
                <p className="font-bold text-gray-800 text-xs md:text-base">{s.title}</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Команды бота</h3>
          <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6">Команды для быстрого взаимодействия с ботом поддержки</p>
          <div className="space-y-2 md:space-y-3">
            {[
              { cmd: '/start', desc: 'Начать работу с ботом' },
              { cmd: '/ticket', desc: 'Создать тикет с выбором категории' },
              { cmd: '/status', desc: 'Проверить статус обращений' },
              { cmd: '/help', desc: 'Справка по всем командам' },
            ].map(c => (
              <div key={c.cmd} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 bg-neutral-50 rounded-lg">
                <code className="text-xs md:text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 md:px-3 py-0.5 md:py-1 rounded min-w-[60px] md:min-w-[80px]">{c.cmd}</code>
                <span className="text-xs md:text-sm text-gray-600">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl md:rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 md:p-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" size={18} className="text-yellow-700 md:hidden" />
              <Icon name="AlertTriangle" size={20} className="text-yellow-700 hidden md:block" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-yellow-800 text-sm md:text-base">Будьте бдительны</p>
              <p className="text-xs md:text-sm text-yellow-700 mt-1">Мы никогда не просим ваши пароли, seed-фразы или приватные ключи. Не отправляйте средства по ссылкам из непроверенных источников. Наш единственный бот поддержки — @blqou_help_bot.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SupportTab;