import { useState } from "react"

import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import {
  FormPeriodSearchForm,
  type PeriodSearchValue,
} from "@/components/reports/FormPeriodSearchForm"
import { reportService } from "@/services/report-service"
import type { Form } from "@/types/form"
import type { QuestionWithoutAnswer } from "@/types/report"

export function QuestionsWithoutAnswersReport({ forms }: { forms: Form[] }) {
  const [questions, setQuestions] = useState<QuestionWithoutAnswer[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function handleSearch({ formId, start, end }: PeriodSearchValue) {
    setIsSearching(true)
    setError(null)
    try {
      setQuestions(
        await reportService.getQuestionsWithoutAnswers(formId, start, end)
      )
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Subconsulta com <code>NOT IN</code>: perguntas do formulário que
        ainda não receberam nenhuma resposta dentro do período informado.
      </p>
      <FormPeriodSearchForm
        forms={forms}
        onSearch={handleSearch}
        isSearching={isSearching}
      />
      {isSearching ? <LoadingState label="Verificando perguntas sem respostas…" /> : null}
      {error ? <ErrorState error={error} /> : null}
      {!isSearching && !error && questions !== null ? (
        questions.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Todas as perguntas desse formulário já receberam alguma resposta
            no período.
          </p>
        ) : (
          <ul className="grid gap-2 rounded-xl border bg-background p-4 shadow-sm">
            {questions.map((question) => (
              <li
                key={question.questionId}
                className="rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                {question.questionTitle}
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  )
}
