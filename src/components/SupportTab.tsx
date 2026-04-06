import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';

const SupportTab = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gray-800">Поддержка</h2>
          <p className="text-lg text-gray-500">Мы всегда на связи — выберите удобный способ</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <a
            href="https://t.me/wi_exchange_sup_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-6 p-6 border-2 border-blue-100 bg-blue-50/50 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Icon name="HeadphonesIcon" size={28} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-xl text-gray-800">Написать в поддержку</p>
              <p className="text-sm text-gray-500 mt-1">@wi_exchange_sup_bot — бот поддержки</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">Создайте тикет или просто напишите вопрос — оператор ответит</p>
            </div>
            <Icon name="ExternalLink" size={20} className="text-gray-400 flex-shrink-0" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={22} className="text-green-600" />
            </div>
            <p className="font-bold text-gray-800 text-lg">24/7</p>
            <p className="text-sm text-gray-500 mt-1">Работаем без выходных</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageCircle" size={22} className="text-blue-600" />
            </div>
            <p className="font-bold text-gray-800 text-lg">~15 мин</p>
            <p className="text-sm text-gray-500 mt-1">Среднее время ответа</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="Languages" size={22} className="text-purple-600" />
            </div>
            <p className="font-bold text-gray-800 text-lg">RU / EN</p>
            <p className="text-sm text-gray-500 mt-1">Языки поддержки</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Как мы можем помочь</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'HelpCircle', title: 'Вопросы по обмену', desc: 'Помощь с созданием заявки, выбором валюты и курсами', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: 'AlertCircle', title: 'Проблемы с заказом', desc: 'Задержка обмена, неверная сумма, ошибка адреса', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: 'Shield', title: 'Безопасность аккаунта', desc: 'Подозрительная активность, восстановление доступа', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: 'MessageSquare', title: 'Предложения и отзывы', desc: 'Ваши идеи помогают нам становиться лучше', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={item.icon} size={20} className={item.color} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Как создать тикет</h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Откройте бота', desc: 'Перейдите по ссылке @wi_exchange_sup_bot в Telegram', icon: 'ExternalLink' },
              { step: '2', title: 'Опишите проблему', desc: 'Напишите сообщение или используйте /ticket для выбора категории', icon: 'PenLine' },
              { step: '3', title: 'Получите ответ', desc: 'Оператор ответит в том же чате в течение 15 минут', icon: 'CheckCircle' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {s.step}
                </div>
                <p className="font-bold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Команды бота</h3>
          <p className="text-sm text-gray-500 mb-6">Используйте эти команды для быстрого взаимодействия с ботом поддержки</p>
          <div className="space-y-3">
            {[
              { cmd: '/start', desc: 'Начать работу с ботом' },
              { cmd: '/ticket', desc: 'Создать тикет с выбором категории' },
              { cmd: '/status', desc: 'Проверить статус ваших обращений' },
              { cmd: '/help', desc: 'Справка по всем командам' },
            ].map(c => (
              <div key={c.cmd} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                <code className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded min-w-[80px]">{c.cmd}</code>
                <span className="text-sm text-gray-600">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" size={20} className="text-yellow-700" />
            </div>
            <div>
              <p className="font-bold text-yellow-800">Будьте бдительны</p>
              <p className="text-sm text-yellow-700 mt-1">Мы никогда не просим ваши пароли, seed-фразы или приватные ключи. Не отправляйте средства по ссылкам из непроверенных источников. Наш единственный бот поддержки — @wi_exchange_sup_bot.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SupportTab;