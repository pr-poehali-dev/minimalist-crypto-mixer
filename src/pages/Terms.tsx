import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const Terms = () => {
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
          Условия использования
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mb-6 md:mb-10">
          Последнее обновление: 7 апреля 2026 г.
        </p>

        <div className="space-y-6 md:space-y-8 text-gray-700 text-sm sm:text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Термины и определения</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>«Сервис»</strong> — платформа BLQOU, предоставляющая услуги обмена криптовалют.</li>
              <li><strong>«Пользователь»</strong> — физическое лицо, использующее Сервис для проведения обменных операций.</li>
              <li><strong>«Заявка»</strong> — оформленный Пользователем запрос на обмен криптовалюты.</li>
              <li><strong>«Курс обмена»</strong> — соотношение стоимости криптовалют на момент создания Заявки.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Общие условия</h2>
            <p className="mb-3">
              Используя Сервис, Пользователь подтверждает, что ознакомился с настоящими Условиями и
              принимает их в полном объёме. Если вы не согласны с какими-либо положениями, прекратите
              использование Сервиса.
            </p>
            <p>
              Сервис предоставляет услуги обмена криптовалют «как есть» (as is). Сервис не является
              биржей, банком или финансовым учреждением.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Порядок обмена</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Пользователь выбирает направление обмена и указывает сумму.</li>
              <li>Сервис фиксирует курс обмена на момент создания Заявки.</li>
              <li>Пользователь отправляет средства по указанным реквизитам в установленный срок.</li>
              <li>После подтверждения поступления средств Сервис выполняет обмен и отправляет средства на указанный Пользователем адрес.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Курс и комиссии</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Курс обмена фиксируется на момент создания Заявки и действителен в течение указанного времени.</li>
              <li>Комиссия Сервиса уже включена в отображаемый курс обмена.</li>
              <li>Сетевые комиссии блокчейна оплачиваются Сервисом, если не указано иное.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Конфиденциальность</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-5 space-y-2">
              <div className="flex items-start gap-3">
                <Icon name="ShieldCheck" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Сервис <strong>не хранит IP-адреса</strong> пользователей.</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="ShieldCheck" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Сервис <strong>не передаёт информацию о пользователях третьим лицам</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="ShieldCheck" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Подробнее — в <Link to="/privacy" className="text-blue-600 hover:underline">Политике конфиденциальности</Link>.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Обязательства Пользователя</h2>
            <p className="mb-3">Пользователь обязуется:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Предоставлять корректные данные для обмена (адреса кошельков, суммы).</li>
              <li>Не использовать Сервис для легализации средств, полученных преступным путём.</li>
              <li>Не использовать Сервис для финансирования незаконной деятельности.</li>
              <li>Самостоятельно проверять правильность указанных адресов и сумм перед отправкой средств.</li>
              <li>Соблюдать действующее законодательство своей юрисдикции при проведении операций.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Ответственность Сервиса</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Сервис не несёт ответственности за убытки, вызванные неправильно указанными реквизитами Пользователя.</li>
              <li>Сервис не несёт ответственности за задержки, вызванные перегрузкой блокчейн-сетей.</li>
              <li>Сервис не компенсирует убытки, связанные с изменением рыночного курса криптовалют после фиксации курса в Заявке.</li>
              <li>В случае технической ошибки на стороне Сервиса средства будут возвращены Пользователю в полном объёме.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Отмена и возврат</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Заявка может быть отменена до момента отправки средств Пользователем.</li>
              <li>После отправки средств отмена Заявки невозможна — операция будет выполнена по зафиксированному курсу.</li>
              <li>В случае истечения срока Заявки без оплаты она аннулируется автоматически.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Ограничения</h2>
            <p className="mb-3">Сервис оставляет за собой право:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Отказать в обслуживании без объяснения причин.</li>
              <li>Приостановить или прекратить работу Сервиса в любое время.</li>
              <li>Установить минимальные и максимальные лимиты обмена.</li>
              <li>Изменить настоящие Условия с публикацией актуальной версии на данной странице.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Обмен наличных средств</h2>
            <p className="mb-3">
              При обмене наличных средств на криптовалюту (или наоборот) дополнительно применяются
              условия Договора обмена наличных средств. Пользователь обязан:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Подписать экземпляр Договора обмена при личной встрече с менеджером.</li>
              <li>Подтвердить легальность происхождения обмениваемых средств.</li>
              <li>Предоставить ФИО для оформления Договора.</li>
            </ul>
            <p className="mt-3">
              Образец Договора доступен на странице{" "}
              <Link to="/exchange-contract" className="text-blue-600 hover:underline">
                Договор обмена наличных средств
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Контакты</h2>
            <p>
              По любым вопросам обращайтесь через{" "}
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

export default Terms;