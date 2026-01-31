"use server";

import { google } from "googleapis";

interface DeleteResult {
  success: boolean;
  date: string;
  status: "deleted" | "not_found" | "error";
  message: string;
}

interface DeleteAllResult {
  success: boolean;
  message: string;
  deleted: number;
  notFound: number;
  errors: number;
}

/**
 * Deleta UM evento de plantão de uma data específica
 */
export async function deleteSingleEvent(
  dateStr: string,
  accessToken: string,
  calendarName: string = "Compromissos"
): Promise<DeleteResult> {
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

      if (targetCalendar?.id) {
        targetCalendarId = targetCalendar.id;
      }
    } catch {
      // Usa primary como fallback
    }

    // Buscar eventos do dia
    const startOfDay = `${dateStr}T00:00:00-03:00`;
    const endOfDay = `${dateStr}T23:59:59-03:00`;

    const existingEvents = await calendar.events.list({
      calendarId: targetCalendarId,
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
    });

    // Encontrar evento de plantão
    const plantaoEvent = existingEvents.data.items?.find((event) => {
      const title = event.summary?.toLowerCase() || "";
      return (
        title.includes("plantão") ||
        title.includes("plantao") ||
        title.includes("escala")
      );
    });

    if (!plantaoEvent?.id) {
      return {
        success: true,
        date: dateStr,
        status: "not_found",
        message: "Nenhum evento encontrado",
      };
    }

    // Deletar o evento
    await calendar.events.delete({
      calendarId: targetCalendarId,
      eventId: plantaoEvent.id,
    });

    return {
      success: true,
      date: dateStr,
      status: "deleted",
      message: "Evento removido",
    };
  } catch (error: unknown) {
    console.error(`Erro ao deletar evento de ${dateStr}:`, error);
    return {
      success: false,
      date: dateStr,
      status: "error",
      message: "Erro ao remover",
    };
  }
}

/**
 * Lista todos os eventos de plantão de um mês
 */
export async function listPlantaoEvents(
  month: string, // YYYY-MM
  accessToken: string,
  calendarName: string = "Compromissos"
): Promise<{ success: boolean; dates: string[]; message?: string }> {
  try {
    if (!accessToken) {
      return {
        success: false,
        dates: [],
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

      if (targetCalendar?.id) {
        targetCalendarId = targetCalendar.id;
      }
    } catch {
      // Usa primary como fallback
    }

    // Calcular início e fim do mês
    const [year, monthNum] = month.split("-").map(Number);
    const startOfMonth = `${month}-01T00:00:00-03:00`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endOfMonth = `${month}-${String(lastDay).padStart(2, "0")}T23:59:59-03:00`;

    const events = await calendar.events.list({
      calendarId: targetCalendarId,
      timeMin: startOfMonth,
      timeMax: endOfMonth,
      singleEvents: true,
      orderBy: "startTime",
    });

    // Filtrar eventos de plantão
    const plantaoEvents = events.data.items?.filter((event) => {
      const title = event.summary?.toLowerCase() || "";
      return (
        title.includes("plantão") ||
        title.includes("plantao") ||
        title.includes("escala")
      );
    }) || [];

    // Extrair datas
    const dates = plantaoEvents.map((event) => {
      // Eventos de dia inteiro têm start.date, outros têm start.dateTime
      if (event.start?.date) {
        return event.start.date;
      }
      if (event.start?.dateTime) {
        return event.start.dateTime.split("T")[0];
      }
      return "";
    }).filter(Boolean);

    return {
      success: true,
      dates,
    };
  } catch (error: unknown) {
    console.error("Erro ao listar eventos:", error);
    return {
      success: false,
      dates: [],
      message: "Erro ao buscar eventos",
    };
  }
}

/**
 * Deleta todos os eventos de plantão de datas selecionadas
 */
export async function deleteMultipleEvents(
  dates: string[],
  accessToken: string,
  calendarName: string = "Compromissos"
): Promise<DeleteAllResult> {
  let deleted = 0;
  let notFound = 0;
  let errors = 0;

  for (const date of dates) {
    const result = await deleteSingleEvent(date, accessToken, calendarName);
    
    if (result.status === "deleted") deleted++;
    else if (result.status === "not_found") notFound++;
    else errors++;
  }

  let message = "";
  if (deleted > 0 && errors === 0) {
    message = `✅ ${deleted} evento(s) removido(s) com sucesso!`;
  } else if (deleted > 0 && errors > 0) {
    message = `${deleted} removido(s), ${errors} erro(s)`;
  } else if (deleted === 0 && notFound > 0) {
    message = `Nenhum evento de plantão encontrado nas datas selecionadas`;
  } else {
    message = `Erro ao remover eventos`;
  }

  return {
    success: errors === 0,
    message,
    deleted,
    notFound,
    errors,
  };
}
