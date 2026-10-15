# 📖 User Stories & Critérios de Aceite
## **Projeto: DocuFlow API — Sistema Corporativo de Gestão de Documentos**

---

### 🟢 Epico 1: Autenticação & Gestão de Usuários

#### **US-01: Autenticação Baseada em Sessão com Cookie Secure**
> **Como** Funcionário da DocuFlow  
> **Eu quero** realizar login com meu e-mail e senha e receber uma sessão segura  
> **Para que** eu possa acessar a API e realizar operações no sistema sem enviar credenciais a cada requisição.

**Critérios de Aceite:**
- [ ] O endpoint `POST /auth/login` deve validar e-mail e senha.
- [ ] Em caso de sucesso, deve criar uma sessão no servidor e definir o cookie `connect.sid` na resposta.
- [ ] O cookie de sessão deve obrigatoriamente possuir as flags `httpOnly: true`, `sameSite: 'lax'` (ou `'strict'`) e `secure: true` (em produção).
- [ ] O endpoint `POST /auth/logout` deve destruir a sessão no servidor e limpar o cookie do navegador.
- [ ] Tentativas de login inválidas devem retornar erro `401 Unauthorized` genérico ("Credenciais inválidas").

---

#### **US-02: Cadastro e Serialização de Usuários**
> **Como** Administrador do Sistema  
> **Eu quero** cadastrar novos usuários e listar os existentes  
> **Para que** a equipe possa acessar a plataforma sem o risco de vazamento de credenciais nas respostas da API.

**Critérios de Aceite:**
- [ ] O endpoint `POST /users` deve aceitar nome, e-mail, senha e perfil (`user` ou `admin`).
- [ ] A senha deve ser criptografada (hash com `bcrypt` ou `argon2`) antes de ser salva na base de dados.
- [ ] **Serialização Rigorosa:** NENHUMA resposta de API (`POST /users`, `GET /users`, `GET /users/:id`) pode incluir o campo `password` ou seu hash.
- [ ] O DTO de criação deve utilizar `class-validator` para garantir e-mail válido e senha forte (mínimo de 8 caracteres).

---

### 🟡 Epico 2: Gestão de Documentos & Performance de I/O

#### **US-03: Upload Controlado de Arquivos**
> **Como** Funcionário da DocuFlow  
> **Eu quero** fazer upload de documentos para o sistema  
> **Para que** eu possa armazená-los e compartilhá-los com a organização.

**Critérios de Aceite:**
- [ ] O endpoint `POST /documents/upload` deve aceitar requisições do tipo `multipart/form-data`.
- [ ] **Validação de Tamanho:** Arquivos maiores que **10MB** devem ser rejeitados com `400 Bad Request` e mensagem explicativa.
- [ ] **Validação de Formato:** Apenas extensões e MIME types correspondentes a `.pdf`, `.docx`, `.png` e `.jpg` devem ser aceitos.
- [ ] Arquivos válidos devem ser salvos em diretório protegido e metadados (nome, tamanho, tipo, autor, flag de sensível) gravados no banco.

---

#### **US-04: Download por Streaming Não Bloqueante**
> **Como** Usuário Autenticado  
> **Eu quero** baixar/visualizar documentos grandes através de fluxo contínuo (Stream)  
> **Para que** o download seja rápido e não sobrecarregue a memória RAM do servidor.

**Critérios de Aceite:**
- [ ] O endpoint `GET /documents/:id/download` deve retornar uma instância de `StreamableFile`.
- [ ] O arquivo deve ser lido via `fs.createReadStream()` sem carregar o buffer inteiro em memória.
- [ ] A resposta HTTP deve conter os headers corretos (`Content-Type` e `Content-Disposition`).
- [ ] Caso o arquivo físico não exista no disco, deve retornar erro `404 Not Found` tratado pelo Exception Filter.

---

### 🔴 Epico 3: Segurança, Autorização & Observabilidade

#### **US-05: Controle de Acesso Baseado em Perfis (RBAC)**
> **Como** Administrador de TI  
> **Eu quero** restringir rotas administrativas apenas a usuários com perfil `admin`  
> **Para que** usuários comuns não executem ações privilegiadas.

**Critérios de Aceite:**
- [ ] Deve existir o decorator customizado `@Roles('admin')`.
- [ ] O `RolesGuard` deve interceptar as requisições, ler os metadados da rota com `Reflector` e comparar com a `role` do usuário logado na sessão.
- [ ] Se o usuário não possuir o perfil exigido, deve retornar `403 Forbidden` ("Acesso negado").
- [ ] Se o usuário não estiver autenticado, deve retornar `401 Unauthorized`.

---

#### **US-06: Notificação Automática de Downloads Sensíveis**
> **Como** Oficial de Segurança da Informação  
> **Eu quero** receber um alerta via Webhook quando um documento marcado como sensível for baixado  
> **Para que** a empresa mantenha auditabilidade sobre dados confidenciais.

**Critérios de Aceite:**
- [ ] O `NotificationsService` deve utilizar o `HttpModule` (`Axios` / `RxJS`) do NestJS.
- [ ] Sempre que o endpoint de download for chamado para um documento com a flag `isSensitive: true`, o serviço deve disparar um `POST` assíncrono para a URL do Webhook (ex: Slack/Discord).
- [ ] A falha na entrega do Webhook não deve interromper nem quebrar a transferência do arquivo para o usuário.

---

#### **US-07: Padronização Global & Middleware de Log**
> **Como** Engenheiro de Plataforma  
> **Eu quero** que todas as requisições gerem logs de latência e retornem respostas padronizadas  
> **Para que** a API seja fácil de integrar, monitorar e depurar.

**Critérios de Aceite:**
- [ ] **Logger Middleware:** Deve registrar `[HTTP] Método Rota - Status - Tempo_ms` para cada requisição concluída.
- [ ] **TransformInterceptor:** Todas as respostas bem-sucedidas em JSON devem seguir o formato:
  ```json
  {
    "success": true,
    "data": { ... },
    "timestamp": "2026-10-03T05:35:24.000Z"
  }