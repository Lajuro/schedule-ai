"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

interface AnalysisResult {
  success: boolean;
  data?: {
    detected_month: string;
    work_days: string[];
    reasoning: string;
  };
  error?: string;
}

export async function analyzeSchedule(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<AnalysisResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("⚠️ GEMINI_API_KEY não encontrada no .env.local");
      return {
        success: false,
        error: "API Key do Gemini não configurada",
      };
    }

    console.log("🔑 API Key presente:", apiKey.substring(0, 10) + "...");
    console.log("📊 Tamanho da imagem (base64):", imageBase64.length, "caracteres");
    console.log("📷 MIME Type:", mimeType);

    const genAI = new GoogleGenerativeAI(apiKey);
    // Usando gemini-2.5-flash - modelo atual com suporte a visão
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Contexto temporal para auxiliar a IA a inferir o ano correto
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const ptMonthNames = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ];
    const currentMonthName = ptMonthNames[now.getMonth()];
    const currentDay = now.getDate();
    const nextYear = currentYear + 1;

    // PROMPT RIGOROSO: Seguindo as instruções do copilot-instructions.md
    const prompt = `Você é um auditor de escalas rigoroso. Analise a imagem do calendário fornecida.

TAREFA: Identificar dias de plantão (marcados com bolinha AZUL).

CONTEXTO TEMPORAL (USE PARA INFERIR O ANO CORRETO):
- Hoje é ${currentDay} de ${currentMonthName} de ${currentYear} (${String(currentDay).padStart(2, "0")}/${String(currentMonthNum).padStart(2, "0")}/${currentYear}).
- O calendário na imagem pode não exibir o ano. Use a seguinte lógica para inferir o ano:
  * Se o mês do calendário >= mês atual (${currentMonthNum}): o ano provável é ${currentYear}.
  * Se o mês do calendário < mês atual (${currentMonthNum}): o ano provável é ${nextYear}.
  * Exemplo: se hoje é março/${currentYear} e a imagem mostra "março", use ${currentYear}. Se hoje é dezembro/${currentYear} e a imagem mostra "março", use ${nextYear}.
- Aplique esta inferência ao campo "detected_month" do JSON.

INSTRUÇÕES OBRIGATÓRIAS:
- Analise dia por dia, de 1 a 31 (ou até o último dia do mês). Não ignore fins de semana.
- Se houver bolinha azul E amarela no mesmo dia, conta como azul (o azul vence).
- Liste explicitamente o status de cada dia antes de dar o JSON final.
- ATENÇÃO AOS FINS DE SEMANA: Muitas vezes o sábado/domingo tem bolinhas que a leitura rápida ignora. Olhe especificamente as colunas das extremidades.
- SOBREPOSIÇÃO: Se um dia tiver uma bolinha azul E uma amarela, ou azul E laranja, CONSIDERE COMO PLANTÃO (Azul vence).
- Ignore dias que tenham APENAS bolinha amarela/laranja.

FORMATO DE RESPOSTA:
Primeiro, apresente o raciocínio (Chain of Thought) com o status de cada dia, por exemplo:
"Dia 1: sem bolinha | Dia 2: bolinha azul | Dia 3: bolinha amarela (ignorar) | Dia 4: sem bolinha | Dia 5: sem bolinha | Dia 6: bolinha azul | Dia 7: bolinha azul | Dia 8: bolinha azul (sábado) ..."

Depois retorne o JSON (sem markdown, apenas o JSON puro):
{
  "detected_month": "YYYY-MM",
  "work_days": ["YYYY-MM-DD", "YYYY-MM-DD", ...],
  "reasoning": "Texto breve explicando quais dias duvidosos foram incluídos"
}

IMPORTANTE: Retorne APENAS o JSON final, sem blocos de código markdown (\`\`\`json). Apenas o objeto JSON puro.`;

    console.log("🤖 Chamando Gemini API...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();
    console.log("✅ Resposta recebida da IA (primeiros 500 chars):", text.substring(0, 500));

    // Extrair JSON da resposta
    let jsonText = text.trim();
    
    // Remove blocos de markdown se existirem
    if (jsonText.includes("```json")) {
      jsonText = jsonText.split("```json")[1].split("```")[0].trim();
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.split("```")[1].split("```")[0].trim();
    } else {
      // A IA pode retornar o raciocínio + JSON. Extrair apenas o JSON (que começa com {)
      const jsonStart = jsonText.indexOf("{");
      const jsonEnd = jsonText.lastIndexOf("}");
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1).trim();
      }
    }

    // Tenta parsear o JSON
    try {
      const data = JSON.parse(jsonText);

      // Validação básica da estrutura
      if (!data.detected_month || !Array.isArray(data.work_days)) {
        return {
          success: false,
          error: "Formato de resposta inválido da IA",
        };
      }

      return {
        success: true,
        data: {
          detected_month: data.detected_month,
          work_days: data.work_days,
          reasoning: data.reasoning || "Análise concluída",
        },
      };
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError);
      console.error("Texto recebido:", jsonText);
      return {
        success: false,
        error: "Não foi possível processar a resposta da IA. Tente outra imagem.",
      };
    }
  } catch (error: any) {
    console.error("❌ Erro ao analisar imagem:", error);
    console.error("❌ Stack trace:", error?.stack);
    console.error("❌ Message:", error?.message);
    
    // Verificar erro específico da API do Gemini
    if (error?.message?.includes("API_KEY")) {
      return {
        success: false,
        error: "Chave da API inválida. Verifique GEMINI_API_KEY no .env.local",
      };
    }
    
    if (error?.message?.includes("quota") || error?.message?.includes("limit")) {
      return {
        success: false,
        error: "Limite de requisições atingido. Tente novamente em alguns minutos.",
      };
    }
    
    return {
      success: false,
      error: `Erro ao comunicar com a IA: ${error?.message || 'Erro desconhecido'}. Verifique sua conexão.`,
    };
  }
}
