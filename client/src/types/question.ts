export interface QuestionDocument {
  id: string
  title: string
}

export interface QuestionAnswer {
  conversationId: string
  document: QuestionDocument
  question: string
  answer: string
  createdAt: string
}

export interface AskQuestionRequest {
  documentId: string
  question: string
}
