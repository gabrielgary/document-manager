# 📄 Business Requirements Document (BRD)
## **Projeto: DocuFlow API — Sistema Corporativo de Gestão de Documentos**

| **Informações do Documento** | **Detalhes** |
| :--- | :--- |
| **Projeto** | DocuFlow API |
| **Versão** | 1.0.0 |
| **Autor** | Gabriel Pedro Aurélio (Backend Software Engineer) |
| **Status** | Aprovado para Desenvolvimento |
| **Stack Principal** | NestJS, TypeScript, Node.js, Express-Session, RxJS |

---

## 📌 1. Resumo Executivo

A **DocuFlow Inc.** necessita de um sistema backend centralizado e altamente seguro para o gerenciamento de documentos corporativos (estilo "mini Google Drive"). O objetivo do projeto **DocuFlow API** é fornecer uma infraestrutura robusta onde funcionários possam autenticar-se, carregar e transferir arquivos com eficiência, e administradores possam gerenciar permissões de acesso com controle granular. 

O resultado esperado é uma API REST/MVC construída sob as melhores práticas do framework **NestJS**, entregando alto desempenho no manuseio de arquivos pesados, conformidade com padrões de segurança Web (proteção de sessões e ocultação de credenciais) e total previsibilidade no contrato de respostas e tratamento de erros.

---

## 🎯 2. Objetivos do Negócio & Escopo

### 2.1. Objetivos do Negócio
* **Segurança e Conformidade:** Eliminar a exposição de dados sensíveis (hashes de senha) e proteger o fluxo de autenticação contra ataques XSS e CSRF utilizando cookies `httpOnly`.
* **Eficiência Operacional:** Permitir o download de arquivos de grande porte (até 10MB+) via *Streaming* não bloqueante, evitando consumo excessivo de memória RAM no servidor.
* **Observabilidade e Auditoria:** Notificar automaticamente canais de comunicação externos (ex: Slack via Webhook) sempre que um documento sensível for baixado, além de registrar a latência de todas as requisições.

### 2.2. Fora do Escopo (Out of Scope)
* Armazenamento em provedores Cloud externos (S3/Azure Blob) nesta fase inicial (arquivos serão mantidos localmente via volume montado).
* Edição colaborativa de documentos em tempo real.

---

## 🔒 3. Requisitos Funcionais (RF)

| ID | Módulo | Descrição do Requisito Funcional |
| :---: | :--- | :--- |
| **RF-01** | **Autenticação** | Login/Logout baseado em sessão armazenada via cookies `httpOnly`. |
| **RF-02** | **Autorização** | Restrição de rotas administrativas via `RolesGuard` alimentado pelo decorator `@Roles('admin')`. |
| **RF-03** | **Usuários** | Cadastro e gestão de usuários com **serialização obrigatória** para ocultar a propriedade `password`. |
| **RF-04** | **Upload** | Upload de arquivos com validação rígida de tamanho (máx. **10MB**) e tipos permitidos (`.pdf`, `.docx`, `.png`, `.jpg`). |
| **RF-05** | **Streaming** | Endpoint de download que utiliza *Node Streams* (`StreamableFile`) para servir arquivos de forma não bloqueante. |
| **RF-06** | **Notificação** | Servidor interno que consome `HttpModule` para notificar webhooks externos ao baixar documentos sensíveis. |
| **RF-07** | **Interface MVC** | Rota `/dashboard` renderizada em **Handlebars (.hbs)** exibindo a listagem gráfica de documentos para navegadores. |

---

## ⚡ 4. Requisitos Não Funcionais (RNF)

* **RNF-01 (Tipagem Estrita):** Código 100% escrito em TypeScript estrito, sem uso desnecessário do tipo `any`.
* **RNF-02 (Gerenciamento de Memória):** Uso de `fs.createReadStream()` para impedir alocação completa de arquivos na RAM.
* **RNF-03 (Observabilidade):** Middleware de log registrando Método, URL e tempo de resposta ($t_{\text{resposta}} = t_{\text{fim}} - t_{\text{inicio}}$) em ms.
* **RNF-04 (Padronização de API):**
  * **Sucesso:** Interceptor global padronizando retornos em `{ success: true, data: T, timestamp: string }`.
  * **Exceções:** Exception Filter global tratando exceções para evitar *stack trace leaks* em produção.

---

## 📁 5. Arquitetura & Estrutura de Diretórios

```text
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/roles.guard.ts
│   └── decorators/roles.decorator.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/create-user.dto.ts
│   └── entities/user.entity.ts
├── documents/
│   ├── documents.controller.ts
│   ├── documents.service.ts
│   └── dto/create-document.dto.ts
├── common/
│   ├── interceptors/transform.interceptor.ts
│   ├── filters/all-exceptions.filter.ts
│   └── middleware/logger.middleware.ts
├── notifications/
│   └── notifications.service.ts
├── views/
│   └── dashboard.hbs
├── app.module.ts
└── main.ts