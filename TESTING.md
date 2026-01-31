# 🧪 Plano de Testes - Escala-IA

## ✅ Checklist de Testes

### 1. Configuração Inicial

#### Teste: Variáveis de Ambiente
- [ ] Arquivo `.env.local` existe
- [ ] Todas as variáveis necessárias estão preenchidas
- [ ] `NEXTAUTH_SECRET` está configurado (gerar com `openssl rand -base64 32`)
- [ ] `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- [ ] `GEMINI_API_KEY` está válida

**Como testar**: Execute `bun dev` e verifique se não há erros de variáveis faltando.

---

### 2. Fase 1: Autenticação (CRÍTICO)

#### Teste 2.1: Página de Login
- [ ] Acesse `http://localhost:3000`
- [ ] Botão "Entrar com Google" está visível
- [ ] Ícone do Google está renderizado
- [ ] Layout está responsivo (teste no celular)

#### Teste 2.2: Fluxo de Login
- [ ] Clique em "Entrar com Google"
- [ ] Redireciona para a tela do Google
- [ ] Mostra os escopos solicitados:
  - ✅ Ver e editar eventos do calendário
  - ✅ Informações básicas do perfil
- [ ] Após autorizar, redireciona para `/dashboard`

#### Teste 2.3: Sessão
- [ ] Nome do usuário aparece no header
- [ ] Recarregar a página mantém a sessão
- [ ] Botão "Sair" funciona e volta para `/`

**Critérios de Aceitação**:
- ✅ Login completa em menos de 5 segundos
- ✅ Não há erros no console
- ✅ Token de acesso está disponível na sessão

---

### 3. Fase 2: Upload de Imagem

#### Teste 3.1: Drag & Drop
- [ ] Arraste uma imagem PNG para a área de upload
- [ ] Preview da imagem aparece
- [ ] Botão de remover (X vermelho) funciona

#### Teste 3.2: Seleção de Arquivo
- [ ] Clique na área de upload
- [ ] Selecione uma imagem JPG
- [ ] Preview da imagem aparece

#### Teste 3.3: Validações
- [ ] Tente fazer upload de um arquivo .txt
- [ ] Deve mostrar erro: "Por favor, selecione uma imagem válida"
- [ ] Upload de imagem grande (> 5MB) deve funcionar

**Critérios de Aceitação**:
- ✅ Upload aceita PNG, JPG, JPEG
- ✅ Preview está nítido e proporcional
- ✅ Feedback visual durante loading

---

### 4. Fase 3: Análise com IA (CRÍTICO)

#### Teste 4.1: Análise Bem-Sucedida
- [ ] Faça upload de uma imagem de calendário com bolinhas azuis
- [ ] Loading aparece com mensagem "Analisando imagem com IA..."
- [ ] Após análise, vai para tela de confirmação
- [ ] Dias detectados aparecem como cards

#### Teste 4.2: Casos Específicos (Chain of Thought)

**Imagem Teste 1**: Calendário com dias isolados nos fins de semana
- [ ] Sábado com bolinha azul é detectado
- [ ] Domingo com bolinha azul é detectado
- [ ] Não ignora fins de semana

**Imagem Teste 2**: Calendário com sobreposição de cores
- [ ] Dia com bolinha azul + amarela é detectado como plantão
- [ ] Dia com APENAS bolinha amarela é ignorado

**Imagem Teste 3**: Calendário completo (1-31)
- [ ] Todos os dias do mês são analisados
- [ ] Dias vazios não são incluídos

#### Teste 4.3: Tratamento de Erros
- [ ] Upload de imagem sem calendário
- [ ] Deve retornar erro amigável
- [ ] Botão de remover funciona para tentar novamente

**Critérios de Aceitação**:
- ✅ Análise completa em menos de 10 segundos
- ✅ Acurácia > 95% na detecção de bolinhas azuis
- ✅ Não ignora dias isolados (fim de semana)

---

### 5. Fase 4: Confirmação e Edição

#### Teste 5.1: Interface de Confirmação
- [ ] Todos os dias detectados aparecem
- [ ] Data está formatada em pt-BR (ex: "08 fev")
- [ ] Dia da semana está em pt-BR (ex: "sáb")
- [ ] Cards estão marcados (checkbox azul)

#### Teste 5.2: Edição Manual
- [ ] Clique em um dia para desmarcar
- [ ] Checkbox fica vazio e card fica branco
- [ ] Clique novamente para remarcar
- [ ] Contador no botão atualiza dinamicamente

#### Teste 5.3: Raciocínio da IA
- [ ] Box azul com "Raciocínio da IA" aparece
- [ ] Texto explica decisões da IA

