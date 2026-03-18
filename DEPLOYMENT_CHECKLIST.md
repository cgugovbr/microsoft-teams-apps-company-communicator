# Roteiro Deploy Azure para Company Communicator

## Status Atual
✅ App local rodando em https://localhost:5001  
✅ 305 testes passando  
✅ Frontend compilando  

---

## 📋 Fase 1: Preparação Azure AD (30–45 min)

### Requisitos
- Acesso ao [Azure Portal](https://portal.azure.com)
- Subscription Azure com contributor role
- Acesso ao [Entra ID](https://entra.microsoft.com) (Azure AD)

### Passos

#### 1.1 Registrar Azure AD App #1 (User Bot)
- **Portal:** https://portal.azure.com → Entra ID → App registrations → New registration
- **Name:** `Company Communicator User`
- **Account types:** "Accounts in any organizational directory"
- **Copy after registration:**
  - Application (client) ID → `$UserAppId`
  - Tenant ID → `$TenantId`
- **Criar client secret:**
  - Certificates & secrets → New client secret
  - Copy **Value** → `$UserAppPassword`

#### 1.2 Registrar Azure AD App #2 (Author Bot)
- Repeat 1.1 with name `Company Communicator Author`
- Copy ID → `$AuthorAppId` and secret → `$AuthorAppPassword`

#### 1.3 Registrar Azure AD App #3 (Graph App)
- Name: `Company Communicator App`
- Account types: "Accounts in this organizational directory only"
- Copy ID → `$GraphAppId` and secret → `$GraphAppPassword`

---

## 🏗️ Fase 2: Deploy Infraestrutura Azure (60–90 min)

### Opção A: PowerShell Script (Recomendado, Windows/pwsh)
```bash
# Pré-requisitos
# - Azure CLI v2.49.0+ (https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
# - PowerShell 7+ (https://github.com/PowerShell/PowerShell/releases)
# - jq (ferramenta JSON)

cd Deployment
# Editar parameters.json com seus valores
nano parameters.json  # ou editor de sua escolha

# Preencher:
# - subscriptionId
# - subscriptionTenantId
# - userObjectId (seu Azure AD user object ID)
# - resourceGroupName (ex: "CompanyCommunicatorRG")
# - region (ex: "eastus")
# - baseResourceName (ex: "contoso-cc")
# - senderUPNList (ex: "author1@tenant.onmicrosoft.com;author2@tenant.onmicrosoft.com")
# - Valores dos AppIds/Secrets do Passo 1

# Executar
./deploy.ps1
# Vai pedir login 2x (Azure subscription + Entra ID)
# Vai criar ZIP files cc-authors.zip e cc-users.zip

# Output final: checar Deployment/logs.zip se houver erro
```

### Opção B: ARM Template Manual (Azure Portal, mais lento)
- Portal: https://portal.azure.com → Deploy a custom template
- Template file: `Deployment/azuredeploy.json`
- Fill parameters (mesmos do Passo 1)
- Review + Create

---

## 📦 Fase 3: Instalar Pacotes no Teams (30–45 min)

### 3.1 Instalar App de Authors
- Teams app studio ou upload customizado
- Arquivo: `cc-authors.zip` (gerado em Deployment/)
- Install to team of authors
- Adicionar aba "Company Communicator" (Configurable Tab)

### 3.2 Publicar App de Users
- Tenant app catalog upload: `cc-users.zip`
- Testar instalação em time piloto

---

## 🧪 Fase 4: Smoke Test End-to-End (15–30 min)

1. **Acesse app como author:**
   - Vá para chat da equipe de authors
   - Abra aba Company Communicator
   - Click "Compose" → criar rascunho

2. **Envie mensagem:**
   - Selecione destinatários (um grupo pequeno)
   - Send
   - Espere 1–2 minutos para processamento

3. **Valide entrega:**
   - Verifique que usuários recebem mensagem em chat
   - Conferir App Insights / Azure Monitor para errors
   - Exportar relatório de entrega (PDF)

---

## ❌ Troubleshooting Comum

| Problema | Causa | Solução |
|---|---|---|
| App não abre em Teams | App ID não encontrado | Revisar manifest.json + IDs em key-vault |
| Mensagens não enviam | Storage/Service Bus offline | Revisar connection strings em App Service settings |
| Auth error 401 | Token inválido | Atualizar AzureAd:ClientId em appsettings.json |
| Função não processa | Missing Graph permissions | Azure Portal → função app → admin consent |

---

## 📊 Pós-Deploy Checklist

- [ ] App Service respondendo em custom domain
- [ ] Azure Functions rodando (check logs)
- [ ] Storage account com tabelas/blobs criadas
- [ ] Service Bus com filas vazias (sem erros)
- [ ] keyvault com certificates/secrets
- [ ] Application Insights coletando telemetry
- [ ] Teste piloto com 5–10  users passou
- [ ] Alertas criados para falhas críticas

---

## 🔐 Segurança Pós-Deploy

- [ ] Desabilitar acesso anônimo ao App Service
- [ ] Configurar HTTPS obrigatório
- [ ] Habilitar Managed Identity (remover secrets hardcoded)
- [ ] Rotar app secrets a cada 90 dias
- [ ] Limitar acesso ao Key Vault via RBAC

---

## 📞 Documentação Oficial

- PowerShell deployment: [Wiki/Deployment-guide-powershell.md](../Wiki/Deployment-guide-powershell.md)
- ARM template manual: [Wiki/Deployment-guide.md](../Wiki/Deployment-guide.md)
- Troubleshooting: [Wiki/Troubleshooting.md](../Wiki/Troubleshooting.md)
- Architecture: [Wiki/Solution-overview.md](../Wiki/Solution-overview.md)

---

## 💰 Custo Estimado (USA East)

- App Service (Standard, 2x): ~$150/month
- Azure Functions: ~$0–50/month (pay-per-execution)
- Storage Account: ~$1–5/month
- Service Bus: ~$10–50/month (depending on messages)
- **Total: $160–250/month** (pode ser reduzido em dev/test)

Veja: [Wiki/Cost-estimate.md](../Wiki/Cost-estimate.md)

---

## ✅ Quando Estiver Pronto Para Começar Deploy

Execute este checklist:

- [ ] 3 Azure AD apps criados (User, Author, Graph)
- [ ] Valores salvos: TenantId, AppIds (3x), Passwords (3x), UserObjectId
- [ ] Azure subscription selecionada
- [ ] Equipe de autores criada no Teams
- [ ] PowerShell/jq instalados (se usar script)
- [ ] Conhecer pelo menos 2 UPNs de autores (ex: author1@company.com)

Então execute: **Fase 2** (Deploy script) → **Fase 3** (Teams install) → **Fase 4** (Test)
