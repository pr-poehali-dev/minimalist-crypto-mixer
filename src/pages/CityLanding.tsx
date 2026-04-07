import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Icon from "@/components/ui/icon";
import Footer from "@/components/Footer";

interface CityData {
  name: string;
  nameRod: string;
  namePrep: string;
  description: string;
  districts?: string[];
}

const CITIES: Record<string, CityData> = {
  "moskva": {
    name: "Москва",
    nameRod: "Москвы",
    namePrep: "Москве",
    description: "столице России с населением более 13 млн человек",
    districts: ["Центральный", "Северный", "Южный", "Западный", "Восточный", "ЮЗАО", "СЗАО", "СВАО", "ЮВАО", "ЗелАО"],
  },
  "odintsovo": {
    name: "Одинцово",
    nameRod: "Одинцово",
    namePrep: "Одинцово",
    description: "крупном городе на западе Московской области",
    districts: ["Центр", "Новая Трёхгорка", "Кубинка", "Голицыно", "Лесной городок"],
  },
  "krasnogorsk": {
    name: "Красногорск",
    nameRod: "Красногорска",
    namePrep: "Красногорске",
    description: "административном центре Красногорского района МО",
    districts: ["Центр", "Павшинская пойма", "Опалиха", "Нахабино", "Митино"],
  },
  "khimki": {
    name: "Химки",
    nameRod: "Химок",
    namePrep: "Химках",
    description: "одном из крупнейших городов-спутников Москвы",
    districts: ["Центр", "Левобережный", "Сходня", "Куркино", "Новокуркино", "Планерная"],
  },
  "mytishchi": {
    name: "Мытищи",
    nameRod: "Мытищ",
    namePrep: "Мытищах",
    description: "динамично развивающемся городе на северо-востоке МО",
    districts: ["Центр", "Перловка", "Тайнинка", "Леонидовка", "Пироговский"],
  },
  "balashikha": {
    name: "Балашиха",
    nameRod: "Балашихи",
    namePrep: "Балашихе",
    description: "крупнейшем городе Московской области",
    districts: ["Центр", "Железнодорожный", "Салтыковка", "Новое Измайлово", "Заря"],
  },
  "podolsk": {
    name: "Подольск",
    nameRod: "Подольска",
    namePrep: "Подольске",
    description: "крупном промышленном и культурном центре юга МО",
    districts: ["Центр", "Климовск", "Кузнечики", "Силикатная", "Межводное"],
  },
  "lubertsy": {
    name: "Люберцы",
    nameRod: "Люберец",
    namePrep: "Люберцах",
    description: "городе на юго-востоке от Москвы с отличной транспортной доступностью",
    districts: ["Центр", "Красная горка", "Котельники", "Томилино", "Малаховка"],
  },
  "korolev": {
    name: "Королёв",
    nameRod: "Королёва",
    namePrep: "Королёве",
    description: "наукограде и космической столице России",
    districts: ["Центр", "Юбилейный", "Болшево", "Первомайский", "Текстильщик"],
  },
  "domodedovo": {
    name: "Домодедово",
    nameRod: "Домодедово",
    namePrep: "Домодедово",
    description: "городе с крупнейшим аэропортом Московского региона",
    districts: ["Центр", "Авиагородок", "Белые Столбы", "Востряково", "Барыбино"],
  },
  "shchyolkovo": {
    name: "Щёлково",
    nameRod: "Щёлково",
    namePrep: "Щёлково",
    description: "городе на северо-востоке Московской области",
    districts: ["Центр", "Богородский", "Фрязино", "Загорянский", "Монино"],
  },
  "dolgoprudny": {
    name: "Долгопрудный",
    nameRod: "Долгопрудного",
    namePrep: "Долгопрудном",
    description: "наукограде, известном МФТИ и высокотехнологичными компаниями",
    districts: ["Центр", "Хлебниково", "Шереметьевский", "Лихачёво", "Водники"],
  },
  "reutov": {
    name: "Реутов",
    nameRod: "Реутова",
    namePrep: "Реутове",
    description: "компактном наукограде, граничащем с Москвой",
    districts: ["Центр", "Новокосино-2", "Фабричный"],
  },
  "vidnoe": {
    name: "Видное",
    nameRod: "Видного",
    namePrep: "Видном",
    description: "городе на юге от Москвы, признанном самым благоустроенным в МО",
    districts: ["Центр", "Расторгуево", "Развилка", "Тарычёво"],
  },
  "zhukovsky": {
    name: "Жуковский",
    nameRod: "Жуковского",
    namePrep: "Жуковском",
    description: "авиационной столице России, центре науки и технологий",
    districts: ["Центр", "Наркомвод", "Быково", "Кратово"],
  },
  "pushkino": {
    name: "Пушкино",
    nameRod: "Пушкино",
    namePrep: "Пушкино",
    description: "живописном городе на Ярославском направлении",
    districts: ["Центр", "Клязьма", "Мамонтовка", "Черкизово", "Ивантеевка"],
  },
  "sergiev-posad": {
    name: "Сергиев Посад",
    nameRod: "Сергиева Посада",
    namePrep: "Сергиевом Посаде",
    description: "духовном центре России, жемчужине Золотого кольца",
    districts: ["Центр", "Загорск", "Хотьково", "Скоропусковский"],
  },
  "noginsk": {
    name: "Ногинск",
    nameRod: "Ногинска",
    namePrep: "Ногинске",
    description: "историческом городе на востоке Подмосковья",
    districts: ["Центр", "Электроугли", "Обухово", "Старая Купавна"],
  },
  "elektrostal": {
    name: "Электросталь",
    nameRod: "Электростали",
    namePrep: "Электростали",
    description: "промышленном центре восточного Подмосковья",
    districts: ["Центр", "Южный", "Северный", "Восточный"],
  },
  "kolomna": {
    name: "Коломна",
    nameRod: "Коломны",
    namePrep: "Коломне",
    description: "древнем городе с богатой историей на юго-востоке МО",
    districts: ["Центр", "Старая Коломна", "Колычёво", "Щурово"],
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const CityLanding = () => {
  const { city } = useParams<{ city: string }>();
  const data = city ? CITIES[city] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (data) {
      document.title = `Обмен криптовалют в ${data.namePrep} с выездом на дом | Купить BTC, USDT за наличные — BLQOU`;
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Город не найден</h1>
          <Link to="/" className="text-blue-600 hover:underline">На главную</Link>
        </div>
      </div>
    );
  }

  const cryptoList = [
    { name: "Bitcoin", ticker: "BTC", icon: "Bitcoin" },
    { name: "Ethereum", ticker: "ETH", icon: "Gem" },
    { name: "Tether", ticker: "USDT", icon: "DollarSign" },
    { name: "Litecoin", ticker: "LTC", icon: "Coins" },
    { name: "Tron", ticker: "TRX", icon: "Zap" },
    { name: "Solana", ticker: "SOL", icon: "Sun" },
  ];

  const advantages = [
    { icon: "Car", title: "Выезд на дом", desc: `Менеджер приедет к вам домой или в удобное место в ${data.namePrep} для обмена наличных на криптовалюту.` },
    { icon: "ShieldCheck", title: "Без KYC", desc: "Не требуем паспорт и верификацию. Полная анонимность обмена." },
    { icon: "Zap", title: "Мгновенно", desc: "Примерное время обмена — 5 минут. Курс фиксируется при создании заявки." },
    { icon: "Clock", title: "24/7", desc: `Работаем круглосуточно в ${data.namePrep} и Московской области. Выезд курьера в любое время.` },
    { icon: "Banknote", title: "Наличный обмен", desc: `Обмен наличных на криптовалюту и обратно при личной встрече в ${data.namePrep}.` },
    { icon: "Lock", title: "Безопасно", desc: "Не храним IP-адреса. Не передаём данные третьим лицам." },
  ];

  const otherCities = Object.entries(CITIES)
    .filter(([slug]) => slug !== city)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            BLQOU
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all"
          >
            Обменять сейчас
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-12 md:pt-20 pb-10 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-semibold mb-6">
            <Icon name="MapPin" size={14} />
            {data.name}, Московская область
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Обмен криптовалют <br className="hidden md:block" />
            в {data.namePrep} с выездом на дом
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Купить и продать Bitcoin, USDT, Ethereum и 50+ других криптовалют
            за наличные в {data.namePrep} — {data.description}. Выезд менеджера к вам домой или в удобное место. Без KYC, мгновенно, анонимно.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all text-base"
            >
              Начать обмен
              <Icon name="ArrowRight" size={18} />
            </Link>
            <a
              href="https://t.me/wi_exchange_sup_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all text-base"
            >
              <Icon name="Send" size={18} />
              Написать в Telegram
            </a>
          </div>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
          Доступные криптовалюты в {data.namePrep}
        </h2>
        <p className="text-center text-gray-500 mb-8 md:mb-12">Покупка и продажа за наличные и онлайн</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {cryptoList.map((c, i) => (
            <motion.div
              key={c.ticker}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md shadow-blue-200/30">
                <Icon name={c.icon} size={20} className="text-white" fallback="Coins" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">{c.name}</h3>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">{c.ticker}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">
          И ещё <span className="font-semibold text-gray-600">50+ криптовалют</span> доступны для обмена
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
          Почему выбирают BLQOU в {data.namePrep}
        </h2>
        <p className="text-center text-gray-500 mb-8 md:mb-12">Надёжный обменник для жителей {data.nameRod}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {advantages.map((a, i) => (
            <motion.div
              key={a.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon name={a.icon} size={20} className="text-blue-600" fallback="Shield" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {data.districts && (
        <section className="max-w-5xl mx-auto px-4 py-10 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            Обслуживаемые районы {data.nameRod}
          </h2>
          <p className="text-center text-gray-500 mb-8 md:mb-10">Работаем по всем районам города и ближайшим населённым пунктам</p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {data.districts.map((d) => (
              <span key={d} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 font-medium">
                {d}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
          Как работает выезд на дом в {data.namePrep}
        </h2>
        <p className="text-center text-gray-500 mb-8 md:mb-12">Обмен криптовалюты за наличные без посещения офиса</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { num: "01", icon: "MessageCircle", title: "Оставьте заявку", desc: "Свяжитесь с нами через Telegram или оформите заявку на сайте" },
            { num: "02", icon: "MapPin", title: "Согласуйте место", desc: `Менеджер свяжется с вами и согласует удобное место и время встречи в ${data.namePrep}` },
            { num: "03", icon: "Car", title: "Встреча с курьером", desc: "Менеджер приедет к вам домой, в кафе или в любое удобное место" },
            { num: "04", icon: "CheckCircle", title: "Обмен на месте", desc: "Подписание договора, передача наличных и отправка криптовалюты при вас" },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative bg-white border border-gray-200 rounded-2xl p-5 text-center hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{step.num}</span>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mt-2 mb-3 shadow-md shadow-blue-200/30">
                <Icon name={step.icon} size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{step.title}</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 md:p-14 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Обмен криптовалют с выездом в {data.namePrep}
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Закажите выезд менеджера на дом или перейдите к онлайн-обмену — лучший курс ждёт вас прямо сейчас.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg transition-all text-base"
          >
            Обменять криптовалюту
            <Icon name="ArrowRight" size={18} />
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          Обмен криптовалют в других городах
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {otherCities.map(([slug, c]) => (
            <Link
              key={slug}
              to={`/city/${slug}`}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 font-medium hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              <Icon name="MapPin" size={14} className="text-gray-400" />
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          Частые вопросы об обмене в {data.namePrep}
        </h2>
        <div className="space-y-4">
          {[
            { q: `Как заказать выезд курьера для обмена криптовалют в ${data.namePrep}?`, a: `Свяжитесь с нами через Telegram-бот или оставьте заявку на сайте. Менеджер свяжется с вами, согласует удобное время и место, и приедет к вам домой или в любое удобное место в ${data.namePrep}.` },
            { q: `Как купить Bitcoin в ${data.namePrep}?`, a: `Перейдите на главную страницу BLQOU, выберите пару обмена (например, RUB → BTC), укажите сумму и адрес кошелька. Также доступен обмен наличных с выездом менеджера на дом в ${data.namePrep}.` },
            { q: "Нужна ли верификация для обмена?", a: "Нет. BLQOU работает без KYC — мы не запрашиваем паспортные данные, не храним IP-адреса и не передаём информацию третьим лицам." },
            { q: `Сколько стоит выезд курьера в ${data.namePrep}?`, a: `Выезд менеджера в ${data.namePrep} и ближайшие районы — бесплатно. Стоимость обмена включена в курс, никаких скрытых комиссий.` },
            { q: `Можно ли обменять наличные на криптовалюту в ${data.namePrep}?`, a: `Да. Мы предоставляем услугу обмена наличных на криптовалюту и обратно с выездом менеджера на дом в ${data.namePrep}. Для этого оформляется договор обмена.` },
            { q: "Какие криптовалюты доступны?", a: "Более 60 криптовалют: Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Litecoin (LTC), Solana (SOL), Tron (TRX) и многие другие." },
            { q: `В какое время можно заказать выезд в ${data.namePrep}?`, a: "Работаем круглосуточно, 24/7. Менеджер может приехать в любое удобное для вас время, включая выходные и праздничные дни." },
          ].map((item, i) => (
            <motion.details
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-gray-900 text-sm md:text-base">
                {item.q}
                <Icon name="ChevronDown" size={18} className="text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export const CITY_SLUGS = Object.keys(CITIES);

export default CityLanding;