**Critérios de Aceitação**:
- ✅ Interface intuitiva e responsiva
- ✅ Fácil marcar/desmarcar dias
- ✅ Contador de dias selecionados correto

---

### 6. Fase 5: Sincronização (CRÍTICO)

#### Teste 6.1: Sincronização Normal
- [ ] Clique em "Sincronizar X plantão(ões)"
- [ ] Loading aparece
- [ ] Mensagem de sucesso: "X plantão(ões) adicionado(s) com sucesso!"
- [ ] Abra o Google Calendar e verifique os eventos

#### Teste 6.2: Idempotência (Evitar Duplicatas)
- [ ] Volte e faça upload da MESMA imagem
- [ ] Confirme os mesmos dias
- [ ] Clique em "Sincronizar"
- [ ] Mensagem: "Todos os X plantão(ões) já existiam na sua agenda"
- [ ] Verifique no Calendar que NÃO há duplicatas

#### Teste 6.3: Sincronização Parcial
- [ ] Faça upload novamente
- [ ] Desmarque alguns dias que já foram adicionados
- [ ] Marque dias novos
- [ ] Sincronize
- [ ] Mensagem: "X plantão(ões) adicionado(s). Y já existia(m)..."

#### Teste 6.4: Detalhes do Evento
No Google Calendar, verifique que cada evento:
- [ ] Título: "Plantão"
- [ ] Descrição: "Plantão adicionado automaticamente via Escala-IA"
- [ ] Evento de dia inteiro
- [ ] Cor azul (opcional)
- [ ] Lembrete: 1 dia antes

#### Teste 6.5: Tratamento de Erros
- [ ] Force expiração do token (espere ~1 hora)
- [ ] Tente sincronizar
- [ ] Erro: "Token de acesso expirado. Faça logout e login novamente"

**Critérios de Aceitação**:
- ✅ Sincronização completa em menos de 5 segundos (para 10 dias)
- ✅ 100% de idempotência (zero duplicatas)
- ✅ Eventos corretos no Google Calendar

---

## 📊 Matriz de Testes

| Funcionalidade | Prioridade | Status | Bugs Encontrados |
|---------------|------------|--------|-------------------|
| Login Google | 🔴 Alta | ⬜ | |
| Upload Drag&Drop | 🟡 Média | ⬜ | |
| Análise IA | 🔴 Alta | ⬜ | |
| Chain of Thought | 🔴 Alta | ⬜ | |
| Edição Manual | 🟡 Média | ⬜ | |
| Sincronização | 🔴 Alta | ⬜ | |
| Idempotência | 🔴 Alta | ⬜ | |
| Responsividade | 🟡 Média | ⬜ | |

---

## 🐛 Relatório de Bugs (Template)

### Bug #X: [Título Curto]
- **Severidade**: 🔴 Alta / 🟡 Média / 🟢 Baixa
- **Reproduzir**:
  1. Passo 1
  2. Passo 2
  3. Passo 3
- **Resultado Esperado**: ...
- **Resultado Atual**: ...
- **Screenshots**: (se aplicável)
- **Console Errors**: (cole aqui)

---

## 📱 Testes de Responsividade

### Desktop (1920x1080)
- [ ] Layout bem distribuído
- [ ] Cards em grid 4 colunas

### Tablet (768x1024)
- [ ] Layout ajusta para 3 colunas
- [ ] Header não quebra

### Mobile (375x667)
- [ ] Layout mobile-first
- [ ] Cards em 2 colunas
- [ ] Botões acessíveis com polegar
- [ ] Texto legível sem zoom

---

## ⚡ Testes de Performance

### Métricas Alvo
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Time to Interactive (TTI) < 3s
- [ ] Upload de imagem 5MB < 2s
- [ ] Análise de IA < 10s
- [ ] Sincronização de 10 eventos < 5s

**Ferramenta**: Chrome DevTools > Lighthouse

---

## ✅ Checklist Final Antes do Deploy

- [ ] Todos os testes CRÍTICOS (🔴) passaram
- [ ] Zero bugs de severidade Alta
- [ ] Testado em Chrome, Firefox, Safari
- [ ] Testado em Mobile (iOS e Android)
- [ ] Performance aceitável (Lighthouse > 80)
- [ ] Console sem erros
- [ ] README atualizado
- [ ] Variáveis de produção configuradas

---

## 📝 Notas de Teste

### Data: ___/___/2026
**Testador**: _____________

**Ambiente**:
- Browser: _____________
- Device: _____________
- OS: _____________

**Observações**:
- 
- 
- 

**Status Geral**: ⬜ Aprovado | ⬜ Aprovado com Ressalvas | ⬜ Reprovado
