"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown } from "lucide-react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

export interface Mix {
  id: number;
  user_username: string;
  currency: string;
  amount: string;
  fee: string;
  delay: string;
  minimum: string;
  preset: string;
  input_address: string;
  output_address: string;
  deposit_address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MixesTableProps {
  mixes?: Mix[];
  onMixSelect?: (mixId: number) => void;
  onColumnResize?: (columnKey: string, newWidth: number) => void;
  className?: string;
  enableAnimations?: boolean;
}

type SortField = "id" | "currency" | "amount" | "status" | "created_at";
type SortOrder = "asc" | "desc";

export function MixesTable({
  mixes: initialMixes = [],
  onMixSelect,
  onColumnResize,
  className = "",
  enableAnimations = true
}: MixesTableProps = {}) {
  const [selectedMixes, setSelectedMixes] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    checkbox: 50,
    id: 80,
    date: 140,
    currency: 120,
    amount: 140,
    status: 160,
    input: 200,
    output: 200
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMixSelect = (mixId: number) => {
    setSelectedMixes(prev => {
      if (prev.includes(mixId)) {
        return prev.filter(id => id !== mixId);
      } else {
        return [...prev, mixId];
      }
    });
    if (onMixSelect) {
      onMixSelect(mixId);
    }
  };

  const handleSelectAll = () => {
    if (selectedMixes.length === paginatedMixes.length) {
      setSelectedMixes([]);
    } else {
      setSelectedMixes(paginatedMixes.map(m => m.id));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setShowSortMenu(false);
    setCurrentPage(1);
  };

  const sortedMixes = useMemo(() => {
    if (!sortField) {
      return initialMixes;
    }

    return [...initialMixes].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === "created_at") {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }

      if (sortField === "amount") {
        aVal = parseFloat(a.amount);
        bVal = parseFloat(b.amount);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [initialMixes, sortField, sortOrder]);

  const paginatedMixes = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedMixes.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [sortedMixes, currentPage]);

  const totalPages = Math.ceil(sortedMixes.length / ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, { bgColor: string; borderColor: string; textColor: string; dotColor: string }> = {
      "В процессе": {
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-700",
        dotColor: "bg-yellow-500"
      },
      "Принят в работу": {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700",
        dotColor: "bg-blue-500"
      },
      "Отправлено": {
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        textColor: "text-purple-700",
        dotColor: "bg-purple-500"
      },
      "Готово!": {
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        dotColor: "bg-green-500"
      }
    };

    return statusMap[status] || {
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      dotColor: "bg-gray-500"
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResize = (columnKey: string, { size }: { size: { width: number } }) => {
    const newWidth = Math.max(80, Math.min(400, size.width));
    
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: newWidth
    }));
    
    if (onColumnResize) {
      onColumnResize(columnKey, newWidth);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Дата", "Валюта", "Сумма", "Статус", "Input Address", "Output Address"];
    const rows = sortedMixes.map(mix => [
      mix.id,
      mix.created_at,
      mix.currency,
      mix.amount,
      mix.status,
      mix.input_address,
      mix.output_address
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mixes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(sortedMixes, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mixes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    }
  };

  const rowVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98,
      filter: "blur(4px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-md shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Сортировка {sortField && <span className="ml-1 text-xs bg-blue-500 text-white rounded-sm px-1.5 py-0.5">1</span>}
              <ChevronDown size={14} className="opacity-50" />
            </button>
            
            {showSortMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => handleSort("id")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${sortField === "id" ? 'bg-gray-100' : ''}`}
                  >
                    ID {sortField === "id" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("currency")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${sortField === "currency" ? 'bg-gray-100' : ''}`}
                  >
                    Валюта {sortField === "currency" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("amount")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${sortField === "amount" ? 'bg-gray-100' : ''}`}
                  >
                    Сумма {sortField === "amount" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("status")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${sortField === "status" ? 'bg-gray-100' : ''}`}
                  >
                    Статус {sortField === "status" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("created_at")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${sortField === "created_at" ? 'bg-gray-100' : ''}`}
                  >
                    Дата {sortField === "created_at" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-md shadow-sm"
            >
              <Download size={14} />
              Экспорт
              <ChevronDown size={14} className="opacity-50" />
            </button>
            
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 shadow-lg rounded-md z-20">
                  <button
                    onClick={() => {
                      exportToCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100"
                  >
                    JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden rounded-lg relative shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="flex py-3 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-center border-r border-gray-200 pr-3" style={{ width: columnWidths.checkbox }}>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-gray-500"
                  checked={paginatedMixes.length > 0 && selectedMixes.length === paginatedMixes.length}
                  onChange={handleSelectAll}
                />
              </div>
              
              <Resizable
                width={columnWidths.id}
                height={0}
                onResize={(e, data) => handleResize('id', data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={<div className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-blue-400 transition-all" />}
              >
                <div className="flex items-center border-r border-gray-200 px-3 relative" style={{ width: columnWidths.id }}>
                  <span>ID</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.date}
                height={0}
                onResize={(e, data) => handleResize('date', data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={<div className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-blue-400 transition-all" />}
              >
                <div className="flex items-center gap-1.5 border-r border-gray-200 px-3 relative" style={{ width: columnWidths.date }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40">
                    <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M6 1V3M10 1V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Дата</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.currency}
                height={0}
                onResize={(e, data) => handleResize('currency', data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={<div className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-blue-400 transition-all" />}
              >
                <div className="flex items-center gap-1.5 border-r border-gray-200 px-3 relative" style={{ width: columnWidths.currency }}>
                  <span>Валюта</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.amount}
                height={0}
                onResize={(e, data) => handleResize('amount', data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={<div className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-blue-400 transition-all" />}
              >
                <div className="flex items-center gap-1.5 border-r border-gray-200 px-3 relative" style={{ width: columnWidths.amount }}>
                  <span>Сумма</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.status}
                height={0}
                onResize={(e, data) => handleResize('status', data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={<div className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-blue-400 transition-all" />}
              >
                <div className="flex items-center gap-1.5 border-r border-gray-200 px-3 relative" style={{ width: columnWidths.status }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40">
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Статус</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.input}
                height={0}
                onResize={(e, data) => handleResize('input', data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={<div className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-blue-400 transition-all" />}
              >
                <div className="flex items-center gap-1.5 border-r border-gray-200 px-3 relative" style={{ width: columnWidths.input }}>
                  <span>Input Address</span>
                </div>
              </Resizable>

              <div className="flex items-center gap-1.5 px-3" style={{ width: columnWidths.output }}>
                <span>Output Address</span>
              </div>
            </div>

            {paginatedMixes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">У вас пока нет миксов</p>
                <p className="text-gray-400 text-sm mt-1">Создайте первый микс во вкладке "Mixer"</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${currentPage}`}
                  variants={shouldAnimate ? containerVariants : {}}
                  initial={shouldAnimate ? "hidden" : "visible"}
                  animate="visible"
                >
                  {paginatedMixes.map((mix) => (
                    <motion.div key={mix.id} variants={shouldAnimate ? rowVariants : {}}>
                      <div
                        className={`py-3.5 group relative transition-all duration-150 border-b border-gray-200 flex ${
                          selectedMixes.includes(mix.id)
                            ? "bg-blue-50" 
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-center border-r border-gray-200 pr-3" style={{ width: columnWidths.checkbox }}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-gray-500"
                            checked={selectedMixes.includes(mix.id)}
                            onChange={() => handleMixSelect(mix.id)}
                          />
                        </div>

                        <div className="flex items-center min-w-0 border-r border-gray-200 px-3" style={{ width: columnWidths.id }}>
                          <span className="text-sm text-gray-900 font-mono font-semibold">#{mix.id}</span>
                        </div>

                        <div className="flex items-center min-w-0 border-r border-gray-200 px-3" style={{ width: columnWidths.date }}>
                          <span className="text-sm text-gray-700 truncate">{formatDate(mix.created_at)}</span>
                        </div>

                        <div className="flex items-center border-r border-gray-200 px-3" style={{ width: columnWidths.currency }}>
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {mix.currency}
                          </span>
                        </div>

                        <div className="flex items-center min-w-0 border-r border-gray-200 px-3" style={{ width: columnWidths.amount }}>
                          <span className="text-sm font-bold text-gray-900 truncate">
                            {mix.amount}
                          </span>
                        </div>

                        <div className="flex items-center border-r border-gray-200 px-3" style={{ width: columnWidths.status }}>
                          {(() => {
                            const { bgColor, textColor, dotColor } = getStatusColor(mix.status);
                            return (
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap ${bgColor} ${textColor} rounded-lg border-2 ${bgColor.replace('bg-', 'border-')}`}>
                                <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`}></div>
                                {mix.status}
                              </div>
                            );
                          })()}
                        </div>

                        <div className="flex items-center min-w-0 border-r border-gray-200 px-3" style={{ width: columnWidths.input }}>
                          <span className="text-sm text-gray-600 font-mono truncate text-xs">
                            {mix.input_address}
                          </span>
                        </div>

                        <div className="flex items-center min-w-0 px-3" style={{ width: columnWidths.output }}>
                          <span className="text-sm text-gray-600 font-mono truncate text-xs">
                            {mix.output_address}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-gray-500">
            Страница {currentPage} из {totalPages} • {sortedMixes.length} миксов
          </div>
          
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md shadow-sm"
            >
              Назад
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md shadow-sm"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
