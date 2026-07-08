-- =====================================================================
-- Script 4: Consulta envolvendo mais de uma tabela, com dados agregados
--           e filtros (INNER JOIN + GROUP BY + WHERE/HAVING)
--
-- Regra de negócio: para cada formulário PUBLICADO, quantas respostas
-- FINALIZADAS (FINISHED) ele já recebeu? Mostrar apenas formulários com
-- pelo menos uma resposta finalizada, do dono mais "engajado" primeiro.
-- =====================================================================
USE forms_api;

SELECT
    u.name                    AS owner_name,
    f.title                   AS form_title,
    COUNT(fr.id)              AS total_finished_responses
FROM forms f
INNER JOIN users u          ON u.id = f.owner_id
INNER JOIN form_responses fr ON fr.form_id = f.id
WHERE f.published = TRUE
  AND fr.status = 'FINISHED'
GROUP BY f.id, u.name, f.title
HAVING COUNT(fr.id) >= 1
ORDER BY total_finished_responses DESC;
