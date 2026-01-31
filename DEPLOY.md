# 🚀 Guia de Deploy - Escala-IA

## ✅ Checklist Antes do Deploy

### 1. Configuração Local Completa
- [ ] Todas as variáveis de ambiente configuradas no `.env.local`
- [ ] Testado o fluxo completo localmente:
  - [ ] Login com Google funciona
  - [ ] Upload de imagem funciona
  - [ ] Análise de IA retorna resultados
  - [ ] Sincronização com Calendar funciona

### 2. Configurações do Google Cloud
- [ ] OAuth consent screen configurado como **External**
- [ ] Escopos do Calendar API adicionados
- [ ] Domínio de produção adicionado aos Authorized redirect URIs
- [ ] Quota da API verificada (limite padrão: 1.000.000 requisições/dia)

### 3. Preparação do Código
- [ ] Commit de todas as mudanças
- [ ] `.env.local` no `.gitignore` (já está)
- [ ] Build local sem erros: `bun run build`

## 🌐 Deploy na Vercel (Recomendado)

### Passo 1: Preparar o Repositório

```bash
# Inicializar git (se ainda não estiver)
git init
git add .
git commit -m "Initial commit - Escala-IA"

# Criar repositório no GitHub e fazer push
git remote add origin <seu-repo-url>
git branch -M main
git push -u origin main
```

### Passo 2: Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New Project**
3. Importe seu repositório do GitHub
4. Configure as **Environment Variables**:
   - `NEXTAUTH_URL` = sua URL de produção (ex: https://escala-ia.vercel.app)
   - `NEXTAUTH_SECRET` = gere um novo: `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` = mesmo do local
   - `GOOGLE_CLIENT_SECRET` = mesmo do local
   - `GEMINI_API_KEY` = mesmo do local

5. Clique em **Deploy**

### Passo 3: Configurar Google OAuth para Produção

1. Volte ao [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services > Credentials**
3. Edite seu OAuth 2.0 Client ID
4. Adicione a URL de callback de produção:
   - `https://SEU-DOMINIO.vercel.app/api/auth/callback/google`
5. Salve as mudanças

### Passo 4: Testar em Produção

1. Acesse sua URL de produção
2. Teste o fluxo completo:
   - Login
   - Upload de imagem
   - Análise
   - Sincronização

## 🐳 Deploy com Docker (Alternativa)

### Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Criar docker-compose.yml

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
```

### Deploy

```bash
docker-compose up -d
```

## 📊 Monitoramento e Logs

### Vercel
- Dashboard: Acesse o projeto na Vercel
- Logs em tempo real: Aba **Deployments** > **Logs**
- Analytics: Aba **Analytics**

### Logs de Erro
O código já inclui `console.error()` nos pontos críticos:
- Server Actions (analyzeSchedule, syncToCalendar)
- Handlers de erro nos componentes

## 🔐 Segurança em Produção

### Checklist de Segurança
- [ ] `NEXTAUTH_SECRET` forte e único para produção
- [ ] HTTPS obrigatório (Vercel faz automaticamente)
- [ ] Rate limiting do Gemini API configurado
- [ ] Monitorar uso da API do Google Calendar
- [ ] CORS configurado corretamente (NextAuth cuida disso)

### Limites de API

#### Google Gemini
- Free tier: 60 requisições/minuto
- Solução: Adicionar rate limiting no frontend

#### Google Calendar API
- Default: 1.000.000 requisições/dia
- Por usuário: 2.500 requisições/dia
- Solução: Já implementamos verificação de duplicatas

## 🎯 Melhorias Futuras (Opcional)

### Fase 2.0 - Funcionalidades Extras
- [ ] Suporte a múltiplos calendários
- [ ] Histórico de uploads
- [ ] Edição manual de datas no calendário visual
- [ ] Notificações push 1 dia antes do plantão
- [ ] Exportar escala em PDF

### Fase 3.0 - Escalabilidade
- [ ] Rate limiting inteligente
- [ ] Cache de análises de imagens similares
- [ ] Suporte a outros calendários (Outlook, Apple Calendar)
- [ ] API pública para integrações

## 🆘 Troubleshooting em Produção

### Erro: "Callback URL mismatch"
- Verifique se a URL de callback está EXATAMENTE como configurado no Google Cloud Console
- Formato: `https://SEU-DOMINIO/api/auth/callback/google`

### Erro: "NEXTAUTH_URL mismatch"
- Atualize a variável `NEXTAUTH_URL` na Vercel para a URL de produção

### Erro: Rate limit da API Gemini
- Implementar retry com backoff exponencial
- Considerar upgrade do plano do Gemini

### Erro: Token expirado frequentemente
- Implementar refresh token automático (já está parcialmente implementado)
- Adicionar lógica de retry com re-autenticação

## 📈 Analytics e Métricas

### KPIs Sugeridos
1. **Taxa de conversão**: Login → Upload → Sincronização
2. **Acurácia da IA**: % de dias detectados corretamente
3. **Tempo médio**: Upload → Resultado
4. **Erros**: Taxa de falha por etapa

### Ferramentas Recomendadas
- **Vercel Analytics** (incluído)
- **Google Analytics 4** (opcional)
- **Sentry** para error tracking (opcional)

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs na Vercel
2. Consulte o [troubleshooting do README](./README.md#troubleshooting)
3. Abra uma issue no repositório

---

**Status Atual**: ✅ Aplicação pronta para deploy

**Próximos Passos**:
1. Fazer deploy na Vercel
2. Configurar URLs de produção no Google Cloud
3. Testar em produção
4. Compartilhar com usuários beta
