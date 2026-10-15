# 📋 Acceptance Criteria Detalhados (Gherkin / Given-When-Then)
## **Projeto: DocuFlow API — Sistema Corporativo de Gestão de Documentos**

---

## 🟢 Epico 1: Autenticação & Gestão de Usuários

### **US-01: Autenticação Baseada em Sessão com Cookie Secure**

#### **Cenário 01: Login efetuado com sucesso**
- **Dado que** exista um usuário cadastrado com e-mail `"dev@docuflow.com"` e senha `"Senha@123"`
- **Quando** enviar uma requisição `POST /auth/login` com os dados válidos
- **Então** o status da resposta deve ser `200 OK`
- **E** a resposta deve conter o header `Set-Cookie` com a chave `connect.sid`
- **E** o cookie deve conter as propriedades `HttpOnly`, `SameSite=Lax` (ou `Strict`)
- **E** a sessão deve ser salva e ativa no servidor.

#### **Cenário 02: Tentativa de login com credenciais inválidas**
- **Dado que** o usuário informe a senha `"SenhaErrada"`
- **Quando** enviar a requisição `POST /auth/login`
- **Então** o status da resposta deve ser `401 Unauthorized`
- **E** o corpo da resposta não deve revelar se o erro foi no e-mail ou na senha (mensagem genérica)
- **E** nenhum cookie de sessão deve ser emitido.

#### **Cenário 03: Logout de usuário autenticado**
- **Dado que** um usuário esteja autenticado com uma sessão ativa
- **Quando** enviar uma requisição `POST /auth/logout`
- **Então** o status da resposta deve ser `200 OK`
- **E** a sessão no servidor deve ser destruída
- **E** o cookie de sessão no navegador deve ser expirado/limpo.

---

### **US-02: Cadastro e Serialização de Usuários**

#### **Cenário 01: Cadastro bem-sucedido de usuário**
- **Dado que** o DTO de criação contenha nome `"Gabriel Aurélio"`, e-mail `"gabriel@docuflow.com"`, senha `"SecurePass123!"` e role `"user"`
- **Quando** enviar uma requisição `POST /users`
- **Então** o status da resposta deve ser `201 Created`
- **E** a senha gravada no banco deve estar como hash (utilizando `bcrypt` com salt)
- **E** o corpo da resposta **não deve conter** o campo `password` ou seu hash.

#### **Cenário 02: Falha de validação nos dados de entrada (ValidationPipe)**
- **Dado que** o e-mail seja informado no formato inválido `"gabriel-invalid-email"`
- **Ou** a senha possua menos de 8 caracteres
- **Quando** enviar a requisição `POST /users`
- **Então** o status da resposta deve ser `400 Bad Request`
- **E** a resposta deve retornar uma lista detalhada dos campos inválidos gerada pelo `class-validator`.

#### **Cenário 03: Listagem de usuários omitindo a propriedade de senha**
- **Dado que** existam múltiplos usuários cadastrados no banco de dados
- **Quando** enviar uma requisição `GET /users`
- **Então** o status da resposta deve ser `200 OK`
- **E** todos os objetos retornados no array de dados devem ocultar estritamente o campo `password`.

---

## 🟡 Epico 2: Gestão de Documentos & Performance de I/O

### **US-03: Upload Controlado de Arquivos**

#### **Cenário 01: Upload bem-sucedido de documento dentro dos limites**
- **Dado que** o usuário esteja autenticado
- **E** o arquivo enviado possua tamanho de `5MB` e formato `.pdf`
- **Quando** enviar a requisição `POST /documents/upload` via `multipart/form-data`
- **Então** o status da resposta deve ser `201 Created`
- **E** o arquivo deve ser salvo no diretório de destino
- **E** os metadados (nome original, extensão, tamanho e id do autor) devem ser salvos na base de dados.

#### **Cenário 02: Rejeição por tamanho excedido (> 10MB)**
- **Dado que** o arquivo enviado possua `12MB`
- **Quando** enviar a requisição `POST /documents/upload`
- **Então** o status da resposta deve ser `400 Bad Request`
- **E** a mensagem de erro deve indicar que o arquivo excede o limite máximo permitido de 10MB
- **E** o arquivo **não deve** ser persistido no disco.

