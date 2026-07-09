# Referência da API — Form Builder

API REST do backend Spring Boot. Salvo indicação em contrário, o corpo de requisição e resposta é **JSON**.

- **Base URL (local):** `http://localhost:8080`
- **Autenticação:** JWT via cabeçalho `Authorization: Bearer <token>`
- **Rotas públicas** (sem token): `/health`, `/auth/register`, `/auth/login`, `/public/**`
- **Todas as demais rotas exigem token válido.**

Os campos marcados como obrigatórios refletem as validações de Bean Validation (`@NotBlank`, `@NotNull`, `@Email`, `@Size`, `@Min`) presentes nos DTOs de request.

---

## Saúde

### `GET /health`
Verifica se o serviço está no ar. Não exige autenticação.

---

## Autenticação — `/auth`

### `POST /auth/register`
Cria um novo usuário.

**Body**

| Campo | Tipo | Regras |
|-------|------|--------|
| `name` | string | obrigatório |
| `email` | string | obrigatório, formato de e-mail |
| `password` | string | obrigatório, mínimo 6 caracteres |

### `POST /auth/login`
Autentica e retorna um token JWT.

**Body**

| Campo | Tipo | Regras |
|-------|------|--------|
| `email` | string | obrigatório, formato de e-mail |
| `password` | string | obrigatório |

**Resposta:** token JWT a ser usado no cabeçalho `Authorization` das rotas protegidas.

---

## Formulários — `/forms`

Todas as rotas abaixo exigem autenticação. As operações são restritas ao **dono** do formulário.

### `POST /forms`
Cria um formulário.

| Campo | Tipo | Regras |
|-------|------|--------|
| `title` | string | obrigatório |
| `description` | string | opcional |

### `GET /forms`
Lista os formulários do usuário autenticado.

### `GET /forms/search`
Busca/filtra formulários do usuário (por título e/ou status de publicação).

### `GET /forms/{formId}`
Retorna os detalhes de um formulário.

### `PUT /forms/{formId}`
Atualiza título/descrição de um formulário.

| Campo | Tipo | Regras |
|-------|------|--------|
| `title` | string | obrigatório |
| `description` | string | opcional |

### `DELETE /forms/{formId}`
Remove um formulário.

### `PATCH /forms/{formId}/publish`
Publica o formulário (gera/ativa o `public_slug`).

### `PATCH /forms/{formId}/unpublish`
Despublica o formulário.

---

## Seções

Vinculadas a um formulário. Exigem autenticação e posse do formulário.

### `POST /forms/{formId}/sections`
Cria uma seção no formulário.

| Campo | Tipo | Regras |
|-------|------|--------|
| `title` | string | obrigatório |
| `description` | string | opcional |
| `position` | inteiro | obrigatório, ≥ 1 |

### `GET /forms/{formId}/sections`
Lista as seções de um formulário.

### `PUT /sections/{sectionId}`
Atualiza uma seção (mesmos campos do `POST`).

### `DELETE /sections/{sectionId}`
Remove uma seção.

---

## Perguntas

Vinculadas a uma seção. Exigem autenticação.

### `POST /sections/{sectionId}/questions`
Cria uma pergunta na seção.

| Campo | Tipo | Regras |
|-------|------|--------|
| `title` | string | obrigatório |
| `description` | string | opcional |
| `type` | enum | obrigatório — `TEXTAREA`, `CHECKBOX` ou `SELECTION` |
| `required` | booleano | obrigatório |
| `position` | inteiro | obrigatório, ≥ 1 |

### `GET /sections/{sectionId}/questions`
Lista as perguntas de uma seção.

### `PUT /questions/{questionId}`
Atualiza uma pergunta (mesmos campos do `POST`).

### `DELETE /questions/{questionId}`
Remove uma pergunta.

---

## Opções de pergunta

Para perguntas de múltipla escolha (`CHECKBOX`, `SELECTION`). Exigem autenticação.

### `POST /questions/{questionId}/options`
Cria uma opção na pergunta.

