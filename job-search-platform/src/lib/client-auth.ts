export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  
  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith('csrf-token=')
  )
  
  return csrfCookie ? csrfCookie.split('=')[1] : null
}

export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = getCSRFToken()
  
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken || '',
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
  }
  
  return fetch(url, secureOptions)
}

export async function securePost(url: string, data: any): Promise<Response> {
  return secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function secureGet(url: string): Promise<Response> {
  return secureFetch(url, {
    method: 'GET',
  })
}