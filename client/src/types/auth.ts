export interface User {
  id: string
  name: string
  email: string
  createdAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name: string
}

export interface AuthData {
  token: string
  user: User
}

export interface CurrentUserData {
  user: User
}
