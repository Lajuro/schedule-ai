"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listPlantaoEvents, deleteSingleEvent } from "../actions/deleteEvents";

type DeleteStatus = "pending" | "deleting" | "deleted" | "error";

interface EventManagerProps {
  readonly accessToken: string;
  readonly onClose: () => void;
}

function getButtonClassName(status: DeleteStatus | undefined, isSelected: boolean): string {
  if (status === "deleted") return "bg-green-100 text-green-700";
  if (status === "deleting") return "bg-yellow-100 text-yellow-700";
  if (status === "error") return "bg-red-100 text-red-700";
  if (isSelected) return "bg-red-500 text-white shadow-md";
  return "bg-gray-100 text-gray-600 hover:bg-gray-200";
}

export default function EventManager({ accessToken, onClose }: EventManagerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [existingEvents, setExistingEvents] = useState<Set<string>>(new Set());
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatuses, setDeleteStatuses] = useState<Map<string, DeleteStatus>>(new Map());
  const [isComplete, setIsComplete] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setSelectedToDelete(new Set());
    setDeleteStatuses(new Map());
    setIsComplete(false);

    const result = await listPlantaoEvents(currentMonth, accessToken);
    
    if (result.success) {
      setExistingEvents(new Set(result.dates));
      setSelectedToDelete(new Set(result.dates));
    } else {
      setExistingEvents(new Set());
    }
    
    setIsLoading(false);
  }, [currentMonth, accessToken]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleToggleDay = (date: string) => {
    if (isDeleting) return;
    if (!existingEvents.has(date)) return;

    setSelectedToDelete((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const handleDelete = async () => {
    if (selectedToDelete.size === 0) return;

    setIsDeleting(true);
    setIsComplete(false);

    const sortedDates = Array.from(selectedToDelete).sort((a, b) => a.localeCompare(b));

    const initialStatuses = new Map<string, DeleteStatus>();
    sortedDates.forEach((date) => {
      initialStatuses.set(date, "pending");
    });
    setDeleteStatuses(initialStatuses);

    for (const date of sortedDates) {
      setDeleteStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(date, "deleting");
        return newMap;
      });

      await new Promise((resolve) => setTimeout(resolve, 150));

      try {
        const result = await deleteSingleEvent(date, accessToken);

        const finalStatus: DeleteStatus = (result.status === "deleted" || result.status === "not_found") ? "deleted" : "error";
        setDeleteStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(date, finalStatus);
          return newMap;
        });

        if (result.status === "deleted") {
          setExistingEvents((prev) => {
            const newSet = new Set(prev);
            newSet.delete(date);
            return newSet;
          });
        }
      } catch {
        setDeleteStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(date, "error");
          return newMap;
        });
      }
    }

    setIsDeleting(false);
    setIsComplete(true);
    setSelectedToDelete(new Set());
  };

  const changeMonth = (delta: number) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const newDate = new Date(year, month - 1 + delta, 1);
    setCurrentMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const [year, monthNum] = currentMonth.split("-").map(Number);
  const deletedCount = Array.from(deleteStatuses.values()).filter((s) => s === "deleted").length;
  const errorCount = Array.from(deleteStatuses.values()).filter((s) => s === "error").length;

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
    </div>
  );

  const renderEmptyState = () => (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Nenhum evento de plantão encontrado neste mês</p>
    </div>
  );

  const renderEventsList = () => (
    <>
      <div className="mb-4 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/30">
        <p className="text-sm text-orange-800 dark:text-orange-200">
          <strong>{existingEvents.size}</strong> evento(s) de plantão encontrado(s).
          Clique nos dias para selecionar/desselecionar.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {Array.from(existingEvents)
          .sort((a, b) => a.localeCompare(b))
          .map((date) => {
            const day = new Date(date + "T12:00:00").getDate();
            const weekDay = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" });
            const isSelected = selectedToDelete.has(date);
            const status = deleteStatuses.get(date);

            return (
              <motion.button
                key={date}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleDay(date)}
                disabled={isDeleting}
                className={`relative rounded-xl p-3 text-center transition-all ${getButtonClassName(status, isSelected)}`}
              >
                {status === "deleting" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                  </div>
                )}
                <div className={status === "deleting" ? "opacity-30" : ""}>
                  <div className="text-lg font-bold">{day}</div>
                  <div className="text-xs opacity-70">{weekDay}</div>
                </div>
                {status === "deleted" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow"
                  >
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 rounded-xl bg-green-50 p-4 dark:bg-green-950/30"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  {deletedCount} evento(s) removido(s)!
                </p>
                {errorCount > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errorCount} erro(s)</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const renderContent = () => {
    if (isLoading) return renderLoadingState();
    if (existingEvents.size === 0) return renderEmptyState();
    return renderEventsList();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 dark:shadow-gray-950/50"
      >
        {/* Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 p-4 dark:border-gray-800 dark:from-red-950/30 dark:to-orange-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-2 dark:bg-red-900/50">
                <svg
                  className="h-5 w-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Remover Eventos</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Selecione os plantões para remover</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navegação do mês */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <button
            onClick={() => changeMonth(-1)}
            disabled={isDeleting}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {monthNames[monthNum - 1]} {year}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            disabled={isDeleting}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Fechar
            </button>
            {existingEvents.size > 0 && !isComplete && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                disabled={isDeleting || selectedToDelete.size === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-medium text-white shadow-lg transition-all hover:from-red-600 hover:to-orange-600 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Removendo...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remover {selectedToDelete.size}</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
