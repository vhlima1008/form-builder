import type { FormResponseStatus } from "@/types/response"

export type FormResponseCount = {
  formId: string
  formTitle: string
  totalResponses: number
}

export type QuestionWithoutAnswer = {
  questionId: string
  questionTitle: string
}

export type FormQuestionCount = {
  formId: string
  formTitle: string
  totalQuestions: number
}

export type UserSearchResult = {
  userId: string
  name: string
  email: string
}

export type OwnerFormResponse = {
  id: string
  formId: string
  respondentName: string | null
  respondentEmail: string | null
  status: FormResponseStatus
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
}
