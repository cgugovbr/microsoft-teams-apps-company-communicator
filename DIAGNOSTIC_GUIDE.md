# 🔍 Guia de Diagnóstico: Usuários Não Recebem Mensagens

**Padrão Identificado:** ✓ Alguns usuários específicos não recebem  
**Ambiente:** ✓ Azure Commercial  
**Data:** 2026-03-18

---

## Fase 1: Validar Infraestrutura de Autenticação

A primeira coisa a validar é se a aplicação consegue autenticar corretamente com Azure AD e acessar as APIs necessárias.

### Script: Check-AppRegistrations.ps1

**O que faz:** Valida se os AppIds e AppSecrets configurados conseguem gerar tokens válidos no seu tenant.

**Pré-requisitos:**
- PowerShell 7+ ou PowerShell 5.1 com módulos Az
- Arquivo `parameters.json` da sua implantação (em `/Deployment/parameters.json`)
- Credenciais com acesso ao Key Vault onde os secrets estão armazenados

**Como executar:**

```powershell
# Navegue até a pasta Support
cd Support/

# Execute o script passando seu arquivo de parameters
.\Check-AppRegistrations.ps1 -configFilePath "../Deployment/parameters.json"
```

**O que procurar na saída:**
- ✅ **Esperado**: Três tokens bem-sucedidos (Graph, Bot, Auth)
  ```
  Graph App Token: Successfully generated
  Bot Service Token: Successfully generated  
  Auth Token: Successfully generated
  ```

- ❌ **Problema 1 - Falha de Autenticação**:
  ```
  ERROR: Could not generate token for GraphAppClientId
  ```
  **Causa Provável:** AppId ou AppSecret incorretos no Key Vault  
  **Remediação:** Verifique em Azure Portal → Key Vault → Secrets as chaves-valor:
  - `GraphAppPassword`
  - `UserAppPassword`
  - `AuthorAppPassword`

- ❌ **Problema 2 - AppId não encontrado**:
  ```
  ERROR: App registration not found in tenant
  ```
  **Causa Provável:** AppId não registrado no Azure AD  
  **Remediação:** Azure Portal → App Registrations → Procure pelos AppIds

---

## Fase 2: Validar Permissões do Graph API

Se os tokens forem gerados com sucesso, o próximo passo é validar se a aplicação consegue acessar as APIs Graph necessárias para ver usuários e grupos.

### Script: Check-GraphApp.ps1

**O que faz:** Testa se consegue fazer queries no Microsoft Graph para:
- Listar grupos
- Listar usuários
- Verificar permissões do app

**Pré-requisitos:**
- PowerShell conectado ao Azure (`Connect-AzAccount`)
- TenantId, AppId e AppSecret do seu Graph App
- Permissões já configuradas no App Registration (GroupMember.Read.All, User.Read.All)

**Como executar:**

```powershell
cd Support/

# Versão 1: Apenas validar se o script roda OK
.\Check-GraphApp.ps1 `
  -tenantId "seu-tenant-id-aqui" `
  -AppId "seu-graph-app-id-aqui" `
  -AppSecret "seu-graph-app-secret-aqui"

# Versão 2: Fazer queries REAIS no Graph (mais lento, mais informativo)
.\Check-GraphApp.ps1 `
  -tenantId "seu-tenant-id-aqui" `
  -AppId "seu-graph-app-id-aqui" `
  -AppSecret "seu-graph-app-secret-aqui" `
  -FetchDataFromGraph
