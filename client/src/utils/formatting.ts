export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / 1024 ** unitIndex

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

export function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getReadableFileType(
  mimeType: string,
  fileName: string,
): string {
  const fileTypes: Record<string, string> = {
    'application/pdf': 'PDF document',
    'application/msword': 'Word document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'Word document',
    'text/markdown': 'Markdown document',
    'text/plain': 'Text document',
  }

  if (fileTypes[mimeType]) {
    return fileTypes[mimeType]
  }

  const extension = fileName.split('.').pop()
  return extension && extension !== fileName
    ? `${extension.toUpperCase()} file`
    : 'Document'
}
