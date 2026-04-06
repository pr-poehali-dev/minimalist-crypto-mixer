import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  key: string;
  label: string;
  icon: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    key: 'service',
    label: 'О сервисе',
    icon: 'Info',
    items: [
      {
        question: 'Что такое наш обменник?',
        answer: 'Наш сервис — это быстрый и анонимный обменник криптовалют. Мы предоставляем возможность обменивать более 170 криптовалют без регистрации и верификации.',
      },
      {
        question: 'Почему это самый удобный способ обменять криптовалюту?',
        answer: 'Мы предлагаем мгновенный обмен с минимальными комиссиями, поддержку 24/7 и полную анонимность. Курсы обновляются каждые 30 секунд.',
      },
      {
        question: 'Почему я могу доверять сервису?',
        answer: 'Мы работаем с 2024 года, не храним средства пользователей и не требуем персональные данные. Каждая транзакция защищена и прозрачна.',
      },
      {
        question: 'Как совершить обмен?',
        answer: 'Выберите валютную пару, введите сумму и адрес кошелька, отправьте средства на указанный адрес. Обмен будет обработан автоматически.',
      },
      {
        question: 'Нужна ли регистрация для обмена?',
        answer: 'Нет, регистрация не требуется. Для авторизации достаточно Telegram-аккаунта — это нужно только для отслеживания ваших заказов.',
      },
      {
        question: 'Какие криптовалюты поддерживаются?',
        answer: 'Мы поддерживаем более 170 криптовалют, включая BTC, ETH, USDT, SOL, XMR, TON, BNB и многие другие. Полный список доступен в разделе «О нас».',
      },
      {
        question: 'Есть ли лимиты на обмен?',
        answer: 'Минимальная сумма обмена зависит от выбранной валюты. Максимальных лимитов нет — для крупных сумм рекомендуем связаться с поддержкой.',
      },
      {
        question: 'В каких странах доступен сервис?',
        answer: 'Сервис доступен по всему миру без ограничений. Мы не требуем KYC-верификацию и не ограничиваем доступ по географии.',
      },
      {
        question: 'Как связаться с поддержкой?',
        answer: 'Напишите нашему Telegram-боту @wi_exchange_sup_bot. Поддержка работает круглосуточно, среднее время ответа — 15 минут.',
      },
    ],
  },
  {
    key: 'exchange',
    label: 'Об обмене',
    icon: 'ArrowLeftRight',
    items: [
      {
        question: 'Какие комиссии у сервиса?',
        answer: 'Комиссия уже включена в отображаемый курс. Дополнительных скрытых сборов нет.',
      },
      {
        question: 'Сколько времени занимает обмен?',
        answer: 'Обычно 2-15 минут в зависимости от загрузки сети. Некоторые транзакции могут занять до 30 минут.',
      },
      {
        question: 'Что произойдет, если я поставлю низкую комиссию сети?',
        answer: 'Транзакция может обрабатываться дольше обычного. Рекомендуем использовать стандартную или повышенную комиссию.',
      },
      {
        question: 'Что я могу сделать, чтобы ускорить транзакцию?',
        answer: 'Используйте рекомендованную комиссию сети при отправке. Для Bitcoin можно использовать RBF (Replace-By-Fee).',
      },
      {
        question: 'Почему отправка транзакции занимает так много времени?',
        answer: 'Время подтверждения зависит от загрузки блокчейна и размера комиссии сети.',
      },
      {
        question: 'Почему адрес моего кошелька отображается как невалидный?',
        answer: 'Убедитесь, что вы выбрали правильную сеть. Например, для USDT нужно выбрать TRC20 или ERC20 в зависимости от вашего кошелька.',
      },
      {
        question: 'Что делать, если я отправил меньше указанной суммы?',
        answer: 'Свяжитесь с поддержкой — оператор пересчитает сумму и отправит вам соответствующий эквивалент по текущему курсу.',
      },
      {
        question: 'Можно ли отменить обмен после отправки средств?',
        answer: 'После отправки криптовалюты на наш адрес отмена невозможна, так как транзакции в блокчейне необратимы. До отправки вы можете просто не переводить средства.',
      },
    ],
  },
  {
    key: 'orders',
    label: 'О заказах',
    icon: 'ClipboardList',
    items: [
      {
        question: 'Как я могу отследить свой заказ?',
        answer: 'После создания обмена вы получите уникальный ID заказа. Используйте его на странице отслеживания или в разделе "Мои обмены".',
      },
      {
        question: 'Что я могу сделать, если мой заказ истек?',
        answer: 'Свяжитесь с нашей поддержкой через Telegram-бота @wi_exchange_sup_bot. Мы поможем разобраться с ситуацией.',
      },
      {
        question: 'Я закрыл сайт, как мне вернуться к заказу?',
        answer: 'Авторизуйтесь и перейдите в раздел "Мои обмены" — все ваши заказы сохраняются.',
      },
      {
        question: 'Какие статусы бывают у заказа?',
        answer: 'Ожидает оплаты — вы ещё не отправили средства. Оплата получена — мы видим вашу транзакцию. В обработке — оператор работает над заказом. Завершено — обмен выполнен. Отменено — заказ отменён.',
      },
      {
        question: 'Что значит статус «Оплата отправлена»?',
        answer: 'Это значит, что оператор уже отправил криптовалюту на ваш адрес. Дождитесь подтверждений в сети — обычно это занимает от 1 до 30 минут.',
      },
      {
        question: 'Могу ли я создать несколько заказов одновременно?',
        answer: 'Да, вы можете создавать неограниченное количество заказов. Каждый из них обрабатывается независимо.',
      },
      {
        question: 'Что делать, если я указал неверный адрес получения?',
        answer: 'Если вы ещё не отправили средства — создайте новый заказ с правильным адресом. Если уже отправили — срочно свяжитесь с поддержкой.',
      },
      {
        question: 'Как долго хранится история моих заказов?',
        answer: 'История заказов хранится бессрочно. Вы всегда можете просмотреть все свои обмены в разделе "Мои обмены" после авторизации.',
      },
      {
        question: 'Получу ли я уведомление о завершении обмена?',
        answer: 'Да, при изменении статуса заказа вам придёт уведомление в Telegram от бота авторизации.',
      },
    ],
  },
];

const FaqTab = () => {
  const [activeCategory, setActiveCategory] = useState('service');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const currentCategory = FAQ_DATA.find(c => c.key === activeCategory) || FAQ_DATA[0];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold text-gray-800 tracking-tight">FAQ</h2>
          <p className="text-lg text-gray-500">Ответы на часто задаваемые вопросы</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {FAQ_DATA.map(cat => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setOpenItems(new Set());
              }}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                ${activeCategory === cat.key
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
                }
              `}
            >
              <Icon name={cat.icon} size={15} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {currentCategory.items.map((item, idx) => {
                const itemKey = `${activeCategory}-${idx}`;
                const isOpen = openItems.has(itemKey);

                return (
                  <div key={itemKey}>
                    {idx > 0 && <div className="mx-6 border-t border-gray-100" />}
                    <div className="px-6 py-5">
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className="w-full flex items-center gap-4 text-left group"
                      >
                        <span className="text-3xl font-bold text-gray-200 tabular-nums select-none w-10 flex-shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-base font-semibold text-gray-800 group-hover:text-gray-700 transition-colors">
                          {item.question}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:border-gray-400 transition-colors"
                        >
                          <Icon name="Plus" size={16} className="text-gray-500" />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="text-gray-500 text-sm leading-relaxed pt-3 pl-14">
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FaqTab;