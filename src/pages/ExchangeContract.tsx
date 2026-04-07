import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type ContractType = "cash-to-crypto" | "crypto-to-cash";

const ExchangeContract = () => {
  const [contractType, setContractType] = useState<ContractType>("cash-to-crypto");
  const [formData, setFormData] = useState({
    clientName: "",
    managerName: "",
    exchangeAmount: "",
    currency: "USDT",
    walletAddress: "",
    date: new Date().toLocaleDateString("ru-RU"),
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const isCashToCrypto = contractType === "cash-to-crypto";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <div className="print:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Договор обмена {isCashToCrypto ? "наличных средств" : "криптовалюты"}
          </h1>
          <p className="text-sm text-gray-400">Экземпляр договора</p>
        </div>

        <div className="flex justify-center mb-8 print:hidden">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setContractType("cash-to-crypto")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isCashToCrypto
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon name="Banknote" size={16} />
              Наличные → Крипто
            </button>
            <button
              onClick={() => setContractType("crypto-to-cash")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                !isCashToCrypto
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon name="Bitcoin" size={16} fallback="Coins" />
              Крипто → Наличные
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6 md:p-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                BLQOU
              </span>
              <p className="text-xs text-gray-400 mt-1">
                {isCashToCrypto ? "Наличные → Криптовалюта" : "Криптовалюта → Наличные"}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>Дата: <span className="text-gray-900 font-medium">{formData.date}</span></p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-base font-semibold text-gray-900">1. Стороны договора</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">ФИО клиента</label>
                <Input
                  placeholder="Иванов Иван Иванович"
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 print:border-0 print:border-b print:border-gray-300 print:rounded-none print:px-0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">ФИО менеджера</label>
                <Input
                  placeholder="Петров Пётр Петрович"
                  value={formData.managerName}
                  onChange={(e) => handleChange("managerName", e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 print:border-0 print:border-b print:border-gray-300 print:rounded-none print:px-0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-base font-semibold text-gray-900">2. Параметры обмена</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {isCashToCrypto ? "Сумма наличных" : "Сумма криптовалюты"}
                </label>
                <Input
                  placeholder={isCashToCrypto ? "100 000 ₽" : "1 000 USDT"}
                  value={formData.exchangeAmount}
                  onChange={(e) => handleChange("exchangeAmount", e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 print:border-0 print:border-b print:border-gray-300 print:rounded-none print:px-0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {isCashToCrypto ? "Валюта получения (крипто)" : "Валюта выдачи (наличные)"}
                </label>
                <Input
                  placeholder={isCashToCrypto ? "USDT / BTC / ETH" : "RUB / USD / EUR"}
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 print:border-0 print:border-b print:border-gray-300 print:rounded-none print:px-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {isCashToCrypto
                  ? "Адрес кошелька для отправки криптовалюты"
                  : "Адрес кошелька, с которого отправляется криптовалюта"}
              </label>
              <Input
                placeholder="0x... / bc1... / T..."
                value={formData.walletAddress}
                onChange={(e) => handleChange("walletAddress", e.target.value)}
                className="h-11 border-gray-200 focus:border-blue-500 font-mono text-sm print:border-0 print:border-b print:border-gray-300 print:rounded-none print:px-0"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900">3. Условия договора</h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              {isCashToCrypto ? (
                <>
                  <p>
                    3.1. Клиент передаёт Менеджеру наличные денежные средства в размере, указанном в
                    разделе «Параметры обмена», для обмена на криптовалюту.
                  </p>
                  <p>
                    3.2. Менеджер обязуется отправить криптовалюту на указанный Клиентом адрес кошелька
                    в течение срока, согласованного сторонами при личной встрече.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    3.1. Клиент отправляет криптовалюту в размере, указанном в разделе «Параметры обмена»,
                    на кошелёк Менеджера для обмена на наличные денежные средства.
                  </p>
                  <p>
                    3.2. Менеджер обязуется выдать Клиенту наличные денежные средства в согласованной
                    валюте и сумме после подтверждения поступления криптовалюты в блокчейн-сети.
                  </p>
                </>
              )}
              <p>
                3.3. Курс обмена фиксируется на момент подписания настоящего Договора и не подлежит
                изменению после передачи средств.
              </p>
              <p>
                3.4. Стороны подтверждают, что ознакомлены с рисками, связанными с операциями с
                криптовалютами, включая волатильность курсов и необратимость блокчейн-транзакций.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900">4. Заявление о происхождении средств</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900 leading-relaxed">
                  Подписывая настоящий Договор, Клиент заявляет и гарантирует, что{" "}
                  {isCashToCrypto ? "денежные средства" : "криптовалюта"}, передаваемые для обмена,{" "}
                  <strong>получены законным путём</strong> и не являются результатом преступной деятельности,
                  мошенничества, уклонения от уплаты налогов или иных противоправных действий. Клиент несёт
                  полную ответственность за достоверность данного заявления в соответствии с действующим
                  законодательством.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900">5. Ответственность</h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              {isCashToCrypto ? (
                <p>
                  5.1. В случае предоставления Клиентом некорректного адреса кошелька, Менеджер не несёт
                  ответственности за утрату средств.
                </p>
              ) : (
                <p>
                  5.1. В случае отправки Клиентом криптовалюты на неверный адрес или в неверной сети,
                  Менеджер не несёт ответственности за утрату средств.
                </p>
              )}
              <p>
                5.2. В случае обнаружения, что средства получены преступным путём, Менеджер оставляет
                за собой право отказать в проведении операции и передать имеющуюся информацию
                компетентным органам.
              </p>
              <p>
                5.3. Настоящий Договор составлен в двух экземплярах — по одному для каждой из сторон.
                Оба экземпляра имеют равную юридическую силу.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-6">6. Подписи сторон</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</p>
                <div className="border-b-2 border-gray-300 pb-1 min-h-[40px] flex items-end">
                  <span className="text-sm text-gray-400 italic print:text-transparent">подпись</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.clientName || <span className="text-gray-300">ФИО клиента</span>}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Менеджер</p>
                <div className="border-b-2 border-gray-300 pb-1 min-h-[40px] flex items-end">
                  <span className="text-sm text-gray-400 italic print:text-transparent">подпись</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.managerName || <span className="text-gray-300">ФИО менеджера</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center print:hidden">
          <Button
            onClick={handlePrint}
            className="h-11 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl gap-2"
          >
            <Icon name="Printer" size={16} />
            Распечатать договор
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeContract;
