export interface AuthUser {
  id: number
  name: string
  role: 'catmin' | 'user'
}

/* GDPR
export const useAuth = () => {
  const session = useCookie<AuthUser | null>('session')
  const user = useState<AuthUser | null>('user', () => session.value)

  const loggedIn = computed(() => !!user.value)

  const login = (data: AuthUser) => {
    user.value = data
    session.value = data
  }

  const logout = () => {
    user.value = null
    session.value = null
  }

  return {
    user,
    loggedIn,
    login,
    logout
  }
} */
