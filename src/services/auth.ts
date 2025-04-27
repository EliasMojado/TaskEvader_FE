import { API_BASE_URL } from '../constants'

// shape of your payload/response
interface AuthResponse {
  token: string
  user: { id: string; username: string }
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/token-auth/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Login failed')
  }

  return res.json()
}

export async function signup(
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  password: string
): Promise<AuthResponse> {

  const display_name = `${first_name} ${last_name}`

  const res = await fetch(`${API_BASE_URL}/api/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      first_name,
      last_name,
      password,
      display_name,
    }),
  })
  if (!res.ok) throw new Error((await res.json()).message || 'Signup failed')
  return res.json()
}