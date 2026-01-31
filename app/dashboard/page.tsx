"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "../components/ImageUploader";
import ScheduleConfirmation from "../components/ScheduleConfirmation";
import EventManager from "../components/EventManager";
import SettingsModal from "../components/SettingsModal";
import ThemeToggle from "../components/ui/ThemeToggle";
import CommandPalette from "../components/ui/CommandPalette";
import Kbd from "../components/ui/Kbd";
import { SettingsProvider } from "../providers/SettingsProvider";
import { UploadSkeleton } from "../components/ui/LoadingSkeleton";

interface AnalyzedData {
  detected_month: string;
  work_days: string[];
  reasoning: string;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyzedData, setAnalyzedData] = useState<AnalyzedData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showEventManager, setShowEventManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Ctrl/Cmd + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
      // Settings: Ctrl/Cmd + ,
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setShowSettings(true);
      }
      // New upload: Ctrl/Cmd + N
      if ((e.metaKey || e.ctrlKey) && e.key === "n" && analyzedData) {
        e.preventDefault();
        handleBack();
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [analyzedData]);

  const handleAnalysisComplete = useCallback((data: AnalyzedData, imgUrl: string) => {
    setAnalyzedData(data);
    setImageUrl(imgUrl);
  }, []);

  const handleBack = useCallback(() => {
    setAnalyzedData(null);
    setImageUrl(null);
  }, []);

  const commands = [
    {
      id: "new-upload",
      label: "Novo Upload",
      description: "Fazer upload de uma nova imagem",
      shortcut: ["⌘", "N"],
      category: "Ações",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      action: () => handleBack(),
    },
    {
      id: "manage-events",
      label: "Gerenciar Eventos",
      description: "Remover eventos do calendário",
      category: "Ações",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      action: () => setShowEventManager(true),
    },
    {
      id: "settings",
      label: "Configurações",
      description: "Personalizar a aplicação",
      shortcut: ["⌘", ","],
      category: "Preferências",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => setShowSettings(true),
    },
    {
      id: "logout",
      label: "Sair da Conta",
      description: "Encerrar sessão",
      category: "Conta",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      action: () => signOut({ callbackUrl: "/" }),
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col gradient-background">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-40 border-b border-gray-200/50 glass dark:border-gray-800/50">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="mb-1 h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <UploadSkeleton />
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col gradient-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 border-b border-gray-200/50 glass dark:border-gray-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                className="gradient-primary rounded-xl p-2.5 shadow-lg"
              >
                <svg
                  className="h-5 w-5 text-white sm:h-6 sm:w-6"
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
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
                  Escala-IA
                </h1>
                <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                  Olá, {session.user?.name?.split(" ")[0]}
                </p>
              </div>
            </div>

            {/* Center - Command Palette Trigger */}
            <div className="hidden lg:block">
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/80 px-3 py-1.5 text-sm text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:bg-white hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Comandos...</span>
                <div className="flex items-center gap-0.5">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </div>
              </button>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Manage Events Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEventManager(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 hover:shadow dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                title="Gerenciar eventos"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Remover</span>
              </motion.button>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Avatar"}
                      className="h-8 w-8 rounded-full border-2 border-white shadow-sm dark:border-gray-700 sm:h-9 sm:w-9"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300 sm:h-9 sm:w-9">
                      {session.user?.name?.[0] || "U"}
                    </div>
                  )}
                  <svg className="hidden h-4 w-4 text-gray-500 dark:text-gray-400 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
                      >
                        {/* User Info */}
                        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {session.user?.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                            {session.user?.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowSettings(true);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Configurações
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowCommandPalette(true);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Comandos
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Kbd>⌘</Kbd>
                              <Kbd>K</Kbd>
                            </div>
                          </button>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair da Conta
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <AnimatePresence mode="wait">
          {analyzedData ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScheduleConfirmation
                data={analyzedData}
                imageUrl={imageUrl!}
                onBack={handleBack}
                accessToken={session.accessToken!}
              />
            </motion.div>
          ) : (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ImageUploader onAnalysisComplete={handleAnalysisComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 glass dark:border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Escala-IA © 2026 • Sincronize seus plantões com o Google Calendar
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettings(true)}
                className="text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Configurações
              </button>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
                <span className="ml-1">para comandos</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showEventManager && (
          <EventManager
            accessToken={session.accessToken!}
            onClose={() => setShowEventManager(false)}
          />
        )}
      </AnimatePresence>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <SettingsProvider>
      <DashboardContent />
    </SettingsProvider>
  );
}
