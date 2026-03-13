"use server";

import { google } from "googleapis";

interface SingleSyncResult {
  success: boolean;
  date: string;
  status: "inserted" | "skipped" | "error";
  message: string;
  errorCode?: "auth" | "permission" | "unknown";
}

/**
 * Sincroniza UMA única data com o Google Calendar
 * Usado para feedback em tempo real
 */
export async function syncSingleDate(
  dateStr: string,
  accessToken: string,
  calendarName: string = "Compromissos"
): Promise<SingleSyncResult> {
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

    const hasSimilarEvent = existingEvents.data.items?.some((event) => {
      const title = event.summary?.toLowerCase() || "";
      return (
        title.includes("plantão") ||
        title.includes("plantao") ||
        title.includes("trabalho") ||
        title.includes("escala")
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

    // Inserir evento
    await calendar.events.insert({
      calendarId: targetCalendarId,
      requestBody: {
        summary: "Plantão",
        description: "Plantão adicionado automaticamente via Escala-IA",
        start: { date: dateStr },
        end: { date: dateStr },
        colorId: "9",
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 24 * 60 }],
        },
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

    const errCode = (error as { code?: number })?.code;
    const errMessage = (error as { message?: string })?.message || "";

    if (errCode === 401 || errMessage.includes("invalid authentication credentials")) {
      return {
        success: false,
        date: dateStr,
        status: "error",
        message: "Sessão expirada. Faça logout e login novamente.",
        errorCode: "auth",
      };
    }

    if (errCode === 403) {
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
