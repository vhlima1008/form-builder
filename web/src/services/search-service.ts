import { api } from "@/lib/api"
import type {
  FormQuestionCount,
  FormResponseCount,
  OwnerFormResponse,
  QuestionWithoutAnswer,
  UserSearchResult,
} from "@/types/search"

export const searchService = {
  async getResponseCounts() {
    const response = await api.get<FormResponseCount[]>(
      "/search/response-counts"
    )
    return response.data
  },

  async getResponsesInPeriod(formId: string, start: string, end: string) {
    const response = await api.get<OwnerFormResponse[]>(
      `/forms/${formId}/responses/search/period`,
      { params: { start, end } }
    )
    return response.data
  },

  async getQuestionsWithoutAnswers(formId: string, start: string, end: string) {
    const response = await api.get<QuestionWithoutAnswer[]>(
      `/forms/${formId}/questions/search/without-answers`,
      { params: { start, end } }
    )
    return response.data
  },

  async getPublishedFormsMoreCompleteThanDrafts() {
    const response = await api.get<FormQuestionCount[]>(
      "/search/forms/more-complete-than-drafts"
    )
    return response.data
  },

  async getUsersWithPublishedForms() {
    const response = await api.get<UserSearchResult[]>(
      "/search/users/with-published-forms"
    )
    return response.data
  },
}
