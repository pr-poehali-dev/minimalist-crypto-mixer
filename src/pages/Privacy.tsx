import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
        >
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Политика конфиденциальности
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mb-6 md:mb-10">
          Последнее обновление: 7 апреля 2026 г.
        </p>

        <div className="space-y-6 md:space-y-8 text-gray-700 text-sm sm:text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты информации
              пользователей сервиса BLQOU (далее — «Сервис»). Используя Сервис, вы соглашаетесь с
              условиями данной Политики.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Сбор информации</h2>
            <p className="mb-3">Сервис собирает минимальный объём данных, необходимый для проведения операций обмена:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Telegram-username — для авторизации и связи с пользователем.</li>
              <li>Адреса криптовалютных кошельков — для выполнения обменных операций.</li>
              <li>Суммы и параметры обменных операций — для корректного исполнения заявок.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Данные, которые мы НЕ собираем</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-5 space-y-2">
              <div className="flex items-start gap-3">
                <Icon name="ShieldCheck" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p><strong>IP-адреса</strong> — Сервис не хранит, не записывает и не обрабатывает IP-адреса пользователей.</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="ShieldCheck" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p><strong>Cookies отслеживания</strong> — мы не используем трекинговые файлы cookie и аналитические системы третьих сторон.</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="ShieldCheck" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p><strong>Персональные данные</strong> — мы не запрашиваем паспортные данные, адреса проживания или банковские реквизиты (за исключением операций обмена наличных средств).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Передача данных третьим лицам</h2>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 sm:p-5">
              <div className="flex items-start gap-3">
                <Icon name="Lock" size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <p>
                  Сервис <strong>не передаёт, не продаёт и не предоставляет</strong> какую-либо информацию
                  о пользователях третьим лицам ни при каких обстоятельствах. Это включает, но не
                  ограничивается: рекламными сетями, аналитическими сервисами, партнёрскими
                  организациями и государственными органами (за исключением случаев, прямо
                  предусмотренных действующим законодательством).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Защита информации</h2>
            <p>
              Мы применяем современные методы защиты данных, включая шифрование соединений (TLS/SSL),
              защищённые серверы и ограниченный доступ к информации. Данные обменных операций хранятся
              в зашифрованном виде и автоматически удаляются по истечении срока, необходимого для
              выполнения обязательств перед пользователем.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Хранение данных</h2>
            <p>
              Информация об обменных операциях хранится в течение минимального срока, необходимого для
              завершения операции и разрешения возможных споров. После завершения этого срока данные
              безвозвратно удаляются из систем Сервиса.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Права пользователей</h2>
            <p className="mb-3">Вы имеете право:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Запросить информацию о данных, которые Сервис хранит о вас.</li>
              <li>Потребовать удаления ваших данных из системы.</li>
              <li>Отказаться от использования Сервиса в любой момент.</li>
            </ul>
            <p className="mt-3">
              Для реализации этих прав свяжитесь с нашей службой поддержки через{" "}
              <a
                href="https://t.me/wi_exchange_sup_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Telegram-бот поддержки
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Изменения политики</h2>
            <p>
              Сервис оставляет за собой право вносить изменения в настоящую Политику
              конфиденциальности. Актуальная версия всегда доступна на данной странице. Продолжение
              использования Сервиса после внесения изменений означает согласие с обновлённой Политикой.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Контакты</h2>
            <p>
              По вопросам, связанным с конфиденциальностью, обращайтесь через{" "}
              <a
                href="https://t.me/wi_exchange_sup_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Telegram-бот поддержки
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;