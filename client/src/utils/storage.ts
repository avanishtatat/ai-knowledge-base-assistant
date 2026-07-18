const ACCESS_TOKEN_KEY = 'knowledge_base_access_token'

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(ACCESS_TOKEN_KEY),
}