```

**O que procurar na saída:**

- ✅ **Esperado - Teste de Grupos bem-sucedido**:
  ```
  Testing Graph API - /groups endpoint
  Result: SUCCESS - Found X groups
  ```

- ✅ **Esperado - Teste de Usuários bem-sucedido**:
  ```
  Testing Graph API - /users endpoint
  Result: SUCCESS - Found Y users
  ```

- ❌ **Problema 1 - Erro 403 (Forbidden)**:
  ```
  ERROR 403: insufficient_claims or Forbidden
  ```
  **Causa Provável:** Permissões não concedidas ao App Registration  
  **Remediação:**
  1. Azure Portal → App Registrations → Seu Graph App
  2. API Permissions → "Add a permission"
  3. Procure por "Microsoft Graph" → Application permissions
  4. Habilite: `GroupMember.Read.All`, `User.Read.All`, `TeamsAppInstallation.ReadForUser.All`
  5. Clique "Grant admin consent"

- ❌ **Problema 2 - Usuários/Grupos encontrados mas vazios**:
  ```
  SUCCESS - Found 0 groups
  SUCCESS - Found 0 users
  ```
  **Causa Provável:** Usuários/Grupos não sincronizados com Azure AD, ou permissões incompletas  
  **Remediação:** Verifique:
  1. Se os usuários existem em Azure AD (Azure Portal → Azure AD → Users)
  2. Se os grupos existem em Azure AD (Azure Portal → Azure AD → Groups)
  3. Se o app tem mesmo permissões listadas acima

---

## Fase 3: Verificar Status de Entrega das Mensagens

Agora que sabemos que a infraestrutura está OK, vamos verificar **por que mensagens específicas falharam**.

No banco de dados Azure Table Storage, você pode ver o status de cada tentativa de entrega:

### Tabela: `NotificationData`
Contém cada mensagem enviada com status `Sent`, `Failed`, etc.

### Tabela: `SentNotificationData`  
Contém cada recebimento/falha por usuário

**Como acessar:**
1. Azure Portal → Storage Accounts → Conta do seu app
2. Tables → `SentNotificationData`
3. Procure por mensagens recentes e veja o status por usuário

**Status possíveis e significados:**

| Status | Código | Significado | Remediação |
|--------|--------|-------------|-----------|
| **Sent** | 204 | ✅ Mensagem entregue com sucesso | Sem ação |
| **Throttled** | 429 | ⏱️ Too many requests - Graph/Teams API limitando | Reduzir velocidade de envio, escalar Service Bus |
| **RecipientNotFound** | 404 | ❌ Usuário não encontrado no Teams | Verificar se usuário existe e tem app instalado |
| **Failed** | 400+ | ❌ Erro genérico | Ver detalhe do erro na coluna `FailureMessage` |
| **DeliveryFailed** | * | ❌ Falha na entrega ao Teams | Pode ser permissão, instalação, ou outro erro |

---

## Fase 4: Investigação por Padrão de Falha

### Cenário A: Status = "RecipientNotFound"
**Causa:** Usuário não reconhecido pelo Bot Framework / App não instalado
- [ ] Verificar se o usuário existe em `https://teams.microsoft.com` 
- [ ] Verificar se o app está instalado para aquele usuário via "Gerenciar apps"
- [ ] Se não: Por na Galeria de Apps corporativos e forçar instalação via política de grupo
- [ ] Se sim: Reabrir Teams (Shift+Alt+R no Windows, Cmd+Q no Mac)

### Cenário B: Status = "Throttled" (429)
**Causa:** Muitos requests simultâneos ao Teams ou Graph API
- [ ] Aumentar tempo entre envios no `Prep.Func` 
- [ ] Escalar Service Bus (Basic → Standard → Premium)
- [ ] Escalar Azure Functions tier (Consumption → App Service Plan S1+)
- [ ] Consultar `Wiki/Scale-app.md` para limites e configurações

### Cenário C: Status = "Failed" (400+) com mensagem de erro
**Cause depende da mensagem:**
- `Unauthorized (401)` → AppId/AppSecret inválido [Voltar a Fase 1]
- `Forbidden (403)` → Permissões insuficientes [Voltar a Fase 2]
- `BadRequest (400)` → Formato da mensagem inválido ou usuário inválido
- `NotFound (404)` → Recurso não encontrado (usuário/grupo/app)

### Cenário D: Propriétários não recebem mas membros recebem
**Causa:** Bug/limitação conhecida - Proprietários não aparecem em `members` list  
**Status Esperado:** `RecipientNotFound` ou `Failed`
- [ ] **Remediação 1 (Produto):** Verificar se há patch na versão do app - ver `Wiki/Release-notes.md`
- [ ] **Remediação 2 (Operacional):** Ao enviar, incluir proprietários TAMBÉM na lista de "Grupos designados"
- [ ] **Remediação 3 (Condicional):** Adicionar proprietários à lista de membros via PowerShell:
  ```powershell
  Get-TeamMember -GroupId "team-id" -Role Owner | 
    ForEach-Object { Add-TeamChannelUser -GroupId "team-id" -DisplayName $_.DisplayName }
  ```

---

## ✅ Próximos Passos Recomendados

**Se você quer diagnosticar agora:**

1. **Comece pela Fase 1** - Execute `Check-AppRegistrations.ps1`
   - Compartilhe comigo (seguro) os erros que aparecerem
   - Se passar: Continue para Fase 2

2. **Se passou Fase 1, execute Fase 2** - Execute `Check-GraphApp.ps1` com `-FetchDataFromGraph`
   - Compartilhe os últimos erros (se houver)
   - Se passar: Infraestrutura está OK, o problema é específico de usuário

3. **Fase 3/4** - Você vai verificar manualmente Table Storage ou usar queries SQL no portal

---

## 📊 Checklist de Diagnóstico Rápido

- [ ] Fase 1: AppRegistrations tokens → ✅ Passed / ❌ Error: ___
- [ ] Fase 2: Graph API access → ✅ Passed / ❌ Error: ___
- [ ] Fase 3: Verificar status em Table Storage → Users com RecipientNotFound? ___
- [ ] Fase 4: Identificar causa → Padrão: [ ] A / [ ] B / [ ] C / [ ] D

---

**Dúvidas?** Compartilhe:
1. Saídas dos scripts (remova credentials)
2. Status das mensagens em Table Storage
3. Qual padrão você vê (todos os usuários, apenas algumas pessoas, apenas proprietários, etc)