| Campo | Tipo | Regras |
|-------|------|--------|
| `label` | string | obrigatório (texto exibido) |
| `value` | string | obrigatório (valor armazenado) |
| `position` | inteiro | obrigatório, ≥ 1 |

### `GET /questions/{questionId}/options`
Lista as opções de uma pergunta.

### `PUT /questions/options/{optionId}`
Atualiza uma opção (mesmos campos do `POST`).

### `DELETE /questions/options/{optionId}`
Remove uma opção.

---

## Área pública — `/public`

Rotas **sem autenticação**, usadas pelo respondente. O formulário é acessado pelo seu `public_slug`.

### `GET /public/forms/{publicSlug}`
Retorna a estrutura pública do formulário (seções, perguntas e opções), sem dados sensíveis do dono.

### `POST /public/forms/{publicSlug}/responses`
Inicia uma resposta ao formulário. Retorna o identificador da resposta e um `access_token`.

| Campo | Tipo | Regras |
|-------|------|--------|
| `respondentName` | string | opcional |
| `respondentEmail` | string | opcional, formato de e-mail |

### `POST /public/responses/{responseId}/submit`
Envia (finaliza) a resposta, gravando as respostas de cada pergunta.

| Campo | Tipo | Regras |
|-------|------|--------|
| `accessToken` | string | obrigatório (o token recebido ao iniciar a resposta) |
| `answers` | lista | obrigatório — lista de respostas por pergunta |

Cada item de `answers`:

| Campo | Tipo | Regras |
|-------|------|--------|
| `questionId` | UUID | obrigatório |
| `value` | string | opcional |

---

## Respostas (visão do dono) — `/forms/{formId}/responses`

Exigem autenticação e posse do formulário.

### `GET /forms/{formId}/responses`
Lista todas as respostas recebidas por um formulário.

### `GET /forms/{formId}/responses/{responseId}`
Retorna os detalhes de uma resposta específica (incluindo as respostas por pergunta).

### `GET /forms/{formId}/responses/search/period`
Busca respostas dentro de um intervalo de datas.

**Query params**

| Parâmetro | Tipo | Formato |
|-----------|------|---------|
| `start` | data/hora | ISO 8601 (`yyyy-MM-ddTHH:mm:ss`) |
| `end` | data/hora | ISO 8601 (`yyyy-MM-ddTHH:mm:ss`) |

---

## Consultas

Consultas analíticas em SQL nativo (ver [BANCO-DE-DADOS.md](./BANCO-DE-DADOS.md#consultas-avançadas-sql-nativo)). Exigem autenticação.

### `GET /search/response-counts`
Contagem de respostas **finalizadas** por formulário publicado do usuário.

### `GET /search/forms/more-complete-than-drafts`
Formulários publicados com mais perguntas do que **qualquer** rascunho do usuário (usa `HAVING ... > ALL`).

### `GET /search/users/with-published-forms`
Retorna o usuário caso ele possua ao menos um formulário publicado (usa `EXISTS`).

### `GET /forms/{formId}/questions/search/without-answers`
Perguntas de um formulário que **não** receberam resposta em um período.

**Query params**

| Parâmetro | Tipo | Formato |
|-----------|------|---------|
| `start` | data/hora | ISO 8601 |
| `end` | data/hora | ISO 8601 |

---

## Tratamento de erros

Os erros de negócio são tratados de forma centralizada pelo `GlobalExceptionHandler`, que traduz as exceções da aplicação em respostas HTTP consistentes:

| Exceção | Situação típica | Status |
|---------|-----------------|:------:|
| `BadRequestException` | Requisição inválida / regra de negócio violada | 400 |
| `UnauthorizedException` | Falha de autenticação | 401 |
| `ForbiddenException` | Usuário autenticado sem permissão sobre o recurso | 403 |
| `ResourceNotFoundException` | Recurso inexistente | 404 |

Erros de validação de DTO (Bean Validation) também retornam **400**, com os detalhes dos campos inválidos.
