import { API_BASE_URL } from '../constants'

// shape of your payload/response
interface AuthResponse {
  access: string;
  refresh: string;
}

export async function healthCheck(authToken?: string): Promise<{ status: number; data?: any }> {
  let res;

  try {
    if (!authToken) {
      res = await fetch(`${API_BASE_URL}/api/health/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      res = await fetch(`${API_BASE_URL}/api/health/`, {
        method: 'GET',
        headers: await HeaderAuth(),
      });
    }

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || 'Health check failed');
      (error as any).status = res.status;
      throw error;
    }

    return { status: res.status, data };
  } catch (error) {
    if (!(error as any).status) {
      (error as any).status = 500;
    }
    throw error;
  }
}

export async function HeaderAuth() {
  const token = await getAuthToken()

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function getAuthToken() {
    const token = localStorage.getItem('authToken')

    if (!token) {
      throw new Error('Authentication token not found')
    }

    return token
}


export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/token/`, {
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