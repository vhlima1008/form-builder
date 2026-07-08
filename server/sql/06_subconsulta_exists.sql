-- =====================================================================
-- Script 6: Subconsulta com EXISTS
--
-- Regra de negócio: listar os usuários que possuem pelo menos um
-- formulário publicado.
-- =====================================================================
USE forms_api;

SELECT
    u.id,
    u.name,
    u.email
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM forms f
    WHERE f.owner_id = u.id
      AND f.published = TRUE
);
