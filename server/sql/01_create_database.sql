-- =====================================================================
-- Trabalho Prático de Banco de Dados I
-- Script 1: Criação da base de dados e das tabelas (com PK, FK e regras
--           de atualização/exclusão)
-- SGBD alvo: MySQL 8+
-- =====================================================================

DROP DATABASE IF EXISTS forms_api;
CREATE DATABASE forms_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE forms_api;

-- ---------------------------------------------------------------------
-- Tabela: users
-- Usuários donos dos formulários.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            CHAR(36)     NOT NULL,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(180) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ---------------------------------------------------------------------
-- Tabela: forms
-- Formulários criados por um usuário.
-- ---------------------------------------------------------------------
CREATE TABLE forms (
    id          CHAR(36)     NOT NULL,
    owner_id    CHAR(36)     NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT NULL,
    published   BOOLEAN      NOT NULL DEFAULT FALSE,
    public_slug VARCHAR(100) NULL,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,
    CONSTRAINT pk_forms PRIMARY KEY (id),
    CONSTRAINT uq_forms_public_slug UNIQUE (public_slug),
    CONSTRAINT fk_forms_owner FOREIGN KEY (owner_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        -- Se um usuário for excluído, todos os formulários que ele criou
        -- deixam de fazer sentido isolados, logo são excluídos em cascata.
);

-- ---------------------------------------------------------------------
-- Tabela: sections
-- Seções de um formulário (agrupam perguntas).
-- ---------------------------------------------------------------------
CREATE TABLE sections (
    id          CHAR(36)     NOT NULL,
    form_id     CHAR(36)     NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT NULL,
    position    INT          NOT NULL,
    CONSTRAINT pk_sections PRIMARY KEY (id),
    CONSTRAINT fk_sections_form FOREIGN KEY (form_id) REFERENCES forms (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        -- Uma seção só existe dentro de um formulário; excluído o
        -- formulário, suas seções não têm mais razão de existir.
);

-- ---------------------------------------------------------------------
-- Tabela: questions
-- Perguntas de uma seção.
-- ---------------------------------------------------------------------
CREATE TABLE questions (
    id          CHAR(36)     NOT NULL,
    section_id  CHAR(36)     NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT NULL,
    type        VARCHAR(20)  NOT NULL,      -- TEXTAREA | CHECKBOX | SELECTION
    required    BOOLEAN      NOT NULL DEFAULT FALSE,
    position    INT          NOT NULL,
    CONSTRAINT pk_questions PRIMARY KEY (id),
    CONSTRAINT fk_questions_section FOREIGN KEY (section_id) REFERENCES sections (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        -- Idem: pergunta não sobrevive sem a seção que a contém.
);

-- ---------------------------------------------------------------------
-- Tabela: question_options
-- Opções de resposta para perguntas de múltipla escolha/checkbox.
-- ---------------------------------------------------------------------
CREATE TABLE question_options (
    id           CHAR(36)     NOT NULL,
    question_id  CHAR(36)     NOT NULL,
    label        VARCHAR(255) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    position     INT          NOT NULL,
    CONSTRAINT pk_question_options PRIMARY KEY (id),
    CONSTRAINT fk_question_options_question FOREIGN KEY (question_id) REFERENCES questions (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        -- Opção só existe se a pergunta existir.
);

-- ---------------------------------------------------------------------
-- Tabela: form_responses
-- Uma tentativa/submissão de resposta a um formulário.
-- ---------------------------------------------------------------------
CREATE TABLE form_responses (
    id               CHAR(36)     NOT NULL,
    form_id          CHAR(36)     NOT NULL,
    respondent_name  VARCHAR(150) NULL,
    respondent_email VARCHAR(180) NULL,
    status           VARCHAR(20)  NOT NULL,  -- WAITING | ONGOING | FINISHED
    access_token     VARCHAR(100) NOT NULL,
    created_at       DATETIME     NOT NULL,
    started_at       DATETIME NULL,
    finished_at      DATETIME NULL,
    CONSTRAINT pk_form_responses PRIMARY KEY (id),
    CONSTRAINT uq_form_responses_access_token UNIQUE (access_token),
    CONSTRAINT fk_form_responses_form FOREIGN KEY (form_id) REFERENCES forms (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        -- Se o formulário for excluído, as respostas a ele também perdem o sentido.
);

-- ---------------------------------------------------------------------
-- Tabela: question_answers
-- Resposta individual (de uma submissão) para uma pergunta específica.
-- ---------------------------------------------------------------------
CREATE TABLE question_answers (
    id               CHAR(36) NOT NULL,
    form_response_id CHAR(36) NOT NULL,
    question_id      CHAR(36) NOT NULL,
    answer_value     TEXT NULL,
    created_at       DATETIME NOT NULL,
    CONSTRAINT pk_question_answers PRIMARY KEY (id),
    CONSTRAINT fk_question_answers_response FOREIGN KEY (form_response_id) REFERENCES form_responses (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        -- A resposta individual não existe sem a submissão (form_response) que a contém.
    ,
    CONSTRAINT fk_question_answers_question FOREIGN KEY (question_id) REFERENCES questions (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
        -- Não deixamos excluir uma pergunta que já tenha respostas registradas,
        -- para preservar o histórico de respostas já coletadas.
);
