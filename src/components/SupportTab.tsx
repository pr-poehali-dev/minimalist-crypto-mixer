import Icon from '@/components/ui/icon';

const SupportTab = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-black">Поддержка</h2>
          <p className="text-lg text-gray-500">Напишите нам в Telegram — оператор ответит в кратчайшие сроки</p>
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
              <p className="font-bold text-xl text-black">Написать в поддержку</p>
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
            <p className="font-bold text-black text-lg">24/7</p>
            <p className="text-sm text-gray-500 mt-1">Работаем без выходных</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageCircle" size={22} className="text-blue-600" />
            </div>
            <p className="font-bold text-black text-lg">~15 мин</p>
            <p className="text-sm text-gray-500 mt-1">Среднее время ответа</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="Languages" size={22} className="text-purple-600" />
            </div>
            <p className="font-bold text-black text-lg">RU / EN</p>
            <p className="text-sm text-gray-500 mt-1">Языки поддержки</p>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" size={20} className="text-yellow-700" />
            </div>
            <div>
              <p className="font-bold text-yellow-800">Будьте бдительны</p>
              <p className="text-sm text-yellow-700 mt-1">Мы никогда не просим ваши пароли, seed-фразы или приватные ключи. Не отправляйте средства по ссылкам из непроверенных источников.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTab;
