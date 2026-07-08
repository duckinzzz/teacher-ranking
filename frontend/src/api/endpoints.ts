const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"

export const endpoints = {
  persons: `${API_BASE_URL}/persons`,
  teachers: `${API_BASE_URL}/teachers`,
  subjects: `${API_BASE_URL}/subjects`,
  courses: `${API_BASE_URL}/courses`,
  assignments: `${API_BASE_URL}/assignments`,
  ratings: `${API_BASE_URL}/ratings/`,
}

export function teacherUrl(id: number) {
  return `${endpoints.teachers}/${id}/`
}

export function teacherAssignmentsUrl(id: number) {
  return `${endpoints.teachers}/${id}/assignments/`
}

export function teacherRankingUrl(id: number) {
  return `${endpoints.teachers}/${id}/ranking/`
}

export function teacherRankingsUrl(category: string) {
  return `${endpoints.teachers}/rankings/?category=${encodeURIComponent(category)}`
}

export function nextUnratedUrl() {
  return `${endpoints.teachers}/next_unrated/`
}

export function skipTeacherUrl(teacherId: number) {
  return `${endpoints.teachers}/${teacherId}/skip/`
}
