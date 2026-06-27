export type UploadItem = { name: string; url: string; mtime: number }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Only set a JSON content-type when there's actually a body. Sending
  // `Content-Type: application/json` with an empty body (e.g. DELETE) makes
  // Fastify reject the request with a 400 before it reaches the handler.
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (options.body != null && headers['Content-Type'] == null) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error((detail as { error?: string }).error ?? res.statusText)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

export const adminApi = {
  me: () => request<{ email: string }>('/auth/me'),
  login: (email: string, password: string) =>
    request<{ email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  getSiteContent: () => request<Record<string, unknown>>('/site-content'),
  setSiteContent: (key: string, value: unknown) =>
    request<unknown>(`/site-content/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),

  listUploads: () => request<UploadItem[]>('/uploads'),
  deleteUpload: (name: string) =>
    request<{ ok: boolean }>(`/uploads/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  upload: async (file: File): Promise<{ url: string; name: string }> => {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    return request<{ url: string; name: string }>('/uploads', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, data }),
    })
  },

  listLeads: () => request<Lead[]>('/leads'),
  deleteLead: (id: number) =>
    request<{ ok: boolean }>(`/leads/${id}`, { method: 'DELETE' }),
  exportLeads: () => `/api/leads/export`,

  visitStats: (days: number) => request<VisitStats>(`/visits/stats?days=${days}`),
}

export type VisitStats = {
  days: number
  totalVisits: number
  uniqueVisitors: number
  series: { day: string; visits: number; visitors: number }[]
  topPaths: { path: string; visits: number }[]
}

export type Lead = {
  id: number
  name: string
  email: string
  phone: string
  service: string
  details: string
  created_at: string
}
