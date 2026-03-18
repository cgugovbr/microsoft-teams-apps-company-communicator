# Smoke Test Local — Company Communicator

## ✅ Status Atual

### Backend
- **305 testes de unidade passando**
  - Send.Func.Test: 22/22 ✓
  - Prep.Func.Test: 142/142 ✓
  - Common.Test: 49/49 ✓
  - CompanyCommunicator.Test: 92/92 ✓

### Frontend
- **Node.js + npm**
  - Node v16.20.2
  - npm 8.19.4
  - npm test passou ✓
  - npm start (preview local) passou ✓

### Web App
- **Rodando em dev**
  - Listening on: http://localhost:5000 → HTTPS redirecionado
  - Listening on: https://localhost:5001 ✓
  - React dev server integrado com Webpack ✓
  - Health check: responde com status 307 Temporary Redirect (comportamento esperado)

---

## 🚀 Como Testar Localmente Agora

### Terminal 1: Frontend Preview (sem Teams)
```bash
cd /home/herbet/cgugovbr/microsoft-teams-apps-company-communicator/Source/CompanyCommunicator/ClientApp
npm start
# App estará em http://localhost:3000/newmessage
```

### Terminal 2: Rodar testes
```bash
cd /home/herbet/cgugovbr/microsoft-teams-apps-company-communicator/Source

# Testes backend
dotnet test Microsoft.Teams.Apps.CompanyCommunicator.sln --verbosity minimal

# Testes frontend
cd CompanyCommunicator/ClientApp
npm test -- --watchAll=false
```

---

## 📋 Checklist Para Próximos Passos

### Ainda em Development Mode (Offline)
- [ ] Acessar http://localhost:3000/newmessage no navegador
- [ ] Validar toolbar do campo Summary (B, I, Link, 1., •)
- [ ] Verificar console do browser para erros de compilação

### Para Deploy Completo (Exige Azure + Entra ID)
- [ ] Registrar 3 Azure AD apps (Author, User, Graph)
- [ ] Criar recursos Azure (App Service, Functions, Service Bus, Storage, Key Vault)
- [ ] Preencher appsettings.json com IDs/senhas reais
- [ ] Instalar pacotes .zip no Teams
- [ ] Testar fluxo fim-a-fim (criar mensagem → enviar → validar entrega)

---

## 🔧 Arquivo de Configuração Local

Criado em: `Source/CompanyCommunicator/appsettings.Development.json`
Criado em: `Source/CompanyCommunicator/ClientApp/.env.local`

**Nota:**
- `appsettings.Development.json` usa valores dummy para startup local sem Azure.
- `.env.local` ativa `REACT_APP_LOCAL_PREVIEW=true` e `TSC_COMPILE_ON_ERROR=true` para preview visual local sem Teams.

---

## 📊 Stack Validado

| Componente | Versão | Status |
|---|---|---|
| .NET SDK | 6.0.100 | ✅ |
| .NET Runtime | 6.0.100 | ✅ |
| Node.js | 16.20.2 | ✅ (recomenda atualizar para 18) |
| npm | 8.19.4 | ✅ |
| React | Create-React-App | ✅ |
| Webpack | Via CRA | ✅ |
| Azure Functions | v4 | Não testado localmente |

---

## 💡 Próximas Ações Recomendadas

1. **Imediato:** Acessar app em navegador e validar UI React
2. **Curto prazo:** Criar Azure AD apps + deploy em dev subscription
3. **Médio prazo:** Testar integração com Teams (precisa de ngrok para webhook)
4. **Longo prazo:** Documentar customizações necessárias + treinar equipe

## ⚠️ Limitação Conhecida

- `npm run build` local pode falhar com erros de TypeScript em `@griffel/style-types` (dependência), devido a incompatibilidade pré-existente com TS 3.9.7 no template.
- Para validação local de mudanças frontend, use como gate principal: `npm test -- --watchAll=false` + `npm start`.

---

## 📞 Referência

- Guia oficial: [Wiki/Deployment-guide-powershell.md](../Wiki/Deployment-guide-powershell.md)
- Testes unitários: `Source/Test/`
- Configuração: `Source/CompanyCommunicator/appsettings.json`
- Frontend: `Source/CompanyCommunicator/ClientApp/`
