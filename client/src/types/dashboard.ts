export interface DashboardDocument {
  id: string
  originalName: string
  mimeType: string
  size: number
  status: string
  createdAt: string
}

export interface DashboardData {
  totalDocuments: number
  totalQuestions: number
  recentDocuments: DashboardDocument[]
}
