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
    date: "",
    city: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = " ";
    window.print();
    document.title = originalTitle;
  };

  const isCashToCrypto = contractType === "cash-to-crypto";

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 18mm 16mm 16mm 16mm;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          title { display: none; }
          header, footer, nav { display: none !important; }
          .print-page-break { page-break-before: always; }
          .contract-page { padding: 0 !important; max-width: 100% !important; }
          .contract-border { border: none !important; border-radius: 0 !important; padding: 0 !important; }
          .print-input { border: none !important; border-bottom: 1.5px solid #9ca3af !important; border-radius: 0 !important; padding-left: 0 !important; padding-right: 0 !important; box-shadow: none !important; background: transparent !important; font-size: 13px !important; height: 32px !important; }
          .print-label { font-size: 10px !important; }
          .print-section-title { font-size: 13px !important; }
          .print-text { font-size: 12px !important; line-height: 1.6 !important; }
          .print-header-logo { font-size: 20px !important; }
          .print-warning { padding: 12px !important; }
          .print-warning p { font-size: 11px !important; }
          .print-signature-line { min-height: 50px !important; }
          .contract-title { font-size: 18px !important; }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        <div className="contract-page max-w-3xl mx-auto px-4 py-10 md:py-16">
          <div className="print:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
            >
              <Icon name="ArrowLeft" size={16} />
              На главную
            </Link>
          </div>

          <div className="text-center mb-6 print:mb-4">
            <h1 className="contract-title text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Договор обмена {isCashToCrypto ? "наличных средств" : "криптовалюты"}
            </h1>
            <p className="text-sm text-gray-400 print:text-xs">Экземпляр договора</p>
          </div>

          <div className="flex justify-center mb-8 print:hidden">
            <div className="inline-flex bg-gray-100 rounded-xl p-1.5 gap-1">
              <button
                onClick={() => setContractType("cash-to-crypto")}
                className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2.5 ${
                  isCashToCrypto
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon name="Banknote" size={18} />
                Наличные → Крипто
              </button>
              <button
                onClick={() => setContractType("crypto-to-cash")}
                className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2.5 ${
                  !isCashToCrypto
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon name="Bitcoin" size={18} fallback="Coins" />
                Крипто → Наличные
              </button>
            </div>
          </div>

          <div className="contract-border border border-gray-200 rounded-2xl p-6 md:p-10 space-y-7 print:space-y-5">
            {/* === СТРАНИЦА 1: Шапка + Стороны + Параметры + Условия === */}
            <div className="flex flex-col md:flex-row justify-between gap-4 pb-5 border-b border-gray-100 print:pb-3">
              <div>
                <span className="print-header-logo text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent print:text-blue-600">
                  BLQOU
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {isCashToCrypto ? "Наличные → Криптовалюта" : "Криптовалюта → Наличные"}
                </p>
              </div>
              <div className="text-sm text-gray-500 print:text-xs">
                <label className="print-label block text-xs font-medium text-gray-500 mb-1">Дата</label>
                <Input
                  placeholder="__.__.____"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="print-input h-9 w-40 border-gray-200 focus:border-blue-500 text-sm"
                />
                <label className="print-label block text-xs font-medium text-gray-500 mt-2 mb-1">Город</label>
                <Input
                  placeholder="г. Москва"
                  value={formData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="print-input h-9 w-40 border-gray-200 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-5 print:space-y-3">
              <h2 className="print-section-title text-base font-semibold text-gray-900">1. Стороны договора</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                <div>
                  <label className="print-label block text-xs font-medium text-gray-500 mb-1.5 print:mb-1">ФИО клиента</label>
                  <Input
                    placeholder="Иванов Иван Иванович"
                    value={formData.clientName}
                    onChange={(e) => handleChange("clientName", e.target.value)}
                    className="print-input h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="print-label block text-xs font-medium text-gray-500 mb-1.5 print:mb-1">ФИО менеджера</label>
                  <Input
                    placeholder="Петров Пётр Петрович"
                    value={formData.managerName}
                    onChange={(e) => handleChange("managerName", e.target.value)}
                    className="print-input h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 print:space-y-3">
              <h2 className="print-section-title text-base font-semibold text-gray-900">2. Параметры обмена</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                <div>
                  <label className="print-label block text-xs font-medium text-gray-500 mb-1.5 print:mb-1">
                    {isCashToCrypto ? "Сумма наличных" : "Сумма криптовалюты"}
                  </label>
                  <Input
                    placeholder={isCashToCrypto ? "100 000 ₽" : "1 000 USDT"}
                    value={formData.exchangeAmount}
                    onChange={(e) => handleChange("exchangeAmount", e.target.value)}
                    className="print-input h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="print-label block text-xs font-medium text-gray-500 mb-1.5 print:mb-1">
                    {isCashToCrypto ? "Валюта получения (крипто)" : "Валюта выдачи (наличные)"}
                  </label>
                  <Input
                    placeholder={isCashToCrypto ? "USDT / BTC / ETH" : "RUB / USD / EUR"}
                    value={formData.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="print-input h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="print-label block text-xs font-medium text-gray-500 mb-1.5 print:mb-1">
                  {isCashToCrypto
                    ? "Адрес кошелька для отправки криптовалюты"
                    : "Адрес кошелька, с которого отправляется криптовалюта"}
                </label>
                <Input
                  placeholder="0x... / bc1... / T..."
                  value={formData.walletAddress}
                  onChange={(e) => handleChange("walletAddress", e.target.value)}
                  className="print-input h-11 border-gray-200 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-3 print:space-y-2">
              <h2 className="print-section-title text-base font-semibold text-gray-900">3. Условия договора</h2>
              <div className="print-text text-sm text-gray-600 space-y-2.5 leading-relaxed">
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

            {/* === СТРАНИЦА 2: Происхождение + Ответственность + Подписи === */}
            <div className="print-page-break" />

            <div className="hidden print:flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-lg font-bold tracking-tight text-blue-600">BLQOU</span>
              <span className="text-xs text-gray-400">Договор обмена — стр. 2</span>
            </div>

            <div className="space-y-3 print:space-y-2">
              <h2 className="print-section-title text-base font-semibold text-gray-900">4. Заявление о происхождении средств</h2>
              <div className="print-warning bg-amber-50 border border-amber-200 rounded-xl p-5 print:rounded-lg print:border-amber-300">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={18} className="text-amber-600 mt-0.5 flex-shrink-0 print:hidden" />
                  <p className="print-text text-sm text-amber-900 leading-relaxed">
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

            <div className="space-y-3 print:space-y-2">
              <h2 className="print-section-title text-base font-semibold text-gray-900">5. Ответственность</h2>
              <div className="print-text text-sm text-gray-600 space-y-2.5 leading-relaxed">
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

            <div className="space-y-3 print:space-y-2">
              <h2 className="print-section-title text-base font-semibold text-gray-900">6. Заключительные положения</h2>
              <div className="print-text text-sm text-gray-600 space-y-2.5 leading-relaxed">
                <p>
                  6.1. Все споры и разногласия, возникающие в связи с исполнением настоящего Договора,
                  разрешаются путём переговоров между сторонами.
                </p>
                <p>
                  6.2. Настоящий Договор вступает в силу с момента его подписания обеими сторонами
                  и действует до полного исполнения сторонами своих обязательств.
                </p>
                <p>
                  6.3. Любые изменения и дополнения к настоящему Договору действительны только
                  при условии их письменного оформления и подписания обеими сторонами.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 print:pt-8 print:mt-6">
              <h2 className="print-section-title text-base font-semibold text-gray-900 mb-6 print:mb-8">7. Подписи сторон</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-12">
                <div className="space-y-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</p>
                  <p className="text-sm text-gray-700 print:text-xs">
                    {formData.clientName || <span className="text-gray-300 print:text-gray-400">____________________________</span>}
                  </p>
                  <div className="print-signature-line border-b-2 border-gray-300 pb-1 min-h-[40px] flex items-end">
                    <span className="text-sm text-gray-400 italic print:text-xs">подпись</span>
                  </div>
                  <p className="text-xs text-gray-400">Дата: _______________</p>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Менеджер</p>
                  <p className="text-sm text-gray-700 print:text-xs">
                    {formData.managerName || <span className="text-gray-300 print:text-gray-400">____________________________</span>}
                  </p>
                  <div className="print-signature-line border-b-2 border-gray-300 pb-1 min-h-[40px] flex items-end">
                    <span className="text-sm text-gray-400 italic print:text-xs">подпись</span>
                  </div>
                  <p className="text-xs text-gray-400">Дата: _______________</p>
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
    </>
  );
};

export default ExchangeContract;