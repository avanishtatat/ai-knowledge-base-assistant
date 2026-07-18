export interface Document {
  id: string
  originalName: string
  mimeType: string
  size: number
  status: string
  createdAt: string
}

export interface DocumentsData {
  documents: Document[]
}

export interface UploadedDocumentData {
  document: Document
}
