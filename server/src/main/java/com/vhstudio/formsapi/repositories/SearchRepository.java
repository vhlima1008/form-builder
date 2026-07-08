package com.vhstudio.formsapi.repositories;

import com.vhstudio.formsapi.utils.dtos.FormQuestionCountDTO;
import com.vhstudio.formsapi.utils.dtos.FormResponseCountDTO;
import com.vhstudio.formsapi.utils.dtos.FormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.OwnerFormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.QuestionWithoutAnswerDTO;
import com.vhstudio.formsapi.utils.dtos.UserSearchResultDTO;
import com.vhstudio.formsapi.utils.enums.ResponseStatus;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SearchRepository {
    private final JdbcTemplate jdbcTemplate;

    public SearchRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<FormResponseDTO> listForms(UUID ownerId, String title, Boolean published) {
        String sql = """
            SELECT
                BIN_TO_UUID(f.id) AS id,
                f.title,
                f.description,
                f.published,
                f.public_slug,
                f.created_at,
                f.updated_at
            FROM forms f
            WHERE f.owner_id = UUID_TO_BIN(?)
              AND LOWER(f.title) LIKE LOWER(CONCAT('%', ?, '%'))
              AND (? IS NULL OR f.published = ?)
            ORDER BY f.updated_at DESC
            """;
        return jdbcTemplate.query(
            sql,
            this::mapFormResponse,
            ownerId.toString(),
            title == null ? "" : title,
            published,
            published
        );
    }

    public List<FormResponseCountDTO> countFinishedResponsesByForm(UUID ownerId) {
        String sql = """
            SELECT
                BIN_TO_UUID(f.id) AS form_id,
                f.title AS form_title,
                COUNT(fr.id) AS total_responses
            FROM forms f
            INNER JOIN form_responses fr ON fr.form_id = f.id
            WHERE f.owner_id = UUID_TO_BIN(?)
              AND f.published = TRUE
              AND fr.status = 'FINISHED'
            GROUP BY f.id, f.title
            HAVING COUNT(fr.id) >= 1
            ORDER BY total_responses DESC, f.title ASC
            """;
        return jdbcTemplate.query(sql, this::mapFormResponseCount, ownerId.toString());
    }

    public List<OwnerFormResponseDTO> findResponsesInPeriod(
        UUID ownerId,
        UUID formId,
        LocalDateTime start,
        LocalDateTime end
    ) {
        String sql = """
            SELECT
                BIN_TO_UUID(fr.id) AS id,
                BIN_TO_UUID(fr.form_id) AS form_id,
                fr.respondent_name,
                fr.respondent_email,
                fr.status,
                fr.created_at,
                fr.started_at,
                fr.finished_at
            FROM form_responses fr
            INNER JOIN forms f ON f.id = fr.form_id
            WHERE f.owner_id = UUID_TO_BIN(?)
              AND f.id = UUID_TO_BIN(?)
              AND fr.created_at BETWEEN ? AND ?
            ORDER BY fr.created_at ASC
            """;
        return jdbcTemplate.query(
            sql,
            this::mapOwnerFormResponse,
            ownerId.toString(),
            formId.toString(),
            Timestamp.valueOf(start),
            Timestamp.valueOf(end)
        );
    }

    public List<QuestionWithoutAnswerDTO> findQuestionsWithoutAnswersInPeriod(
        UUID ownerId,
        UUID formId,
        LocalDateTime start,
        LocalDateTime end
    ) {
        String sql = """
            SELECT
                BIN_TO_UUID(q.id) AS question_id,
                q.title AS question_title
            FROM questions q
            INNER JOIN sections s ON s.id = q.section_id
            INNER JOIN forms f ON f.id = s.form_id
            WHERE f.owner_id = UUID_TO_BIN(?)
              AND f.id = UUID_TO_BIN(?)
              AND q.id NOT IN (
                  SELECT qa.question_id
                  FROM question_answers qa
                  INNER JOIN form_responses fr ON fr.id = qa.form_response_id
                  WHERE fr.form_id = f.id
                    AND qa.created_at BETWEEN ? AND ?
              )
            ORDER BY s.position ASC, q.position ASC
            """;
        return jdbcTemplate.query(
            sql,
            this::mapQuestionWithoutAnswer,
            ownerId.toString(),
            formId.toString(),
            Timestamp.valueOf(start),
            Timestamp.valueOf(end)
        );
    }

    public List<FormQuestionCountDTO> findPublishedFormsMoreCompleteThanDrafts(UUID ownerId) {
        String sql = """
            SELECT
                BIN_TO_UUID(f.id) AS form_id,
                f.title AS form_title,
                COUNT(q.id) AS total_questions
            FROM forms f
            LEFT JOIN sections s ON s.form_id = f.id
            LEFT JOIN questions q ON q.section_id = s.id
            WHERE f.owner_id = UUID_TO_BIN(?)
              AND f.published = TRUE
            GROUP BY f.id, f.title
            HAVING COUNT(q.id) > ALL (
                SELECT COUNT(q2.id)
                FROM forms f2
                LEFT JOIN sections s2 ON s2.form_id = f2.id
                LEFT JOIN questions q2 ON q2.section_id = s2.id
                WHERE f2.owner_id = UUID_TO_BIN(?)
                  AND f2.published = FALSE
                GROUP BY f2.id
            )
            ORDER BY total_questions DESC, f.title ASC
            """;
        return jdbcTemplate.query(sql, this::mapFormQuestionCount, ownerId.toString(), ownerId.toString());
    }

    public List<UserSearchResultDTO> findUsersWithPublishedForms(UUID ownerId) {
        String sql = """
            SELECT
                BIN_TO_UUID(u.id) AS user_id,
                u.name,
                u.email
            FROM users u
            WHERE u.id = UUID_TO_BIN(?)
              AND EXISTS (
                  SELECT 1
                  FROM forms f
                  WHERE f.owner_id = u.id
                    AND f.published = TRUE
              )
            ORDER BY u.name ASC
            """;
        return jdbcTemplate.query(sql, this::mapUserSearchResult, ownerId.toString());
    }

    private FormResponseDTO mapFormResponse(ResultSet rs, int rowNum) throws SQLException {
        return new FormResponseDTO(
            UUID.fromString(rs.getString("id")),
            rs.getString("title"),
            rs.getString("description"),
            rs.getBoolean("published"),
            rs.getString("public_slug"),
            toLocalDateTime(rs, "created_at"),
            toLocalDateTime(rs, "updated_at")
        );
    }

    private FormResponseCountDTO mapFormResponseCount(ResultSet rs, int rowNum) throws SQLException {
        return new FormResponseCountDTO(
            UUID.fromString(rs.getString("form_id")),
            rs.getString("form_title"),
            rs.getLong("total_responses")
        );
    }

    private OwnerFormResponseDTO mapOwnerFormResponse(ResultSet rs, int rowNum) throws SQLException {
        return new OwnerFormResponseDTO(
            UUID.fromString(rs.getString("id")),
            UUID.fromString(rs.getString("form_id")),
            rs.getString("respondent_name"),
            rs.getString("respondent_email"),
            ResponseStatus.valueOf(rs.getString("status")),
            toLocalDateTime(rs, "created_at"),
            toLocalDateTime(rs, "started_at"),
            toLocalDateTime(rs, "finished_at"),
            List.of()
        );
    }

    private QuestionWithoutAnswerDTO mapQuestionWithoutAnswer(ResultSet rs, int rowNum) throws SQLException {
        return new QuestionWithoutAnswerDTO(
            UUID.fromString(rs.getString("question_id")),
            rs.getString("question_title")
        );
    }

    private FormQuestionCountDTO mapFormQuestionCount(ResultSet rs, int rowNum) throws SQLException {
        return new FormQuestionCountDTO(
            UUID.fromString(rs.getString("form_id")),
            rs.getString("form_title"),
            rs.getLong("total_questions")
        );
    }

    private UserSearchResultDTO mapUserSearchResult(ResultSet rs, int rowNum) throws SQLException {
        return new UserSearchResultDTO(
            UUID.fromString(rs.getString("user_id")),
            rs.getString("name"),
            rs.getString("email")
        );
    }

    private LocalDateTime toLocalDateTime(ResultSet rs, String column) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(column);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
