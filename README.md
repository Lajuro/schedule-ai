# 🗓️ Escala-IA

Aplicação web para sincronizar escalas de trabalho com Google Calendar usando IA.

## 🎯 Objetivo

Permite que o usuário faça upload de uma imagem de calendário, a IA identifica automaticamente os dias de trabalho (marcados com bolinhas azuis) e sincroniza com o Google Calendar.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Estilização**: Tailwind CSS
- **Backend**: Next.js Server Actions
- **IA Vision**: Google Gemini 1.5 Flash
- **Integração**: Google Calendar API
- **Auth**: NextAuth.js

## 📋 Pré-requisitos

1. Node.js 18+ ou Bun
2. Conta Google Cloud Platform
3. API Key do Google Gemini (Google AI Studio)

## ⚙️ Configuração

### 1. Clonar e Instalar Dependências

```bash
# Instale as dependências
bun install
# ou npm install
```

### 2. Configurar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs:
   - Google Calendar API
4. Vá em **APIs & Services > OAuth consent screen** ⭐
5. Configure a tela de consentimento OAuth:
   - User Type: **External**
   - Clique em **Create**
   - Preencha os dados básicos (nome do app, email, etc.)
   - Clique em **Save and Continue**
6. Na aba **Scopes**:
   - Clique em **Add or Remove Scopes**
   - Procure e adicione estes escopos:
     - `https://www.googleapis.com/auth/calendar.events` (Gerenciar eventos)
     - `https://www.googleapis.com/auth/calendar.readonly` (Ver calendário)
   - Clique em **Update** e **Save and Continue**
7. Complete o formulário até o final
8. Agora vá em **APIs & Services > Credentials**
9. Clique em **Create Credentials > OAuth 2.0 Client ID**
10. Configure o OAuth Client ID:
    - Application Type: **Web Application**
    - Name: schedule-ai (ou seu nome)
    - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
    - Clique em **Create**
11. Copie o **Client ID** e **Client Secret**

### 3. Obter API Key do Gemini

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Clique em **Create API Key**
3. Copie a chave gerada

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` e preencha:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>

GOOGLE_CLIENT_ID=<seu-client-id>
GOOGLE_CLIENT_SECRET=<seu-client-secret>

GEMINI_API_KEY=<sua-gemini-api-key>
```

## 🏃 Executar o Projeto

```bash
# Modo desenvolvimento
bun dev
# ou npm run dev

# Acesse: http://localhost:3000
```

## 📱 Como Usar

1. **Login**: Clique em "Entrar com Google" e autorize o acesso ao Google Calendar
2. **Upload**: Arraste ou selecione uma imagem do calendário
3. **Análise**: A IA processa a imagem e detecta os dias de trabalho
4. **Confirmação**: Revise os dias detectados, adicione ou remova conforme necessário
5. **Sincronização**: Clique em "Sincronizar" para adicionar à sua agenda

## 🎨 Estrutura do Projeto

```
schedule-ai/
├── app/
│   ├── actions/
│   │   ├── analyzeSchedule.ts    # Server Action - Análise com Gemini
│   │   └── syncToCalendar.ts     # Server Action - Sincronização
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth Config
│   ├── components/
│   │   ├── ImageUploader.tsx     # Upload e preview
│   │   └── ScheduleConfirmation.tsx # Confirmação e edição
│   ├── dashboard/
│   │   └── page.tsx              # Página principal (protegida)
│   ├── providers/
│   │   └── SessionProvider.tsx   # Provider de sessão
│   ├── layout.tsx
│   ├── page.tsx                  # Página de login
│   └── globals.css
├── types/
│   └── next-auth.d.ts            # Tipos TypeScript
├── .env.local                    # Variáveis de ambiente
└── .env.example                  # Template de variáveis
```

## 🔒 Segurança

- ✅ Tokens OAuth armazenados de forma segura na sessão
- ✅ Server Actions para proteger API Keys
- ✅ Verificação de duplicatas antes de inserir eventos
- ✅ Validação de sessão em rotas protegidas

## 🧠 Prompt de IA (Chain of Thought)

O sistema usa um prompt rigoroso que instrui a IA a:
- Analisar dia por dia (1 a 31)
- Não ignorar fins de semana
- Detectar sobreposições de bolinhas
- Usar Chain of Thought (raciocínio explícito)
- Retornar JSON estruturado

## 📝 Regras de Implementação

### Regra de Visão (100% Accuracy)
Prompt com Chain of Thought obrigatório para detectar dias isolados (fins de semana).

### Regra de Idempotência (Evitar Duplicatas)
Verificação de eventos existentes antes de inserir.

### Regra de UX (Confirmação)
Interface intermediária para o usuário revisar antes de sincronizar.

## 🐛 Troubleshooting

### Erro: "Token de acesso expirado"
- **Solução**: Faça logout e login novamente

### Erro: "Permissão negada"
- **Solução**: Verifique se os escopos do OAuth estão corretos e refaça a autorização

### IA não detecta alguns dias
- **Solução**: Certifique-se que a imagem está nítida e os números/bolinhas visíveis

## 📄 Licença

MIT

