"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Exchange {
  id: number;
  short_id?: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  to_amount: string;
  rate: string;
  deposit_address: string;
  output_address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ExchangesTableProps {
  exchanges?: Exchange[];
  className?: string;
}

type SortField = "id" | "from_currency" | "from_amount" | "status" | "created_at";
type SortOrder = "asc" | "desc";

export function ExchangesTable({
  exchanges: initialExchanges = [],
  className = "",
}: ExchangesTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const sortedExchanges = useMemo(() => {
    if (!sortField) return initialExchanges;
    return [...initialExchanges].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];
      if (sortField === "created_at") {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }
      if (sortField === "from_amount") {
        aVal = parseFloat(a.from_amount);
        bVal = parseFloat(b.from_amount);
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [initialExchanges, sortField, sortOrder]);

  const paginatedExchanges = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedExchanges.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [sortedExchanges, currentPage]);

  const totalPages = Math.ceil(sortedExchanges.length / ITEMS_PER_PAGE);

  const getStatusStyle = (status: string) => {
    const map: Record<string, { bg: string; border: string; text: string; dot: string }> = {
      "Ожидает оплаты": { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
      "Оплата получена": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
      "В обработке": { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500" },
      "Отправлено": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
      "Завершено": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-500" },
      "Отменено": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
      "Оплата отправлена": { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", dot: "bg-cyan-500" },
      "Не оплачена": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
    };
    return map[status] || { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", dot: "bg-gray-500" };
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yy} | ${hh}:${min}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (initialExchanges.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <p className="text-gray-500 text-lg">У вас пока нет обменов</p>
        <p className="text-gray-400 text-sm mt-2">Создайте первый обмен на вкладке "Обмен"</p>
      </div>
    );
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-gray-800 transition-colors">
      {label}
      {sortField === field && (
        <ChevronDown size={12} className={`transition-transform ${sortOrder === "asc" ? "" : "rotate-180"}`} />
      )}
    </button>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {paginatedExchanges.map((ex) => {
          const st = getStatusStyle(ex.status);
          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl bg-white p-4 cursor-pointer active:bg-gray-50"
              onClick={() => ex.short_id ? navigate(`/order/${ex.short_id}`) : setExpandedRow(expandedRow === ex.id ? null : ex.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-gray-500">#{ex.short_id || ex.id}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-sm border ${st.bg} ${st.border} ${st.text}`}>
                  <span className={`w-1 h-1 rounded-full ${st.dot}`}></span>
                  {ex.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-800">
                    {parseFloat(ex.from_amount).toFixed(6)} {ex.from_currency}
                  </p>
                  <p className="font-mono text-xs text-gray-500 mt-0.5">
                    → {parseFloat(ex.to_amount).toFixed(6)} {ex.to_currency}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">{formatDate(ex.created_at)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block border-2 border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-neutral-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <SortButton field="id" label="ID" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <SortButton field="created_at" label="Дата" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Пара
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <SortButton field="from_amount" label="Отдаёте" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Получаете
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <SortButton field="status" label="Статус" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedExchanges.map((ex) => {
                  const st = getStatusStyle(ex.status);
                  const isExpanded = expandedRow === ex.id;
                  return (
                    <React.Fragment key={ex.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : ex.id)}
                      >
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">#{ex.short_id || ex.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ex.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {ex.from_currency} → {ex.to_currency}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-800">{parseFloat(ex.from_amount).toFixed(6)} {ex.from_currency}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-800">{parseFloat(ex.to_amount).toFixed(6)} {ex.to_currency}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm border ${st.bg} ${st.border} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                            {ex.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </td>
                      </motion.tr>
                      {isExpanded && (
                        <tr className="bg-neutral-50">
                          <td colSpan={7} className="p-0 overflow-hidden">
                            <div className="px-6 animate-slide-down overflow-hidden">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Адрес пополнения</p>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono text-xs break-all text-gray-700">{ex.deposit_address}</p>
                                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(ex.deposit_address); }} className="text-gray-400 hover:text-gray-800">
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Адрес получения</p>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono text-xs break-all text-gray-700">{ex.output_address}</p>
                                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(ex.output_address); }} className="text-gray-400 hover:text-gray-800">
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Курс</p>
                                  <p className="font-mono text-sm text-gray-800">1 {ex.from_currency} = {parseFloat(ex.rate).toFixed(6)} {ex.to_currency}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Обновлено</p>
                                  <p className="text-sm text-gray-600">{ex.updated_at ? formatDate(ex.updated_at) : '—'}</p>
                                </div>
                              </div>
                              {ex.short_id && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate(`/order/${ex.short_id}`); }}
                                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider hover:bg-blue-600 rounded transition-colors"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                  Отследить заказ
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs md:text-sm text-gray-500">
            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedExchanges.length)} из {sortedExchanges.length}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2.5 md:px-3 py-1 text-xs md:text-sm border rounded transition-colors ${
                  currentPage === i + 1 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExchangesTable;