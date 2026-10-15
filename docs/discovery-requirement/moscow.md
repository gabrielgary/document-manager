# 🎯 Matriz MoSCoW (Sprints de 2 Dias / 48 Horas)
## **Projeto: DocuFlow API — MVP para Portfólio**

Com o prazo extremamente enxuto de **2 dias**, a priorização severa é o único caminho para garantir que você entregue uma API **funcional, testável e sem bugs** ao final de 48 horas.

---

## 🟢 1. Must Have (Obrigatório / Core do Projeto)
*Sem estes itens, a API simplesmente não atende aos requisitos básicos de funcionamento.*

| Requisito | Módulo | Descrição / Implementação Rápida |
| :--- | :--- | :--- |
| **Auth Session + Cookie** | Auth | Login/Logout básico armazenando sessão via `express-session` com cookie `httpOnly`. |
| **`RolesGuard` + `@Roles()`** | Auth / Guards | Guard com `Reflector` checando a `role` do usuário logado para bloquear rotas admin. |
| **Serialização de Usuário** | Users | Ocultação do campo `password` na resposta usando `ClassSerializerInterceptor` (`@Exclude`). |
| **Upload com Validação** | Documents | Endpoint `POST /documents/upload` com `ParseFilePipe` limitando a 10MB e extensoes `.pdf, .docx, .png, .jpg`. |
| **Download por Streaming** | Documents | Endpoint `GET /documents/:id/download` retornando `StreamableFile` via `fs.createReadStream()`. |
| **Exception Filter Global** | Common | `AllExceptionsFilter` capturando erros para retornar contrato padronizado de erro sem expor *stack trace*. |

---

## 🟡 2. Should Have (Importante / Agrega Elevado Valor)
*Adicionam forte apelo técnico de arquitetura e observabilidade. Devem ser implementados se o Must Have for concluído no Dia 1.*

| Requisito | Módulo | Descrição / Implementação Rápida |
| :--- | :--- | :--- |
| **`TransformInterceptor`** | Common | Padronização de respostas JSON para `{ success: true, data: T, timestamp: string }` (ignorando `StreamableFile`). |
| **`LoggerMiddleware`** | Common | Middleware medindo e exibindo o tempo de resposta em milissegundos ($t_{\text{resposta}} = t_{\text{fim}} - t_{\text{inicio}}$) no console. |
| **ValidationPipe DTOs** | Users / Docs | Uso de `class-validator` nos corpos das requisições (`CreateUserDto`, `CreateDocumentDto`). |

---

## 🔴 3. Could Have (Desejável / Se Sobrar Tempo)
*Recursos secundários ou de integração externa. Apenas se o progresso estiver adiantado no final do Dia 2.*

| Requisito | Módulo | Descrição / Implementação Rápida |
| :--- | :--- | :--- |
| **Webhooks (`HttpModule`)** | Notifications | Disparo assíncrono para o Slack/Discord ao baixar documentos com `isSensitive: true`. |
| **Interface MVC Handlebars** | Views | Rota `/dashboard` simples renderizada com Handlebars mostrando a tabela HTML de documentos. |

---

## ⚪ 4. Won't Have (Fora do Escopo / Futuro)
*Completamente descartados para esta janela de 48 horas.*

* Armazenamento em provedores de nuvem como AWS S3 ou Azure Blob Storage (utilizar apenas armazenamento local `uploads/`).
* Banco de dados relacional complexo com múltiplas migrações (usar SQLite em memória ou MongoDB com Docker para setup imediato).
* Sistema de recuperação de senha via e-mail.
* Interface gráfica SPA (React / Next.js) — o foco do entregável é 100% backend / API REST.

---

## ⏱️ Cronograma Sugerido de 48 Horas

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CRONOGRAMA DE 2 DIAS                            │
├──────────────────────────────────┬─────────────────────────────────────┤
│ DIA 1: Core Architecture & Security│ DIA 2: I/O Streams & Polish        │
│ ├── App Boilerplate & Session    │ ├── File Upload & Stream Download   │
│ ├── RolesGuard & User Entity     │ ├── HttpModule Webhook & Logger     │
│ └── Exception Filter Global      │ └── MVC Dashboard & README / Tests  │
└──────────────────────────────────┴─────────────────────────────────────┘