#### **Cenário 03: Rejeição por formato/MIME type não permitido**
- **Dado que** o arquivo enviado seja um executável `.exe` ou script `.js`
- **Quando** enviar a requisição `POST /documents/upload`
- **Então** o status da resposta deve ser `400 Bad Request`
- **E** o pipeline de validação (`ParseFilePipe`) deve interromper o processamento antes do upload.

---

### **US-04: Download por Streaming Não Bloqueante**

#### **Cenário 01: Streaming de documento existente**
- **Dado que** um documento com ID `"doc-123"` exista no banco e no sistema de arquivos
- **Quando** o usuário autenticado fizer uma requisição `GET /documents/doc-123/download`
- **Então** o status da resposta deve ser `200 OK`
- **E** o header `Content-Type` deve corresponder ao MIME type do arquivo (ex: `application/pdf`)
- **E** o header `Content-Disposition` deve conter `attachment; filename="..."`
- **E** o arquivo deve ser transmitido via `StreamableFile` (`fs.createReadStream`).

#### **Cenário 02: Tentativa de download de documento inexistente**
- **Dado que** o ID `"doc-999"` não exista no banco de dados ou no disco
- **Quando** enviar a requisição `GET /documents/doc-999/download`
- **Então** o status da resposta deve ser `404 Not Found`
- **E** o erro deve ser capturado pelo `AllExceptionsFilter` retornando o formato JSON padrão.

---

## 🔴 Epico 3: Segurança, Autorização & Observabilidade

### **US-05: Controle de Acesso Baseado em Perfis (RBAC)**

#### **Cenário 01: Usuário comum tenta acessar rota protegida por @Roles('admin')**
- **Dado que** o usuário esteja autenticado com o perfil `role: "user"`
- **Quando** tentar acessar a rota `DELETE /documents/:id` decorada com `@Roles('admin')`
- **Então** o `RolesGuard` deve interceptar a requisição
- **E** retornar o status `403 Forbidden` com a mensagem `"Acesso negado: privilégios insuficientes"`.

#### **Cenário 02: Administrador acessa rota restrita com sucesso**
- **Dado que** o usuário esteja autenticado com o perfil `role: "admin"`
- **Quando** acessar a rota `DELETE /documents/:id`
- **Então** o `RolesGuard` deve permitir a execução do handler da rota
- **E** a operação deve ser concluída com sucesso.

#### **Cenário 03: Usuário não autenticado tenta acessar rota protegida**
- **Dado que** não exista cookie de sessão ativo na requisição
- **Quando** tentar acessar qualquer rota protegida por guard
- **Então** o status da resposta deve ser `401 Unauthorized`.

---

### **US-06: Notificação Automática de Downloads Sensíveis**

#### **Cenário 01: Disparo de Webhook ao baixar documento sensível**
- **Dado que** o documento `"doc-123"` possua a flag `isSensitive: true`
- **Quando** um usuário realizar o download do arquivo via `GET /documents/doc-123/download`
- **Então** o `NotificationsService` deve invocar o `HttpModule`
- **E** disparar uma requisição `POST` assíncrona para a URL do Webhook configurada contendo os dados do documento e quem baixou.

#### **Cenário 02: Resiliência em caso de falha no Webhook externo**
- **Dado que** o servidor de Webhook esteja indisponível (retornando `500` ou *timeout*)
- **Quando** o download do documento sensível for iniciado
- **Então** a falha no Webhook deve ser tratada e registrada em log de aviso (*warn*)
- **E** o download do arquivo pelo usuário **deve continuar normalmente sem interrupção**.

---

### **US-07: Padronização Global & Middleware de Log**

#### **Cenário 01: Registro de logs de latência via Middleware**
- **Dado que** qualquer requisição chegue ao servidor
- **Quando** a requisição for processada e finalizada pelo controller
- **Então** o `LoggerMiddleware` deve calcular a latência $t_{\text{resposta}} = t_{\text{fim}} - t_{\text{inicio}}$ em milissegundos
- **E** emitir um log formatado no console: `[HTTP] GET /documents - 200 - 14ms`.

#### **Cenário 02: Interceptação e padronização de respostas JSON**
- **Dado que** um controller retorne um objeto `{ id: 1, name: "Arquivo.pdf" }`
- **Quando** a resposta passar pelo `TransformInterceptor`
- **Então** o corpo final da resposta deve ser envelopado na estrutura:
  ```json
  {
    "success": true,
    "data": { "id": 1, "name": "Arquivo.pdf" },
    "timestamp": "2026-10-03T05:36:58.000Z"
  }