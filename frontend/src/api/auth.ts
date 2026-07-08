import { apiRequest } from "./client"
import { endpoints } from "./endpoints"
import type { LoginPayload, Person } from "./types"

export async function login(payload: LoginPayload) {
  return apiRequest<Person>(`${endpoints.persons}/login/`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function logout() {
  return apiRequest<{ detail: string }>(`${endpoints.persons}/logout/`, {
    method: "POST",
  })
}

export async function me() {
  return apiRequest<Person>(`${endpoints.persons}/me/`)
}
