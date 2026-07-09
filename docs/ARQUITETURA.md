# Arquitetura — Form Builder

## Visão geral

O Form Builder é uma aplicação full-stack dividida em três serviços independentes, orquestrados por Docker Compose:

```
┌──────────────┐      HTTP/JSON      ┌──────────────┐      JDBC       ┌──────────────┐
│   web        │ ───────────────────►│   server     │ ───────────────►│   mysql      │
│ React + Vite │  (Nginx faz proxy   │ Spring Boot  │  (Hibernate /   │  MySQL 8.4   │
│  + Nginx     │   /api → :8080)     │  Java 21     │   JdbcTemplate) │  (InnoDB)    │
└──────────────┘                     └──────────────┘                 └──────────────┘
     :5173                                :8080                            :3306
```

O frontend nunca fala diretamente com o banco. Toda comunicação passa pela API REST do backend, que é a única camada com acesso ao MySQL.

## Backend (`server/`)

- **Framework:** Spring Boot 4.1.0
- **Linguagem:** Java 21
- **Build:** Maven (wrapper `mvnw` incluído)
- **Persistência:** Spring Data JPA / Hibernate + `JdbcTemplate` (para as consultas SQL nativas)
- **Segurança:** Spring Security com autenticação JWT stateless
- **Validação:** Jakarta Bean Validation (`spring-boot-starter-validation`)

### Organização em camadas

O código segue uma separação clássica em camadas, dentro do pacote `com.vhstudio.formsapi`:

| Pacote | Responsabilidade |
|--------|------------------|
| `controllers/` | Camada de entrada HTTP. Recebe requisições, valida os DTOs e delega para os serviços. |
| `services/` | Regras de negócio. Orquestra repositórios, aplica validações de domínio e regras de autorização. |
| `repositories/` | Acesso a dados. Interfaces Spring Data JPA + a classe `SearchRepository` com SQL nativo via `JdbcTemplate`. |
| `models/` | Entidades JPA mapeadas para as tabelas do banco. |
| `security/` | Configuração do Spring Security, filtro JWT, serviço de emissão/validação de token e `UserDetailsService`. |
| `utils/dtos/` | Objetos de transferência de dados (records) para request e response. |
| `utils/enums/` | Enumerações de domínio (`QuestionType`, `ResponseStatus`). |
| `utils/exceptions/` | Exceções de negócio e o `GlobalExceptionHandler` centralizado. |

### Fluxo de uma requisição

```
Requisição HTTP
      │
      ▼
JwtAuthenticationFilter  ── valida o token e popula o SecurityContext
      │
      ▼
Controller  ── valida o DTO (@Valid) e extrai o usuário autenticado
      │
      ▼
Service  ── aplica regras de negócio e autorização (ownership)
      │
      ▼
Repository  ── JPA (CRUD) ou JdbcTemplate (consultas nativas)
      │
      ▼
MySQL
```

### Segurança e autenticação

- Autenticação **stateless** baseada em **JWT** (sem sessão de servidor).
- Senhas armazenadas como *hash* (campo `password_hash`), nunca em texto puro.
- Rotas públicas (não exigem token): `/health`, `/auth/register`, `/auth/login` e todo o prefixo `/public/**`.
- Todas as demais rotas exigem token válido (`.anyRequest().authenticated()`).
- CSRF desabilitado (padrão para APIs stateless consumidas por SPA).
- CORS configurável via variável `CORS_ALLOWED_ORIGINS` (padrão `http://localhost:5173`).

A separação entre rotas privadas (do dono do formulário) e rotas públicas (do respondente) é uma decisão central de arquitetura, inspirada no funcionamento de *slugs* públicos do Google Forms: o criador gerencia o formulário autenticado, enquanto o respondente acessa por um `public_slug` sem precisar de conta.

## Frontend (`web/`)

- **Framework:** React 19
- **Build/dev server:** Vite
- **Linguagem:** TypeScript
- **Roteamento:** React Router (`react-router-dom`)
- **Formulários:** React Hook Form + `@hookform/resolvers`
- **HTTP:** Axios
- **UI:** TailwindCSS + shadcn/ui (Radix UI), ícones `lucide-react`, tema com `next-themes`, notificações com `sonner`

### Organização

| Pasta | Responsabilidade |
|-------|------------------|
| `pages/` | Páginas roteáveis (auth, dashboard, formulários públicos). |
| `components/` | Componentes reutilizáveis (editor de formulário, campos, busca, layout, UI base). |
| `services/` | Clientes HTTP que consomem a API por domínio (auth, form, section, question, response, search). |
| `hooks/` | Hooks de estado e lógica (`useAuth`, `useForms`, `useFormBuilder`, `usePublicForm`). |
| `types/` | Tipagens TypeScript espelhando os contratos da API. |
| `schemas/` | Schemas de validação de formulários. |
| `lib/` | Utilitários (cliente Axios, armazenamento de token, formatação). |

Em produção, o frontend é servido por **Nginx**, que também faz *proxy* das chamadas `/api` para o container do backend (ver `web/nginx.conf`).

## Execução via Docker

O arquivo `compose.yaml` na raiz define os três serviços:

1. **mysql** — MySQL 8.4 com *healthcheck*; o backend só sobe depois que o banco está saudável.
2. **server** — imagem construída a partir de `server/Dockerfile`; depende do MySQL estar `service_healthy`.
3. **web** — imagem construída a partir de `web/Dockerfile`; depende do server.

### Passo a passo

```bash
# 1. Copie o arquivo de exemplo e ajuste os valores sensíveis
cp .env.example .env

# 2. Suba tudo (build + start)
docker compose up --build

# 3. Para derrubar os serviços
docker compose down

# 3b. Para derrubar apagando também os dados do banco
docker compose down -v
```

### Variáveis de ambiente

Definidas em `.env` (ver `.env.example`):

| Variável | Descrição | Obrigatória |
|----------|-----------|:-----------:|
| `MYSQL_ROOT_PASSWORD` | Senha do root do MySQL. | Sim |
| `MYSQL_DATABASE` | Nome do banco (padrão `forms_api`). | Não |
| `MYSQL_USER` | Usuário da aplicação (padrão `forms_user`). | Não |
| `MYSQL_PASSWORD` | Senha do usuário da aplicação. | Sim |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT. | Sim |
| `JWT_EXPIRATION_MS` | Validade do token em ms (padrão `86400000` = 24h). | Não |
| `SERVER_PORT` | Porta exposta do backend (padrão `8080`). | Não |
| `WEB_PORT` | Porta exposta do frontend (padrão `5173`). | Não |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas para CORS. | Não |

> **Nota de segurança:** as variáveis `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` e `JWT_SECRET` não têm valor padrão seguro e devem ser trocadas antes de qualquer uso real. No `compose.yaml`, o Docker aborta a subida se elas não estiverem definidas.
