import { apiClient } from './apiClient'
import type { ApiResponse } from '../types/api'
import type {
  Document,
  DocumentsData,
  UploadedDocumentData,
} from '../types/document'

export async function getDocuments(): Promise<Document[]> {
  const response = await apiClient.get<ApiResponse<DocumentsData>>('/documents')

  return response.data.data.documents.map(({ _id, ...document }) => ({
    ...document,
    id: _id,
  }))
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData()
  formData.append('document', file)

  const response = await apiClient.post<ApiResponse<UploadedDocumentData>>(
    '/documents/upload',
    formData,
  )

  return response.data.data.document
}

export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/documents/${documentId}`)
}
