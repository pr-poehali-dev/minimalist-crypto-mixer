import Icon from '@/components/ui/icon';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 md:mt-20 mb-6 md:mb-8 px-4 max-w-5xl mx-auto">
      <div className="relative bg-neutral-50 rounded-2xl md:rounded-3xl px-5 md:px-12 py-8 md:py-10 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8">
          <div className="flex flex-col gap-3 max-w-xs">
            <img src="https://cdn.poehali.dev/projects/3306a222-60eb-449b-b09c-fcee64a12f0b/bucket/cfecc782-c64c-4d1a-8f84-1a85396fc50d.png" alt="BLQOU" className="h-12 rounded-md object-contain" />
            <p className="text-sm text-gray-500 leading-relaxed">
              Быстрый и анонимный обмен криптовалют. 60+ монет, мгновенные переводы, поддержка 24/7.
            </p>
            <div className="flex gap-3 mt-2">
              <a
                href="https://t.me/wi_exchange_sup_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Icon name="Send" size={15} className="text-gray-600" />
              </a>
              <a
                href="https://t.me/wi_exchange_auth_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Icon name="Bot" size={15} className="text-gray-600" />
              </a>
            </div>
          </div>

          <div className="flex gap-8 md:gap-16">
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Навигация</h4>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">Обмен</span>
                <span className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">О нас</span>
                <span className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">FAQ</span>
                <span className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">Поддержка</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Поддержка</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="https://t.me/wi_exchange_sup_bot" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 transition-colors">Telegram бот</a>
                <span className="text-gray-600">support@exchange.com</span>
                <span className="text-gray-600">24/7 онлайн</span>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Популярные пары</h4>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">BTC → ETH</span>
                <span className="text-gray-600">BTC → USDT</span>
                <span className="text-gray-600">ETH → USDT</span>
                <span className="text-gray-600">SOL → BTC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
        <p>&copy;{currentYear} BLQOU. Все права защищены.</p>
        <div className="flex gap-4">
          <span className="hover:text-gray-600 cursor-pointer transition-colors">Политика конфиденциальности</span>
          <span className="hover:text-gray-600 cursor-pointer transition-colors">Условия использования</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;