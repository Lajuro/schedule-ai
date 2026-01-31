"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../providers/SettingsProvider";
import { useTheme } from "../providers/ThemeProvider";

interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const colorOptions = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#22C55E" },
  { name: "Roxo", value: "#A855F7" },
  { name: "Laranja", value: "#F97316" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Ciano", value: "#06B6D4" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Amarelo", value: "#EAB308" },
];

const durationOptions = [
  { label: "6 horas", value: 6 },
  { label: "8 horas", value: 8 },
  { label: "10 horas", value: 10 },
  { label: "12 horas", value: 12 },
  { label: "24 horas", value: 24 },
];

const reminderOptions = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "2 horas", value: 120 },
  { label: "1 dia", value: 1440 },
  { label: "2 dias", value: 2880 },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<"events" | "appearance" | "about">("events");

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setLocalSettings({
      eventTitle: "Plantão",
      eventColor: "#3B82F6",
      defaultDuration: 12,
      reminderMinutes: [60, 1440],
      description: "Evento criado pelo Escala-IA",
    });
  };

  const toggleReminder = (value: number) => {
    setLocalSettings((prev) => {
      const current = prev.reminderMinutes;
      if (current.includes(value)) {
        return { ...prev, reminderMinutes: current.filter((v) => v !== value) };
      } else {
        return { ...prev, reminderMinutes: [...current, value].sort((a, b) => a - b) };
      }
    });
  };

  const tabs = [
    { id: "events" as const, label: "Eventos", icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: "appearance" as const, label: "Aparência", icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    )},
    { id: "about" as const, label: "Sobre", icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Configurações</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Personalize sua experiência</p>
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

            <div className="flex min-h-[400px]">
              {/* Sidebar */}
              <div className="w-48 border-r border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/30">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "events" && (
                    <motion.div
                      key="events"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      {/* Título do evento */}
                      <div>
                        <label htmlFor="eventTitle" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Título do Evento
                        </label>
                        <input
                          id="eventTitle"
                          type="text"
                          value={localSettings.eventTitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, eventTitle: e.target.value })}
                          className="input"
                          placeholder="Ex: Plantão, Trabalho, Turno..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Nome que aparecerá no Google Calendar</p>
                      </div>

                      {/* Cor do evento */}
                      <div>
                        <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cor do Evento
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setLocalSettings({ ...localSettings, eventColor: color.value })}
                              className={`h-8 w-8 rounded-lg transition-all ${
                                localSettings.eventColor === color.value
                                  ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-900"
                                  : "hover:scale-110"
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Duração padrão */}
                      <div>
                        <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Duração Padrão
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {durationOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setLocalSettings({ ...localSettings, defaultDuration: opt.value })}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                localSettings.defaultDuration === opt.value
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lembretes */}
                      <div>
                        <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Lembretes
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {reminderOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => toggleReminder(opt.value)}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                localSettings.reminderMinutes.includes(opt.value)
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Selecione múltiplos lembretes</p>
                      </div>

                      {/* Descrição */}
                      <div>
                        <label htmlFor="eventDescription" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Descrição do Evento
                        </label>
                        <textarea
                          id="eventDescription"
                          value={localSettings.description}
                          onChange={(e) => setLocalSettings({ ...localSettings, description: e.target.value })}
                          className="input min-h-[80px] resize-none"
                          placeholder="Descrição que será adicionada aos eventos..."
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "appearance" && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      {/* Tema */}
                      <div>
                        <span className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tema da Interface
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "light" as const, label: "Claro", icon: (
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )},
                            { id: "dark" as const, label: "Escuro", icon: (
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            )},
                            { id: "system" as const, label: "Sistema", icon: (
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )},
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setTheme(opt.id)}
                              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                theme === opt.id
                                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                              }`}
                            >
                              {opt.icon}
                              <span className="text-sm font-medium">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "about" && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow-lg">
                          <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Escala-IA</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Versão 1.0.0</p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <h4 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Sobre o Projeto</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          O Escala-IA é uma aplicação que utiliza Inteligência Artificial para analisar
                          imagens de calendários e sincronizar automaticamente seus dias de trabalho
                          com o Google Calendar.
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <h4 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Tecnologias</h4>
                        <div className="flex flex-wrap gap-2">
                          {["Next.js", "React", "Tailwind CSS", "Google Gemini", "Google Calendar API"].map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <a
                          href="https://github.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          GitHub
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
              <button
                onClick={handleReset}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Restaurar Padrões
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
