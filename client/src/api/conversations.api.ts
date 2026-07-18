import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/api'
import type { Conversation, ConversationsData } from '../types/conversation'

export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<ApiResponse<ConversationsData>>(
    '/conversations',
  )

  return response.data.data.conversations
}
