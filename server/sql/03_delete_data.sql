-- =====================================================================
-- Script 3: Apagar os dados de todas as tabelas
-- (ordem inversa às dependências de chave estrangeira)
-- =====================================================================
USE forms_api;

DELETE FROM question_answers;
DELETE FROM form_responses;
DELETE FROM question_options;
DELETE FROM questions;
DELETE FROM sections;
DELETE FROM forms;
DELETE FROM users;

-- Alternativa (mais rápida, reinicia auto-incremento se houvesse):
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE question_answers;
-- TRUNCATE TABLE form_responses;
-- TRUNCATE TABLE question_options;
-- TRUNCATE TABLE questions;
-- TRUNCATE TABLE sections;
-- TRUNCATE TABLE forms;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;
