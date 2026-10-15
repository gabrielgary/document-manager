```markdown
# 🏗️ High-Level Design (HLD)
## **Projeto: DocuFlow API — Sistema Corporativo de Gestão de Documentos**

---

## 🏛️ 1. Visão Geral da Arquitetura

O **DocuFlow API** adota uma arquitetura **Monólito Modular** sobre o framework **NestJS**. O sistema opera em modelo híbrido: expõe uma **API RESTful** padronizada em JSON para consumidores de API/integradores e uma **Camada MVC (Handlebars)** para navegação e visualização web direta via browser.

```text
                                  ┌─────────────────────────┐
                                  │   Clients / Browsers    │
                                  └────────────┬────────────┘
                                               │
                                      HTTP / HTTPS (Cookies)
                                               │
                                               ▼
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                       DOCUFLOW API                                           │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                 COMMON INFRASTRUCTURE                                 │  │
│  │   LoggerMiddleware  ──►  AllExceptionsFilter  ──►  TransformInterceptor (JSON format)  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                              │                                              │
│      ┌───────────────────────────┬───────────┴───────────┬───────────────────────────┐      │
│      ▼                           ▼                       ▼                           ▼      │
│  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐       ┌───────────────┐  │
│  │  Auth Module  │       │ Users Module  │       │ Documents Mod.│       │ Notifications │  │
│  │ ───────────── │       │ ───────────── │       │ ───────────── │       │ ───────────── │  │
│  │ Session Store │       │ Serializer    │       │ Multer Pipe   │       │ HttpModule    │  │
│  │ RolesGuard    │       │ ClassValidator│       │ StreamableFile│       │ RxJS / Axios  │  │
│  └───────┬───────┘       └───────┬───────┘       └───────┬───────┘       └───────┬───────┘  │
│          │                       │                       │                       │          │
└──────────┼───────────────────────┼───────────────────────┼───────────────────────┼──────────┘
           │                       │                       │                       │
           ▼                       ▼                       ▼                       ▼
   ┌───────────────┐       ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
   │ Session Store │       │ Database Entity│      │ Local Storage │       │ External Slack│
   │ (In-Memory)   │       │ (SQLite / Mongo)│      │ (/uploads)    │       │ Webhook API   │
   └───────────────┘       └───────────────┘       └───────────────┘       └───────────────┘

```

---

## 🔄 2. Fluxos Principais de Dados (Data Flow)

### 2.1. Autenticação & Autorização (RBAC)

1. **Requisição de Login:** O cliente envia `POST /auth/login`. O `AuthService` valida e-mail e verifica a hash da senha (`bcrypt`).
2. **Criação de Sessão:** Em caso de sucesso, o middleware `express-session` armazena os dados da sessão no servidor e injeta o cookie `connect.sid` (`httpOnly`, `sameSite`, `secure`) na resposta.
3. **Controle de Acesso (Guards):** Nas rotas protegidas por perfil (ex: `@Roles('admin')`), o `RolesGuard` intercepta a requisição, recupera a sessão ativa do cookie, utiliza o `Reflector` do NestJS para comparar as roles do usuário e autoriza ou nega o acesso (`403 Forbidden`).

### 2.2. Streaming de Download & Webhook de Auditoria

1. **Requisição de Arquivo:** O cliente autenticado solicita `GET /documents/:id/download`.
2. **I/O Não Bloqueante:** O `DocumentsService` abre um fluxo de leitura (`fs.createReadStream()`) e o encapsula em uma instância de `StreamableFile`.
3. **Trigger de Auditoria:** Caso o documento possua a flag `isSensitive: true`, o `NotificationsService` é acionado de forma assíncrona via `HttpModule` para notificar um Webhook externo (Slack/Discord) sem travar o download.
4. **Bypass de Envelope JSON:** O `TransformInterceptor` identifica que o retorno é um fluxo binário (`StreamableFile`) e ignora a formatação JSON para permitir o download nativo pelo cliente.

---

## 🧩 3. Decomposição de Módulos (Module Design)

| Módulo | Responsabilidade Principal | Componentes Chave |
| --- | --- | --- |
| **AuthModule** | Gestão de sessões HTTP, login, logout e controle de acesso RBAC. | `AuthController`, `AuthService`, `RolesGuard`, `@Roles()` |
| **UsersModule** | Cadastro, consulta e serialização de dados de usuários. | `UsersController`, `UsersService`, `UserEntity`, `CreateUserDto` |
| **DocumentsModule** | Upload validado, persistência local e download via streams. | `DocumentsController`, `DocumentsService`, `ParseFilePipe` |
| **NotificationsModule** | Auditoria e envio de notificações para serviços externos. | `NotificationsService`, `HttpModule` |
| **CommonModule** | Infraestrutura transversal (Logs, Filtros de Exceção, Interceptors). | `LoggerMiddleware`, `AllExceptionsFilter`, `TransformInterceptor` |

---

## 🗄️ 4. Modelo de Entidades / Relacional

```text
┌──────────────────────────┐               ┌──────────────────────────┐
│          USERS           │               │        DOCUMENTS         │
├──────────────────────────┤               ├──────────────────────────┤
│ id: string (UUID)        │ 1           * │ id: string (UUID)        │
│ name: string             ├───────────────┤ title: string            │
│ email: string (Unique)   │               │ originalName: string     │
│ password: string (Excl.) │               │ mimeType: string         │
│ role: 'admin' | 'user'   │               │ size: number             │
│ createdAt: Date          │               │ isSensitive: boolean     │
└──────────────────────────┘               │ filePath: string         │
                                           │ ownerId: string (FK)     │
                                           │ createdAt: Date          │
                                           └──────────────────────────┘

```

---

## 🛡️ 5. Decisões Arquiteturais Relevantes (ADRs)

* **ADR-01: Autenticação baseada em Session + Cookie httpOnly**
* *Contexto:* Garantir segurança contra roubo de credenciais em scripts client-side (XSS).
* *Decisão:* Utilizar `express-session` com cookies marcados estritamente com `httpOnly` e `sameSite: 'lax'`, mantendo a chave de sessão protegida contra acesso via JavaScript no navegador.


* **ADR-02: Download de Arquivos via StreamableFile**
* *Contexto:* Arquivos grandes (até 10MB+) podem sobrecarregar a memória RAM se carregados inteiramente em buffers (`fs.readFileSync`).
* *Decisão:* Utilizar `fs.createReadStream()` encapsulado em `StreamableFile` para transferir os dados em pedaços (*chunks*), mantendo o consumo de memória baixo e constante.


* **ADR-03: Serialização de Entidades com @Exclude**
* *Contexto:* Risco de vazamento acidental de hashes de senha em respostas JSON da API.
* *Decisão:* Anotar a propriedade `password` com `@Exclude()` na entidade `User` e aplicar o `ClassSerializerInterceptor` globalmente.
```