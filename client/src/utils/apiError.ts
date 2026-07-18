import axios from 'axios'

interface ApiErrorResponse {
  message?: unknown
  details?: unknown
}

function getValidationMessage(details: unknown): string | undefined {
  if (!Array.isArray(details)) {
    return undefined
  }

  for (const detail of details) {
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (
      typeof detail === 'object' &&
      detail !== null &&
      'message' in detail &&
      typeof detail.message === 'string' &&
      detail.message.trim()
    ) {
      return detail.message
    }
  }

  return undefined
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback
  }

  const response = error.response?.data
  const validationMessage = getValidationMessage(response?.details)

  if (validationMessage) {
    return validationMessage
  }

  return typeof response?.message === 'string' && response.message.trim()
    ? response.message
    : fallback
}
