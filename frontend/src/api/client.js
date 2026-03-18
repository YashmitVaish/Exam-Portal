const BASE = 'http://localhost:8000'

class ApiError extends Error {
  constructor(status, detail) {
    super(detail)
    this.status = status
    this.detail = detail
  }
}

async function request(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data =
    res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(res.status, data?.detail || `HTTP ${res.status}`)
  }
  return data
}

// ── auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email, password, role) =>
    request('POST', '/auth/register', { email, password, role }),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),
}

// ── exams ─────────────────────────────────────────────────────────────────────
export const examsApi = {
  list: (token) =>
    request('GET', '/exams/', null, token),

  get: (id, token) =>
    request('GET', `/exams/${id}`, null, token),

  create: (body, token) =>
    request('POST', '/exams/', body, token),

  update: (id, body, token) =>
    request('PATCH', `/exams/${id}`, body, token),

  publish: (id, token) =>
    request('POST', `/exams/${id}/publish`, null, token),

  delete: (id, token) =>
    request('DELETE', `/exams/${id}`, null, token),
}

// ── submissions ───────────────────────────────────────────────────────────────
export const submissionsApi = {
  join: (examId, token) =>
    request('POST', `/submissions/join/${examId}`, null, token),

  submit: (submissionId, answers, timings, token) =>
    request('POST', `/submissions/${submissionId}/submit`, { answers, timings }, token),

  results: (examId, token) =>
    request('GET', `/submissions/results/${examId}`, null, token),
}

// ── analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  get: (examId, token) =>
    request('GET', `/analytics/${examId}`, null, token),
}
