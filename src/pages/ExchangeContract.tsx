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
    cashAmount: "",
    cashCurrency: "RUB",
    cryptoAmount: "",
    cryptoCurrency: "USDT",
    exchangeRate: "",
    walletAddress: "",
    clientTelegram: "",
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
            margin: 0;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; }
          .no-print { display: none !important; }
          .contract-outer { min-height: auto !important; background: white !important; }
          .contract-page { padding: 14mm 16mm 12mm 16mm !important; max-width: 100% !important; margin: 0 !important; }
          .contract-box { border: 1.5px solid #e5e7eb !important; border-radius: 12px !important; padding: 24px 28px !important; }
          .contract-box * { font-size: 11px !important; line-height: 1.5 !important; }
          .contract-box h1 { font-size: 17px !important; line-height: 1.3 !important; }
          .contract-box h2 { font-size: 12.5px !important; line-height: 1.4 !important; }
          .contract-box .logo-text { font-size: 18px !important; }
          .contract-box input { height: 28px !important; font-size: 11px !important; border: 1px solid #d1d5db !important; border-radius: 6px !important; padding: 2px 8px !important; background: white !important; }
          .contract-box .mono-input { font-family: monospace !important; font-size: 10px !important; }
          .contract-box .warn-box { background: #fffbeb !important; border: 1px solid #fcd34d !important; border-radius: 8px !important; padding: 10px 14px !important; }
          .contract-box .warn-box p { color: #78350f !important; }
          .contract-box .sig-line { min-height: 36px !important; border-bottom: 1.5px solid #d1d5db !important; }
          .print-page-break { break-before: page; page-break-before: always; margin-top: 0 !important; padding-top: 14mm !important; }
          .page2-header { display: flex !important; }
        }
      `}</style>

      <div className="contract-outer min-h-screen bg-white">
        <div className="contract-page max-w-3xl mx-auto px-4 py-10 md:py-16">
          <div className="no-print">
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

          <div className="flex justify-center mb-8 no-print">
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

          <div className="contract-box border border-gray-200 rounded-2xl p-6 md:p-10 space-y-7">
            {/* === СТРАНИЦА 1 === */}
            <div className="flex flex-col md:flex-row justify-between gap-4 pb-5 border-b border-gray-100">
              <div>
                <span className="logo-text text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  BLQOU
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {isCashToCrypto ? "Наличные → Криптовалюта" : "Криптовалюта → Наличные"}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <label className="block text-xs font-medium text-gray-500 mb-1">Дата</label>
                <Input
                  placeholder="__.__.____"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="h-9 w-40 border-gray-200 focus:border-blue-500 text-sm"
                />
                <label className="block text-xs font-medium text-gray-500 mt-2 mb-1">Город</label>
                <Input
                  placeholder="г. Москва"
                  value={formData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="h-9 w-40 border-gray-200 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">1. Стороны договора</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">ФИО клиента</label>
                  <Input
                    placeholder="Иванов Иван Иванович"
                    value={formData.clientName}
                    onChange={(e) => handleChange("clientName", e.target.value)}
                    className="h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">ФИО менеджера</label>
                  <Input
                    placeholder="Петров Пётр Петрович"
                    value={formData.managerName}
                    onChange={(e) => handleChange("managerName", e.target.value)}
                    className="h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Telegram клиента</label>
                <Input
                  placeholder="@username"
                  value={formData.clientTelegram}
                  onChange={(e) => handleChange("clientTelegram", e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 md:w-1/2"
                />
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">2. Параметры обмена</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Сумма наличных</label>
                  <Input
                    placeholder="100 000"
                    value={formData.cashAmount}
                    onChange={(e) => handleChange("cashAmount", e.target.value)}
                    className="h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Валюта наличных</label>
                  <Input
                    placeholder="RUB / USD / EUR / CHF"
                    value={formData.cashCurrency}
                    onChange={(e) => handleChange("cashCurrency", e.target.value)}
                    className="h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Криптовалюта</label>
                  <Input
                    placeholder="USDT / BTC / ETH"
                    value={formData.cryptoCurrency}
                    onChange={(e) => handleChange("cryptoCurrency", e.target.value)}
                    className="h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Сумма криптовалюты</label>
                  <Input
                    placeholder="1 000"
                    value={formData.cryptoAmount}
                    onChange={(e) => handleChange("cryptoAmount", e.target.value)}
                    className="h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Курс обмена (1 {formData.cryptoCurrency || "крипто"} = ? {formData.cashCurrency || "нал."})
                </label>
                <Input
                  placeholder="95.50"
                  value={formData.exchangeRate}
                  onChange={(e) => handleChange("exchangeRate", e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 md:w-1/2"
                />
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
                  className="mono-input h-11 border-gray-200 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">3. Условия договора</h2>
              <div className="text-sm text-gray-600 space-y-2.5 leading-relaxed">
                {isCashToCrypto ? (
                  <>
                    <p>
                      3.1. Клиент передаёт Менеджеру наличные денежные средства в размере{" "}
                      <strong>{formData.cashAmount || "___"} {formData.cashCurrency || "___"}</strong> для
                      обмена на криптовалюту <strong>{formData.cryptoCurrency || "___"}</strong> в
                      количестве <strong>{formData.cryptoAmount || "___"}</strong>.
                    </p>
                    <p>
                      3.2. Менеджер обязуется отправить криптовалюту на указанный Клиентом адрес кошелька
                      в течение срока, согласованного сторонами при личной встрече.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      3.1. Клиент отправляет криптовалюту <strong>{formData.cryptoCurrency || "___"}</strong> в
                      количестве <strong>{formData.cryptoAmount || "___"}</strong> на кошелёк Менеджера для
                      обмена на наличные денежные средства в размере{" "}
                      <strong>{formData.cashAmount || "___"} {formData.cashCurrency || "___"}</strong>.
                    </p>
                    <p>
                      3.2. Менеджер обязуется выдать Клиенту наличные денежные средства в указанной
                      сумме и валюте после подтверждения поступления криптовалюты в блокчейн-сети.
                    </p>
                  </>
                )}
                <p>
                  3.3. Курс обмена составляет{" "}
                  <strong>1 {formData.cryptoCurrency || "___"} = {formData.exchangeRate || "___"} {formData.cashCurrency || "___"}</strong>.
                  Курс фиксируется на момент создания заявки и не подлежит изменению после подписания настоящего Договора.
                </p>
                <p>
                  3.4. Стороны подтверждают, что ознакомлены с рисками, связанными с операциями с
                  криптовалютами, включая волатильность курсов и необратимость блокчейн-транзакций.
                </p>
              </div>
            </div>

            {/* === СТРАНИЦА 2 === */}
            <div className="print-page-break" />

            <div className="page2-header hidden justify-between items-center pb-3 border-b border-gray-100">
              <span className="logo-text text-lg font-bold tracking-tight bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">BLQOU</span>
              <span className="text-xs text-gray-400">Договор обмена — стр. 2</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">4. Заявление о происхождении средств</h2>
              <div className="warn-box bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={18} className="text-amber-600 mt-0.5 flex-shrink-0 no-print" />
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

            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">5. Ответственность</h2>
              <div className="text-sm text-gray-600 space-y-2.5 leading-relaxed">
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

            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">6. Заключительные положения</h2>
              <div className="text-sm text-gray-600 space-y-2.5 leading-relaxed">
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

            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-6">7. Подписи сторон</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</p>
                  <p className="text-sm text-gray-700">
                    {formData.clientName || <span className="text-gray-300">____________________________</span>}
                  </p>
                  <div className="sig-line border-b-2 border-gray-300 pb-1 min-h-[40px] flex items-end">
                    <span className="text-sm text-gray-400 italic">подпись</span>
                  </div>
                  <p className="text-xs text-gray-400">Дата: _______________</p>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Менеджер</p>
                  <p className="text-sm text-gray-700">
                    {formData.managerName || <span className="text-gray-300">____________________________</span>}
                  </p>
                  <div className="sig-line border-b-2 border-gray-300 pb-1 min-h-[40px] flex items-end">
                    <span className="text-sm text-gray-400 italic">подпись</span>
                  </div>
                  <p className="text-xs text-gray-400">Дата: _______________</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3 no-print">
            <Button
              onClick={handlePrint}
              className="h-11 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl gap-2"
            >
              <Icon name="Printer" size={16} />
              Распечатать
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-11 px-8 font-medium rounded-xl gap-2 border-gray-300 hover:bg-gray-50"
            >
              <Icon name="Download" size={16} />
              Сохранить PDF
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExchangeContract;