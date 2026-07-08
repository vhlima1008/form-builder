import { api } from "@/lib/api"
import type {
  CreateFormRequest,
  Form,
  FormDetails,
  UpdateFormRequest,
} from "@/types/form"

export const formService = {
  async createForm(data: CreateFormRequest) {
    const response = await api.post<Form>("/forms", data)
    return response.data
  },

  async getForms() {
    const response = await api.get<Form[]>("/forms")
    return response.data
  },

  // Consulta dados de uma tabela específica (SELECT + WHERE): pesquisa
  // formulários do usuário autenticado por título e, opcionalmente,
  // por status de publicação.
  async searchForms(params: { title?: string; published?: boolean }) {
    const response = await api.get<Form[]>("/forms/search", { params })
    return response.data
  },

  async getFormById(formId: string) {
    const response = await api.get<FormDetails>(`/forms/${formId}`)
    return response.data
  },

  async updateForm(formId: string, data: UpdateFormRequest) {
    const response = await api.put<Form>(`/forms/${formId}`, data)
    return response.data
  },

  async deleteForm(formId: string) {
    await api.delete(`/forms/${formId}`)
  },

  async publishForm(formId: string) {
    const response = await api.patch<Form>(`/forms/${formId}/publish`)
    return response.data
  },

  async unpublishForm(formId: string) {
    const response = await api.patch<Form>(`/forms/${formId}/unpublish`)
    return response.data
  },
}
