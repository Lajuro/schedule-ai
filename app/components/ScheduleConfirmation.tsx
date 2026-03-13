"use client";

import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarPicker from "./CalendarPicker";
import ImageLightbox from "./ImageLightbox";
import { syncSingleDate } from "../actions/syncSingleDate";

interface ScheduleConfirmationProps {
  data: {
    detected_month: string;
    work_days: string[];
    reasoning: string;
  };
  imageUrl: string;
  onBack: () => void;
  accessToken: string;
}

interface SyncStatus {
  date: string;
  status: "pending" | "syncing" | "inserted" | "skipped" | "error";
  message?: string;
  errorCode?: "auth" | "permission" | "unknown";
}

export default function ScheduleConfirmation({
  data,
  imageUrl,
  onBack,
  accessToken,
}: ScheduleConfirmationProps) {
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    new Set(data.work_days)
  );
  const [currentMonth, setCurrentMonth] = useState(data.detected_month);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatuses, setSyncStatuses] = useState<Map<string, SyncStatus>>(
    new Map()
  );
  const [isComplete, setIsComplete] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [authError, setAuthError] = useState(false);

  const toggleDay = useCallback((date: string) => {
    if (isSyncing) return;
    
    setSelectedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  }, [isSyncing]);

  const handleMonthChange = useCallback((newMonth: string) => {
    const [newYear, newMonthNum] = newMonth.split("-").map(Number);
    const daysInNewMonth = new Date(newYear, newMonthNum, 0).getDate();

    // Remap every selected date to the new year/month, dropping invalid days
    setSelectedDays((prev) => {
      const remapped = new Set<string>();
      prev.forEach((date) => {
        const dayNum = parseInt(date.split("-")[2], 10);
        if (dayNum <= daysInNewMonth) {
          remapped.add(
            `${newYear}-${String(newMonthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
          );
        }
      });
      return remapped;
    });

    setCurrentMonth(newMonth);
  }, []);

  const handleSync = async () => {
    if (selectedDays.size === 0) return;

    setIsSyncing(true);
    setIsComplete(false);
    setAuthError(false);

    const sortedDates = Array.from(selectedDays).sort((a, b) =>
      a.localeCompare(b)
    );

    // Inicializar status de todos como pending
    const initialStatuses = new Map<string, SyncStatus>();
    sortedDates.forEach((date) => {
      initialStatuses.set(date, { date, status: "pending" });
    });
    setSyncStatuses(initialStatuses);

    // Sincronizar um por um com delay para UX
    for (const date of sortedDates) {
      // Marcar como syncing
      setSyncStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(date, { date, status: "syncing" });
        return newMap;
      });

      // Pequeno delay para visualização
      await new Promise((resolve) => setTimeout(resolve, 150));

      try {
        const result = await syncSingleDate(date, accessToken);

        setSyncStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(date, {
            date,
            status: result.status,
            message: result.message,
            errorCode: result.errorCode,
          });
          return newMap;
        });

        if (result.status === "error" && result.errorCode === "auth") {
          // Se for erro de autenticação, abortar os restantes
          setAuthError(true);

          // Marcar todos os pendentes como erro de auth
          setSyncStatuses((prev) => {
            const newMap = new Map(prev);
            for (const d of sortedDates) {
              const current = newMap.get(d);
              if (current && (current.status === "pending" || current.status === "syncing")) {
                newMap.set(d, {
                  date: d,
                  status: "error",
                  message: "Sessão expirada",
                  errorCode: "auth",
                });
              }
            }
            return newMap;
          });
          break;
        }
      } catch {
        setSyncStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(date, { date, status: "error", message: "Erro inesperado", errorCode: "unknown" });
          return newMap;
        });
      }
    }

    setIsSyncing(false);
    setIsComplete(true);
  };

  // Dias processados com sucesso
  const processedDays = new Set(
    Array.from(syncStatuses.entries())
      .filter(([, status]) => status.status === "inserted" || status.status === "skipped")
      .map(([date]) => date)
  );

  // Estatísticas
  const stats = {
    total: selectedDays.size,
    inserted: Array.from(syncStatuses.values()).filter((s) => s.status === "inserted").length,
    skipped: Array.from(syncStatuses.values()).filter((s) => s.status === "skipped").length,
    errors: Array.from(syncStatuses.values()).filter((s) => s.status === "error").length,
    pending: Array.from(syncStatuses.values()).filter((s) => s.status === "pending" || s.status === "syncing").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            Confirmar Plantões Detectados
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            A IA detectou{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {data.work_days.length} dias
            </span>{" "}
            de plantão. Revise e ajuste no calendário.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Novo Upload
        </motion.button>
      </motion.div>

      {/* Raciocínio da IA */}
      {data.reasoning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50">
              <svg
                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Análise da IA
              </p>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">{data.reasoning}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Layout Principal - Side by Side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Coluna Esquerda - Imagem */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-900 dark:shadow-gray-950/50"
        >
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Imagem Analisada
          </h3>
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => setIsLightboxOpen(true)}
            className="group relative cursor-zoom-in overflow-hidden rounded-xl border-2 border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            <img
              src={imageUrl}
              alt="Calendário analisado"
              className="h-auto w-full object-contain"
              style={{ maxHeight: "400px" }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
              <div className="scale-0 rounded-full bg-white/90 p-3 shadow-lg transition-transform group-hover:scale-100">
                <svg
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Clique para ampliar
          </p>
        </motion.div>

        {/* Coluna Direita - Calendário */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CalendarPicker
            month={currentMonth}
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
            processedDays={processedDays}
            onMonthChange={handleMonthChange}
            disableMonthEdit={isSyncing}
          />
        </motion.div>
      </div>

      {/* Status da Sincronização */}
      <AnimatePresence>
        {(isSyncing || isComplete) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-900 dark:shadow-gray-950/50"
          >
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isSyncing ? "Sincronizando..." : "Sincronização Concluída"}
            </h3>

            {/* Barra de progresso */}
            <div className="mb-4">
              <div className="mb-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {stats.inserted + stats.skipped + stats.errors} de {stats.total}
                </span>
                <span>
                  {Math.round(
                    ((stats.inserted + stats.skipped + stats.errors) / stats.total) * 100
                  )}
                  %
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      ((stats.inserted + stats.skipped + stats.errors) / stats.total) * 100
                    }%`,
                  }}
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Banner de erro de autenticação */}
            {authError && isComplete && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
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
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                      Sessão expirada
                    </p>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      Sua autenticação com o Google expirou. Faça login novamente para sincronizar seus plantões.
                    </p>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Fazer login novamente
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Banner de erro genérico (não auth) */}
            {!authError && isComplete && stats.errors > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
                    <svg
                      className="h-5 w-5 text-amber-600 dark:text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      Alguns plantões não foram sincronizados
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      {stats.errors} {stats.errors === 1 ? "plantão não pôde ser adicionado" : "plantões não puderam ser adicionados"} ao Google Calendar. Tente novamente mais tarde.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Lista de dias com status */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from(syncStatuses.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, status]) => {
                  const day = new Date(date + "T12:00:00").getDate();
                  const month = new Date(date + "T12:00:00").toLocaleDateString(
                    "pt-BR",
                    { month: "short" }
                  );

                  return (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      title={status.message || ""}
                      className={`flex items-center gap-2 rounded-lg p-2 text-xs ${
                        status.status === "syncing"
                          ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300"
                          : status.status === "inserted"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                          : status.status === "skipped"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          : status.status === "error"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                          : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {status.status === "syncing" ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                      ) : status.status === "inserted" ? (
                        <svg
                          className="h-3 w-3 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : status.status === "skipped" ? (
                        <svg
                          className="h-3 w-3 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : status.status === "error" ? (
                        <svg
                          className="h-3 w-3 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                      <span className="font-medium">
                        {day} {month}
                      </span>
                    </motion.div>
                  );
                })}
            </div>

            {/* Resumo final */}
            {isComplete && !authError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-950/30 dark:to-emerald-950/30"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.inserted}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Adicionados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.skipped}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Já existiam</p>
                </div>
                {stats.errors > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.errors}</p>
                    <p className="text-xs text-red-700 dark:text-red-300">Erros</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de Sincronizar */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            disabled={isSyncing || selectedDays.size === 0}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Sincronizando {selectedDays.size} plantões...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Sincronizar {selectedDays.size}{" "}
                  {selectedDays.size === 1 ? "Plantão" : "Plantões"} com Google
                  Calendar
                </span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Botão de novo upload após completar */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Fazer Novo Upload
          </motion.button>
        </motion.div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        src={imageUrl}
        alt="Calendário analisado"
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </motion.div>
  );
}
