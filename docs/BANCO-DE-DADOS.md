# Banco de Dados — Form Builder

- **SGBD:** MySQL 8.4
- **Engine:** InnoDB (padrão do MySQL 8, com suporte a transações e chaves estrangeiras)
- **Entidades:** 7
- **Chaves primárias:** UUID
- **Geração do schema:** Hibernate (`spring.jpa.hibernate.ddl-auto=update`)

O diagrama entidade-relacionamento completo (notação pé-de-galinha / *crow's foot*) está em [`MER-Form-Builder.svg`](./MER-Form-Builder.svg).

## Modelo lógico

```
users ──1:N──► forms ──1:N──► sections ──1:N──► questions ──1:N──► question_options
                 │                                   │
                 │ 1:N                               │ 1:N
                 ▼                                    ▼
          form_responses ──1:N──► question_answers ◄──┘
                                (entidade associativa)
```

A entidade `question_answers` é **associativa**: ela resolve o relacionamento N:N entre *respostas de formulário* e *perguntas* — uma resposta cobre várias perguntas, e uma pergunta aparece em várias respostas.

## Entidades

### `users`

Usuário criador de formulários.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | UUID | **PK** |
| `name` | VARCHAR | NOT NULL |
| `email` | VARCHAR | NOT NULL, **UNIQUE** |
| `password_hash` | VARCHAR | NOT NULL |
| `created_at` | DATETIME | NOT NULL, imutável |

### `forms`

Formulário criado por um usuário.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | UUID | **PK** |
| `owner_id` | UUID | **FK** → `users.id`, NOT NULL |
| `title` | VARCHAR | NOT NULL |
| `description` | TEXT | — |
| `published` | BOOLEAN | NOT NULL, default `false` |
| `public_slug` | VARCHAR | **UNIQUE** |
| `created_at` | DATETIME | NOT NULL, imutável |
| `updated_at` | DATETIME | NOT NULL |

O `public_slug` é o identificador público usado pelos respondentes; só passa a valer quando o formulário é publicado.

### `sections`

Seção de um formulário (agrupa perguntas e define ordem).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | UUID | **PK** |
| `form_id` | UUID | **FK** → `forms.id`, NOT NULL |
| `title` | VARCHAR | NOT NULL |
| `description` | TEXT | — |
| `position` | INT | NOT NULL (ordenação) |

### `questions`

Pergunta pertencente a uma seção.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | UUID | **PK** |
| `section_id` | UUID | **FK** → `sections.id`, NOT NULL |
| `title` | VARCHAR | NOT NULL |
| `description` | TEXT | — |
| `type` | ENUM | NOT NULL — ver [Enums](#enumerações) |
| `required` | BOOLEAN | NOT NULL |
| `position` | INT | NOT NULL (ordenação) |

### `question_options`

Opção de resposta para perguntas de múltipla escolha (`CHECKBOX`, `SELECTION`).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | UUID | **PK** |
| `question_id` | UUID | **FK** → `questions.id`, NOT NULL |
| `label` | VARCHAR | NOT NULL (texto exibido) |
| `option_value` | VARCHAR | NOT NULL (valor armazenado) |
| `position` | INT | NOT NULL (ordenação) |

### `form_responses`

Uma resposta (preenchimento) de um formulário por um respondente.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | UUID | **PK** |
| `form_id` | UUID | **FK** → `forms.id`, NOT NULL |
| `respondent_name` | VARCHAR | — |
| `respondent_email` | VARCHAR | — |
| `status` | ENUM | NOT NULL — ver [Enums](#enumerações) |
| `access_token` | VARCHAR | NOT NULL, **UNIQUE** |
| `created_at` | DATETIME | NOT NULL, imutável |
| `started_at` | DATETIME | — |
| `finished_at` | DATETIME | — |

O `access_token` é único por resposta e serve para o respondente retomar/enviar o preenchimento sem autenticação de conta.

### `question_answers` (associativa)

Resposta individual a uma pergunta, dentro de um preenchimento.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | UUID | **PK** |
| `form_response_id` | UUID | **FK** → `form_responses.id`, NOT NULL |
| `question_id` | UUID | **FK** → `questions.id`, NOT NULL |
| `answer_value` | TEXT | — |
| `created_at` | DATETIME | NOT NULL, imutável |

## Enumerações

Ambos os enums são persistidos como **STRING** (`@Enumerated(EnumType.STRING)`), ou seja, o valor textual é gravado na coluna — mais legível e resistente a reordenação do que o ordinal numérico.

**`QuestionType`** (coluna `questions.type`):

| Valor | Significado |
|-------|-------------|
| `TEXTAREA` | Resposta em texto livre. |
| `CHECKBOX` | Múltipla escolha (várias opções selecionáveis). |
| `SELECTION` | Seleção única entre opções. |

**`ResponseStatus`** (coluna `form_responses.status`):

| Valor | Significado |
|-------|-------------|
| `WAITING` | Resposta criada, ainda não iniciada. |
| `ONGOING` | Preenchimento em andamento. |
| `FINISHED` | Preenchimento concluído/enviado. |

## Decisões de projeto

### Armazenamento de UUID como chave primária

Todas as PKs são UUID, gerados pela aplicação via JPA (`@GeneratedValue(strategy = GenerationType.UUID)`).

No MySQL, o Hibernate mapeia o UUID para um tipo binário compacto (`BINARY(16)`) em vez de armazenar os 36 caracteres da representação textual. Isso reduz o espaço ocupado e o tamanho dos índices, além de melhorar a performance de comparação de chaves.

Nas consultas SQL nativas (classe `SearchRepository`), essa escolha aparece explicitamente com as funções nativas do MySQL:

- **`UUID_TO_BIN(?)`** — converte o UUID textual recebido da aplicação para o binário armazenado, usado nos filtros (`WHERE f.owner_id = UUID_TO_BIN(?)`).
- **`BIN_TO_UUID(coluna)`** — converte o binário de volta para texto ao projetar o resultado (`SELECT BIN_TO_UUID(f.id) AS id`).

Assim, o valor trafega como texto na borda da aplicação, mas é comparado e indexado como binário dentro do banco.

### Engine InnoDB

O InnoDB (padrão no MySQL 8) é o que viabiliza este modelo:

- **Integridade referencial:** todas as FKs entre as 7 tabelas são efetivamente respeitadas.
- **Transações ACID:** o preenchimento de um formulário (criar `form_response` + várias `question_answers`) pode ser tratado de forma consistente.
- **Bloqueio em nível de linha:** múltiplos respondentes podem enviar respostas concorrentemente sem travar a tabela inteira.

### Relacionamentos no JPA

No código Java, os relacionamentos são modelados de forma **unidirecional a partir do lado "muitos"** (a entidade filha), usando `@ManyToOne(fetch = FetchType.LAZY, optional = false)` com `@JoinColumn(... nullable = false)`. Exemplos:

- `Form` referencia seu `User` dono (`owner_id`).
- `Section` referencia seu `Form` (`form_id`).
- `Question` referencia sua `Section` (`section_id`).
- `QuestionOption` referencia sua `Question` (`question_id`).
- `FormResponse` referencia seu `Form` (`form_id`).
- `QuestionAnswer` referencia tanto `FormResponse` (`form_response_id`) quanto `Question` (`question_id`).

O uso de `FetchType.LAZY` evita carregar as entidades pai desnecessariamente; a serialização de cada resposta é controlada pelos DTOs, e não pela entidade diretamente (`spring.jpa.open-in-view=false`).

### Consultas avançadas (SQL nativo)

Além do CRUD gerado pelo Spring Data JPA, a classe `SearchRepository` implementa consultas analíticas em **SQL nativo** via `JdbcTemplate`, exercitando recursos mais avançados de SQL:

| Consulta | Recursos de SQL exercitados |
|----------|-----------------------------|
| Listagem de formulários com filtro por título e status | `LIKE` com `LOWER(...)`, filtro condicional `(? IS NULL OR ...)`, `ORDER BY` |
| Contagem de respostas finalizadas por formulário | `INNER JOIN`, `COUNT(...)`, `GROUP BY`, `HAVING`, filtro por enum |
| Respostas em um período | `INNER JOIN`, `BETWEEN`, filtro por dono |
| Perguntas sem resposta em um período | `NOT IN` com subconsulta correlacionada, múltiplos `INNER JOIN` |
| Formulários publicados "mais completos" que qualquer rascunho | `LEFT JOIN`, `GROUP BY`, `HAVING ... > ALL (subconsulta)` |
| Usuários com formulários publicados | `EXISTS` com subconsulta correlacionada |

Essas consultas demonstram, na prática, `JOIN`s, subconsultas (correlacionadas e não correlacionadas), agregações com `GROUP BY`/`HAVING`, e operadores de quantificação (`> ALL`, `NOT IN`, `EXISTS`) — todos aplicados sobre o modelo relacional descrito acima.

> Os endpoints que expõem essas consultas estão documentados em [API.md](./API.md#consultas).
