export interface Document {
  id: string
  originalName: string
  mimeType: string
  size: number
  status: string
  createdAt: string
}

export interface DocumentsData {
  documents: Array<Omit<Document, 'id'> & { _id: string }>
}

export interface UploadedDocumentData {
  document: Document
}
