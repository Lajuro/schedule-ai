"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from "react";

interface EventSettings {
  eventTitle: string;
  eventColor: string;
  defaultDuration: number; // em horas
  reminderMinutes: number[];
  description: string;
}

interface SettingsContextType {
  settings: EventSettings;
  updateSettings: (newSettings: Partial<EventSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: EventSettings = {
  eventTitle: "Plantão",
  eventColor: "#3B82F6", // blue-500
  defaultDuration: 12,
  reminderMinutes: [60, 1440], // 1 hora e 1 dia antes
  description: "Evento criado pelo Escala-IA",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

interface SettingsProviderProps {
  readonly children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<EventSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("escala-ia-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error("Erro ao carregar configurações:", e);
      }
    }
    setMounted(true);
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("escala-ia-settings", JSON.stringify(settings));
    }
  }, [settings, mounted]);

  const updateSettings = useCallback((newSettings: Partial<EventSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem("escala-ia-settings");
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
