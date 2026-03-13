"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarPickerProps {
  month: string; // formato YYYY-MM
  selectedDays: Set<string>;
  onToggleDay: (date: string) => void;
  highlightedDays?: Set<string>; // dias sendo processados
  processedDays?: Set<string>; // dias já sincronizados
  onMonthChange?: (newMonth: string) => void; // callback para editar mês/ano manualmente
  disableMonthEdit?: boolean; // desabilita edição durante sincronização
}

export default function CalendarPicker({
  month,
  selectedDays,
  onToggleDay,
  highlightedDays = new Set(),
  processedDays = new Set(),
  onMonthChange,
  disableMonthEdit = false,
}: CalendarPickerProps) {
  const [year, monthNum] = month.split("-").map(Number);

  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [editYear, setEditYear] = useState(String(year));
  const [editMonthNum, setEditMonthNum] = useState(String(monthNum));

  // Keep edit form values in sync when the month prop changes from outside
  useEffect(() => {
    if (!isEditingMonth) {
      setEditYear(String(year));
      setEditMonthNum(String(monthNum));
    }
  }, [year, monthNum, isEditingMonth]);
  
  // Primeiro dia do mês
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo
  
  // Nomes dos dias da semana
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  
  // Nome do mês
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  // Gerar array de dias
  const days: (number | null)[] = [];
  
  // Dias vazios antes do primeiro dia
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Dias do mês
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const formatDate = (day: number) => {
    return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };
  
  const isSelected = (day: number) => selectedDays.has(formatDate(day));
  const isHighlighted = (day: number) => highlightedDays.has(formatDate(day));
  const isProcessed = (day: number) => processedDays.has(formatDate(day));
  
  const isWeekend = (dayIndex: number) => {
    const dayOfWeek = dayIndex % 7;
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const handleOpenEdit = () => {
    setEditYear(String(year));
    setEditMonthNum(String(monthNum));
    setIsEditingMonth(true);
  };

  const handleConfirmEdit = () => {
    const parsedYear = parseInt(editYear, 10);
    const parsedMonth = parseInt(editMonthNum, 10);
    if (
      !isNaN(parsedYear) &&
      parsedYear >= 2000 &&
      parsedYear <= 2100 &&
      parsedMonth >= 1 &&
      parsedMonth <= 12 &&
      onMonthChange
    ) {
      onMonthChange(
        `${parsedYear}-${String(parsedMonth).padStart(2, "0")}`
      );
    }
    setIsEditingMonth(false);
  };

  const handleCancelEdit = () => {
    setIsEditingMonth(false);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-900 dark:shadow-gray-950/50 sm:p-6">
      {/* Header do calendário */}
      <div className="mb-4 text-center">
        {isEditingMonth ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <select
                value={editMonthNum}
                onChange={(e) => setEditMonthNum(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={editYear}
                onChange={(e) => setEditYear(e.target.value)}
                min={2000}
                max={2100}
                className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmEdit}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Confirmar
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              {monthNames[monthNum - 1]} {year}
            </h3>
            {onMonthChange && !disableMonthEdit && (
              <button
                onClick={handleOpenEdit}
                title="Editar mês e ano"
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Clique nos dias para adicionar ou remover
        </p>
      </div>
      
      {/* Dias da semana */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-semibold ${
              index === 0 || index === 6 ? "text-red-400 dark:text-red-500" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          
          const dateStr = formatDate(day);
          const selected = isSelected(day);
          const highlighted = isHighlighted(day);
          const processed = isProcessed(day);
          const weekend = isWeekend(index);
          
          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleDay(dateStr)}
              className={`relative aspect-square rounded-lg text-sm font-medium transition-all ${
                processed
                  ? "bg-green-500 text-white shadow-md"
                  : selected
                  ? "bg-blue-500 text-white shadow-md"
                  : highlighted
                  ? "bg-yellow-400 text-yellow-900 shadow-md"
                  : weekend
                  ? "bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700"
                  : "bg-gray-50 text-gray-700 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-950/50"
              }`}
            >
              {day}
              
              {/* Indicador de selecionado */}
              <AnimatePresence>
                {selected && !processed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 shadow"
                  >
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Indicador de processado */}
              <AnimatePresence>
                {processed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 shadow"
                  >
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      
      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Sincronizado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-gray-50 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"></div>
          <span className="text-gray-600 dark:text-gray-400">Disponível</span>
        </div>
      </div>
    </div>
  );
}
