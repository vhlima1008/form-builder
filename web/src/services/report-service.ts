import { api } from "@/lib/api"
import type {
  FormResponseCount,
  OwnerFormResponse,
  QuestionWithoutAnswer,
} from "@/types/report"

export const reportService = {
  // INNER JOIN + agregação: quantidade de respostas finalizadas por
  // formulário publicado do usuário autenticado.
  async getResponseCounts() {
    const response = await api.get<FormResponseCount[]>(
      "/reports/response-counts"
    )
    return response.data
  },

  // INNER JOIN + filtro de período: respostas recebidas por um
  // formulário específico dentro de um intervalo de datas.
  async getResponsesInPeriod(formId: string, start: string, end: string) {
    const response = await api.get<OwnerFormResponse[]>(
      `/reports/forms/${formId}/responses-in-period`,
      { params: { start, end } }
    )
    return response.data
  },

  // Subconsulta com NOT IN: perguntas de um formulário que ainda não
  // receberam respostas dentro do período informado.
  async getQuestionsWithoutAnswers(formId: string, start: string, end: string) {
    const response = await api.get<QuestionWithoutAnswer[]>(
      `/reports/forms/${formId}/questions-without-answers`,
      { params: { start, end } }
    )
    return response.data
  },
}
