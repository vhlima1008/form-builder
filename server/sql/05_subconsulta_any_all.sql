-- =====================================================================
-- Script 5: Subconsulta com operador de comparação ALL (ou ANY)
--
-- Regra de negócio: listar os formulários PUBLICADOS que têm MAIS
-- perguntas do que TODOS (ALL) os formulários que ainda NÃO foram
-- publicados. Ou seja, formulários publicados mais completos que
-- qualquer rascunho existente.
-- =====================================================================
USE forms_api;

SELECT
    f.title AS form_title,
    (
        SELECT COUNT(*)
        FROM questions q
        INNER JOIN sections s ON s.id = q.section_id
        WHERE s.form_id = f.id
    ) AS total_questions
FROM forms f
WHERE f.published = TRUE
  AND (
        SELECT COUNT(*)
        FROM questions q
        INNER JOIN sections s ON s.id = q.section_id
        WHERE s.form_id = f.id
      ) > ALL (
        SELECT COUNT(*)
        FROM questions q2
        INNER JOIN sections s2 ON s2.id = q2.section_id
        INNER JOIN forms f2   ON f2.id = s2.form_id
        WHERE f2.published = FALSE
        GROUP BY f2.id
      );

-- Variante com ANY: formulários publicados com mais perguntas do que
-- PELO MENOS UM (ANY) formulário não publicado.
-- ...> ANY ( ... mesma subconsulta acima ... );
