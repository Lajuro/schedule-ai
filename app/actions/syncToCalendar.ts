"use server";

import { google } from "googleapis";

interface SyncResult {
  success: boolean;
  message: string;
  inserted: number;
  skipped: number;
}

/**
 * Sincroniza datas selecionadas com o Google Calendar
 * @param selectedDates - Array de datas no formato YYYY-MM-DD
 * @param accessToken - Token de acesso OAuth do Google
 * @param calendarName - Nome do calendário (padrão: "Compromissos")
 */
export async function syncToCalendar(
  selectedDates: string[],
  accessToken: string,
  calendarName: string = "Compromissos"
): Promise<SyncResult> {
  try {
    if (!accessToken) {
      return {
        success: false,
        message: "Token de acesso não encontrado. Faça login novamente.",
        inserted: 0,
        skipped: 0,
      };
    }

    // Configurar cliente OAuth2 do Google
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // BUSCAR O ID DO CALENDÁRIO "Compromissos" ao invés de usar "primary"
    let targetCalendarId = "primary";
    
    try {
      const calendarList = await calendar.calendarList.list();
      const targetCalendar = calendarList.data.items?.find(
        (cal) => cal.summary?.toLowerCase() === calendarName.toLowerCase()
      );
      
      if (targetCalendar && targetCalendar.id) {
        targetCalendarId = targetCalendar.id;
        console.log(`✅ Calendário "${calendarName}" encontrado: ${targetCalendarId}`);
      } else {
        console.warn(`⚠️ Calendário "${calendarName}" não encontrado. Usando calendário principal.`);
      }
    } catch (error) {
      console.error("Erro ao buscar lista de calendários:", error);
      console.warn("Usando calendário principal como fallback");
    }

    let inserted = 0;
    let skipped = 0;

    // Processar cada data
    for (const dateStr of selectedDates) {
      try {
        // REGRA DE IDEMPOTÊNCIA: Verificar se já existe evento similar neste dia
        const startOfDay = `${dateStr}T00:00:00-03:00`; // Ajustar timezone conforme necessário
        const endOfDay = `${dateStr}T23:59:59-03:00`;

        const existingEvents = await calendar.events.list({
          calendarId: targetCalendarId,
          timeMin: startOfDay,
          timeMax: endOfDay,
          singleEvents: true,
        });

        // Verificar se já existe um evento com título "Plantão" ou similar
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
          console.log(`Dia ${dateStr} já tem evento similar, pulando...`);
          skipped++;
          continue;
        }

        // Inserir novo evento
        await calendar.events.insert({
          calendarId: targetCalendarId,
          requestBody: {
            summary: "Plantão",
            description: "Plantão adicionado automaticamente via Escala-IA",
            start: {
              date: dateStr, // Evento de dia inteiro
            },
            end: {
              date: dateStr,
            },
            colorId: "9", // Azul (opcional)
            reminders: {
              useDefault: false,
              overrides: [
                { method: "popup", minutes: 24 * 60 }, // 1 dia antes
              ],
            },
          },
        });

        console.log(`Evento criado para ${dateStr}`);
        inserted++;
      } catch (error) {
        console.error(`Erro ao processar ${dateStr}:`, error);
        // Continua processando os outros dias mesmo se um falhar
      }
    }

    // Mensagem de resultado
    let message = "";
    if (inserted > 0 && skipped === 0) {
      message = `✅ ${inserted} plantão(ões) adicionado(s) com sucesso!`;
    } else if (inserted > 0 && skipped > 0) {
      message = `✅ ${inserted} plantão(ões) adicionado(s). ${skipped} já existia(m) e foi(ram) ignorado(s).`;
    } else if (inserted === 0 && skipped > 0) {
      message = `ℹ️ Todos os ${skipped} plantão(ões) já existiam na sua agenda.`;
    } else {
      message = "Nenhum plantão foi processado.";
    }

    return {
      success: true,
      message,
      inserted,
      skipped,
    };
  } catch (error: any) {
    console.error("Erro ao sincronizar com Google Calendar:", error);

    // Tratar erros específicos
    if (error.code === 401) {
      return {
        success: false,
        message:
          "Token de acesso expirado. Por favor, faça logout e login novamente.",
        inserted: 0,
        skipped: 0,
      };
    }

    if (error.code === 403) {
      return {
        success: false,
        message:
          "Permissão negada. Verifique se você concedeu acesso ao Google Calendar.",
        inserted: 0,
        skipped: 0,
      };
    }

    return {
      success: false,
      message: "Erro ao sincronizar com o Google Calendar. Tente novamente.",
      inserted: 0,
      skipped: 0,
    };
  }
}
