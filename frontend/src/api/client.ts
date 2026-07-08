export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string, message?: string) {
    super(message || detail)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(base: string, params?: RequestConfig["params"]) {
  if (!params) return base
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined)
  if (filtered.length === 0) return base
  const query = new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)])
  ).toString()
  return `${base}?${query}`
}

export async function apiRequest<T>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, ...init } = config
  const fullUrl = buildUrl(url, params)

  const response = await fetch(fullUrl, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
    ...init,
  })

  if (response.status === 204) {
    return undefined as T
  }

  let data: unknown
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail?: unknown }).detail)
        : typeof data === "string"
          ? data
          : `HTTP ${response.status}`
    throw new ApiError(response.status, detail)
  }

  return data as T
}
