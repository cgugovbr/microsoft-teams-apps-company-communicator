# 🚀 Company Communicator — Status & Próximos Passos

## 📊 Status (Hoje - 18 Mar 2026)

| Item | Status | Detalhes |
|---|---|---|
| **Ambiente Local** | ✅ Pronto | .NET 6.0.100 + Node 16 + npm |
| **Testes Backend** | ✅ 305/305 passing | Send (22), Prep (142), Common (49), Main (92) |
| **Frontend** | ✅ Testando local | React + Webpack, npm test OK |
| **Preview Visual Front** | ✅ Rodando | http://localhost:3000/newmessage |
| **Azure Deploy** | ⏳ Próximo | Script/template pronto, precisa de Azure AD apps |
| **Teams Integration** | ❌ Não testado | Exige deploy + Teams sideload |

---

## 🎯 Roteiro Prático

### **HOJE (Validação Local) — 45 min**
```bash
# Terminal 1: Frontend preview local
cd Source/CompanyCommunicator/ClientApp
npm start
# Acesso em: http://localhost:3000/newmessage
```
✅ Done — `Compiled successfully` e UI visível no navegador.

---

### **PRÓXIMA ETAPA (Deploy Azure) — 2–3h**

1. **Pré-requisitos Azure**
   - Registrar 3 Azure AD apps (see: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md))
   - Guarde 6 valores: 3 AppIds + 3 Passwords + TenantId

2. **Executar Deploy** (escolha uma)
   - **PowerShell (recomendado):** `Deployment/deploy.ps1` → informe parameters.json
   - **Manual:** Azure Portal "Deploy a custom template" → azuredeploy.json
   
3. **Instalar no Teams**
   - Upload `cc-authors.zip` → equipe de autores
   - Upload `cc-users.zip` → tenant app catalog
   
4. **Testar**
   - Criar rascunho de mensagem
   - Enviar para grupo pequeno
   - Conferir contadores de entrega

---

## 📂 Documentos Criados (Para Você)

| Doc | Propósito |
|---|---|
| [SMOKE_TEST_LOCAL.md](SMOKE_TEST_LOCAL.md) | Checklist local + instruções teste |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Guia passo a passo deploy Azure |
| [Wiki/Deployment-guide-powershell.md](Wiki/Deployment-guide-powershell.md) | Oficial — script PowerShell |
| [Wiki/Solution-overview.md](Wiki/Solution-overview.md) | Arquitetura completa |

---

## 🔑 Comandos Salvos

```bash
# Restaurar dependências
cd Source && dotnet restore Microsoft.Teams.Apps.CompanyCommunicator.sln

# Rodar testes
dotnet test Microsoft.Teams.Apps.CompanyCommunicator.sln --verbosity minimal

# Frontend (preview local)
cd Source/CompanyCommunicator/ClientApp
npm start          # dev server React na porta 3000
npm test           # rodar testes Jest

# Backend tests
cd /home/herbet/cgugovbr/microsoft-teams-apps-company-communicator/Source
dotnet test Microsoft.Teams.Apps.CompanyCommunicator.sln --verbosity minimal
```

---

## 🧭 Mapa de Rotas para Preview Visual

Com o `npm start` rodando em `Source/CompanyCommunicator/ClientApp`, abra no navegador:

- `http://localhost:3000/messages` → lista principal de mensagens
- `http://localhost:3000/newmessage` → criar nova mensagem
- `http://localhost:3000/newmessage/123` → editar rascunho (id de exemplo)
- `http://localhost:3000/deletemessages` → tela de exclusão
- `http://localhost:3000/deleteconfirmation/range/2024-01-01/2024-12-31` → confirmação de exclusão
- `http://localhost:3000/viewstatus/123` → status de envio (id de exemplo)
- `http://localhost:3000/sendconfirmation/123` → confirmação de envio
- `http://localhost:3000/configtab` → tela de configuração
- `http://localhost:3000/previewMessageConfirmation` → pré-visualização de confirmação
- `http://localhost:3000/signin` → tela de sign-in
- `http://localhost:3000/signin-simple-start` → fluxo sign-in start
- `http://localhost:3000/signin-simple-end` → fluxo sign-in end
- `http://localhost:3000/errorpage` → tela de erro genérica
- `http://localhost:3000/errorpage/403` → tela de erro com código específico

Notas importantes:
- Rotas com `/:id` usam valor de exemplo local (ex.: `123`) apenas para renderização.
- Algumas telas dependem de dados/API/Teams e podem mostrar vazio ou erro de autorização em preview local.

---

## ⚡ Quick Start (Copie e Cole)

```bash
# Setup único (se precisar atualizar Node)
nvm install 18 && nvm use 18

# Preview local do frontend
cd /home/herbet/cgugovbr/microsoft-teams-apps-company-communicator/Source/CompanyCommunicator/ClientApp
npm start
# Acesse: http://localhost:3000/newmessage

# Em outro terminal: testes
cd /home/herbet/cgugovbr/microsoft-teams-apps-company-communicator/Source
dotnet test Microsoft.Teams.Apps.CompanyCommunicator.sln --verbosity minimal

# Em outro terminal: frontend test
cd CompanyCommunicator/ClientApp
npm test -- --watchAll=false
```

---

## ✅ Validation Gates

- [ ] `dotnet test` — todos passam
- [ ] `npm test -- --watchAll=false` — todos passam
- [ ] `npm start` — `Compiled successfully`
- [ ] Browser test — abre http://localhost:3000/newmessage
- [ ] `dotnet test` — todos os testes backend passam

---

## 🎓 O Que Você Aprendeu

✅ Stack: ASP.NET Core 6 + React + .NET Functions  
✅ Padrão: Bot Framework + Teams + Service Bus  
✅ Testes: xUnit no backend, Jest no frontend  
✅ Deploy: ARM template + PowerShell automation  

---

## 🚦 Bloqueadores Conhecidos

| Item | Bloqueador | Workaround |
|---|---|---|
| Completo end-to-end | Exige Azure subscription + Entra ID | Trabalhe offline local, plan deploy depois |
| Teams sideload | Certificate/signature requirido | Usar `ngrok` + custom domain |
| Storage emulator | Sem Azure Storage local | Mock em dev, real em Azure |
| Bot webhook | URL pública necessária | Usar ngrok para local testing |
| `npm run build` local | Pode falhar com erro TS em `@griffel/style-types` (pré-existente) | Use `npm test` + `npm start` como gate local |

---

## 💡 Próximo Encontro

Quando você tiver Azure subscription + 3 app IDs prontos:
1. Executar `Deployment/deploy.ps1` ou ARM template
2. Validar recursos criados em Azure Portal
3. Instalar packages no Teams
4. Fazer smoke test fim-a-fim
5. (Opcional) Customizar + treinar equipe

**Tempo estimado:** 2–3 horas

---

**Criado:** 17 Mar 2026 | **Stack:** .NET 6.0.100, Node 16, React | **Status:** Local dev ✅, Azure deploy 📋
