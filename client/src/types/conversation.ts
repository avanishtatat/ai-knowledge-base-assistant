export interface ConversationDocument {
  id: string
  title: string
}

export interface Conversation {
  id: string
  document: ConversationDocument | null
  documentTitle: string
  question: string
  answer: string
  createdAt: string
}

export interface ConversationsData {
  conversations: Conversation[]
}
