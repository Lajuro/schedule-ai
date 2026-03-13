"use server";

import { google } from "googleapis";

interface SingleSyncResult {
  success: boolean;
  date: string;
  status: "inserted" | "skipped" | "error";
  message: string;
  errorCode?: "auth" | "permission" | "unknown";
}

interface EventSettings {
  eventTitle: string;
  eventColor: string;
  defaultDuration: number; // em horas
  reminderMinutes: number[];
  description: string;
}

// Mapeia as cores hex do app para os colorIds do Google Calendar
const hexToColorId: Record<string, string> = {
  "#3B82F6": "9",  // Azul → Blueberry
  "#22C55E": "10", // Verde → Basil
  "#A855F7": "3",  // Roxo → Grape
  "#F97316": "6",  // Laranja → Tangerine
  "#EC4899": "4",  // Rosa → Flamingo
  "#06B6D4": "7",  // Ciano → Peacock
  "#EF4444": "11", // Vermelho → Tomato
  "#EAB308": "5",  // Amarelo → Banana
};

function getColorId(hexColor: string): string {
  return hexToColorId[hexColor] || "9"; // fallback para Blueberry
}

/**
 * Sincroniza UMA única data com o Google Calendar
 * Usado para feedback em tempo real
 */
export async function syncSingleDate(
  dateStr: string,
  accessToken: string,
  eventSettings?: EventSettings,
  calendarName: string = "Compromissos"
): Promise<SingleSyncResult> {
  const title = eventSettings?.eventTitle || "Plantão";
  const description = eventSettings?.description || "Evento criado pelo Escala-IA";
  const colorId = getColorId(eventSettings?.eventColor || "#3B82F6");
  const durationHours = eventSettings?.defaultDuration || 12;
  const reminderMinutes = eventSettings?.reminderMinutes ?? [60, 1440];

  try {
    if (!accessToken) {
      return {
        success: false,
        date: dateStr,
        status: "error",
        message: "Token não encontrado",
      };
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Buscar calendário
    let targetCalendarId = "primary";
    
    try {
      const calendarList = await calendar.calendarList.list();
      const targetCalendar = calendarList.data.items?.find(
        (cal) => cal.summary?.toLowerCase() === calendarName.toLowerCase()
      );
      
      if (targetCalendar && targetCalendar.id) {
        targetCalendarId = targetCalendar.id;
      }
    } catch {
      // Usa primary como fallback
    }

    // Verificar duplicata
    const startOfDay = `${dateStr}T00:00:00-03:00`;
    const endOfDay = `${dateStr}T23:59:59-03:00`;

    const existingEvents = await calendar.events.list({
      calendarId: targetCalendarId,
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
    });

    const titleLower = title.toLowerCase();
    const hasSimilarEvent = existingEvents.data.items?.some((event) => {
      const eventTitle = event.summary?.toLowerCase() || "";
      return (
        eventTitle.includes(titleLower) ||
        eventTitle.includes("plantão") ||
        eventTitle.includes("plantao") ||
        eventTitle.includes("trabalho") ||
        eventTitle.includes("escala")
      );
    });

    if (hasSimilarEvent) {
      return {
        success: true,
        date: dateStr,
        status: "skipped",
        message: "Já existe evento",
      };
    }

    // Configurar início e fim do evento com base na duração
    let eventStart: { date?: string; dateTime?: string; timeZone?: string };
    let eventEnd: { date?: string; dateTime?: string; timeZone?: string };

    if (durationHours === 24) {
      // Evento de dia inteiro
      eventStart = { date: dateStr };
      eventEnd = { date: dateStr };
    } else {
      // Evento com horário (início às 07:00 por padrão)
      const startDate = new Date(`${dateStr}T07:00:00-03:00`);
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      eventStart = {
        dateTime: startDate.toISOString(),
        timeZone: "America/Sao_Paulo",
      };
      eventEnd = {
        dateTime: endDate.toISOString(),
        timeZone: "America/Sao_Paulo",
      };
    }

    // Configurar lembretes
    const reminders = reminderMinutes.length > 0
      ? {
          useDefault: false,
          overrides: reminderMinutes.map((minutes) => ({
            method: "popup" as const,
            minutes,
          })),
        }
      : { useDefault: true };

    // Inserir evento
    await calendar.events.insert({
      calendarId: targetCalendarId,
      requestBody: {
        summary: title,
        description,
        start: eventStart,
        end: eventEnd,
        colorId,
        reminders,
      },
    });

    return {
      success: true,
      date: dateStr,
      status: "inserted",
      message: "Evento criado",
    };
  } catch (error: unknown) {
    console.error(`Erro ao sincronizar ${dateStr}:`, error);

    const errCode = (error as { code?: number | string })?.code;
    const errStatus = (error as { response?: { status?: number } })?.response?.status;
    const errMessage = (error as { message?: string })?.message || "";
    const statusCode = errStatus || (typeof errCode === "number" ? errCode : Number(errCode));

    if (statusCode === 401 || errMessage.includes("invalid authentication credentials")) {
      return {
        success: false,
        date: dateStr,
        status: "error",
        message: "Sessão expirada. Faça logout e login novamente.",
        errorCode: "auth",
      };
    }

    if (statusCode === 403) {
      return {
        success: false,
        date: dateStr,
        status: "error",
        message: "Permissão negada. Verifique as permissões do Google Calendar.",
        errorCode: "permission",
      };
    }

    return {
      success: false,
      date: dateStr,
      status: "error",
      message: "Erro ao criar evento",
      errorCode: "unknown",
    };
  }
}
