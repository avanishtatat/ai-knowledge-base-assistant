import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/api'
import type { AskQuestionRequest, QuestionAnswer } from '../types/question'

export async function askDocumentQuestion(
  documentId: string,
  question: string,
): Promise<QuestionAnswer> {
  const request: AskQuestionRequest = { documentId, question }
  const response = await apiClient.post<ApiResponse<QuestionAnswer>>(
    '/questions/ask',
    request,
  )

  return response.data.data
}
