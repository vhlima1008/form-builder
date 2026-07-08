import { CheckCircle2, Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/common/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import {
  PublicQuestionField,
  type PublicAnswerValue,
} from "@/components/forms/PublicQuestionField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePublicForm } from "@/hooks/usePublicForm"
import { getApiErrorMessage } from "@/lib/api"
import { sortByPosition } from "@/lib/format"
import { publicFormService } from "@/services/public-form-service"
import type { SubmitQuestionAnswerRequest } from "@/types/public-form"

type PublicResponseSession = {
  responseId: string
  accessToken: string
}

export function PublicFormPage() {
  const { publicSlug } = useParams()
  const navigate = useNavigate()
  const { form, isLoading, error } = usePublicForm(publicSlug)
  const [answers, setAnswers] = useState<Record<string, PublicAnswerValue>>({})
  const [responseSession, setResponseSession] =
    useState<PublicResponseSession | null>(null)
  const [isCreatingResponse, setIsCreatingResponse] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [missingQuestionId, setMissingQuestionId] = useState<string | null>(
    null
  )
  const hasStartedResponse = useRef(false)

  const questions = useMemo(
    () =>
      form
        ? sortByPosition(form.sections).flatMap((section) =>
            sortByPosition(section.questions)
          )
        : [],
    [form]
  )

  const startFormResponse = useCallback(async () => {
    if (!publicSlug || hasStartedResponse.current) return null

    hasStartedResponse.current = true
    setIsCreatingResponse(true)
    try {
      const response = await publicFormService.createFormResponse(publicSlug)

      if (!response.responseId || !response.accessToken) {
        throw new Error(
          "Missing responseId or accessToken from create response."
        )
      }

      const nextSession = {
        responseId: response.responseId,
        accessToken: response.accessToken,
      }

      setResponseSession(nextSession)
      return nextSession
    } catch (requestError) {
      hasStartedResponse.current = false
      toast.error(getApiErrorMessage(requestError))
      return null
    } finally {
      setIsCreatingResponse(false)
    }
  }, [publicSlug])

  useEffect(() => {
    if (!form) return
    void startFormResponse()
  }, [form, startFormResponse])

  function buildSubmitAnswers(): SubmitQuestionAnswerRequest[] {
    return questions
      .filter((question) => answers[question.id] !== undefined)
      .map((question) => {
        const value = answers[question.id]
        return {
          questionId: question.id,
          value: Array.isArray(value) ? JSON.stringify(value) : value || "",
        }
      })
  }

  async function submitForm() {
    if (!form || !publicSlug) return

    const missingRequiredQuestion = questions.find((question) => {
      if (!question.required) return false
      const value = answers[question.id]
      if (Array.isArray(value)) return value.length === 0
      return !value || value.trim().length === 0
    })

    if (missingRequiredQuestion) {
      setMissingQuestionId(missingRequiredQuestion.id)
      toast.error(`Responda: ${missingRequiredQuestion.title}`)
      return
    }

    setMissingQuestionId(null)
    setIsSubmitting(true)
    try {
      const session = responseSession || (await startFormResponse())
      if (!session?.responseId || !session.accessToken) {
        toast.error("Não foi possível iniciar a resposta do formulário.")
        return
      }

      const payload = {
        accessToken: session.accessToken,
        answers: buildSubmitAnswers(),
      }

      await publicFormService.submitFormResponse(session.responseId, payload)
      navigate(`/forms/public/${publicSlug}/submitted`)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <LoadingState label="Carregando formulário…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState error={error} />
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="mx-auto grid max-w-3xl gap-5 pb-8">
      <Card className="overflow-hidden border-t-4 border-t-primary bg-card shadow-xs">
        <CardHeader className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Formulário público
          </p>
          <CardTitle className="text-3xl tracking-tight text-balance">
            {form.title}
          </CardTitle>
          {form.description ? (
            <p className="text-sm text-pretty text-muted-foreground">
              {form.description}
            </p>
          ) : null}
        </CardHeader>
      </Card>

      {sortByPosition(form.sections).map((section, sectionIndex) => (
        <Card key={section.id} className="bg-card shadow-xs">
          <CardHeader>
            <p className="text-xs font-medium text-muted-foreground">
              Seção {sectionIndex + 1}
            </p>
            <CardTitle className="text-xl">{section.title}</CardTitle>
            {section.description ? (
              <p className="text-sm text-pretty text-muted-foreground">
                {section.description}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-6">
            {sortByPosition(section.questions).map((question) => (
              <div
                key={question.id}
                className="grid gap-3 rounded-2xl border bg-background p-4"
              >
                <div>
                  <h2 className="font-medium break-words">
                    {question.title}
                    {question.required ? (
                      <span
                        className="ml-1 text-destructive"
                        aria-label="obrigatória"
                      >
                        *
                      </span>
                    ) : null}
                  </h2>
                  {question.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {question.description}
                    </p>
                  ) : null}
                </div>
                <PublicQuestionField
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => {
                    setMissingQuestionId((currentMissingQuestionId) =>
                      currentMissingQuestionId === question.id
                        ? null
                        : currentMissingQuestionId
                    )
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: value,
                    }))
                  }}
                />
                {missingQuestionId === question.id ? (
                  <p className="text-sm text-destructive">
                    Esta pergunta é obrigatória.
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          disabled={isCreatingResponse || isSubmitting}
          type="button"
          onClick={submitForm}
        >
          {isCreatingResponse || isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          )}
          {isCreatingResponse
            ? "Preparando…"
            : isSubmitting
              ? "Enviando…"
              : "Enviar resposta"}
        </Button>
      </div>
    </div>
  )
}
