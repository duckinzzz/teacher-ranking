import { apiRequest } from "./client"
import {
  endpoints,
  nextUnratedUrl,
  skipTeacherUrl,
  teacherAssignmentsUrl,
  teacherRankingUrl,
  teacherRankingsUrl,
  teacherUrl,
} from "./endpoints"
import type {
  NextUnratedResponse,
  PaginatedResponse,
  RankingCategory,
  Teacher,
  TeacherAssignment,
  TeacherRanking,
  TeacherWithAssignments,
} from "./types"

export async function listTeachers(params?: { page?: number; search?: string }) {
  return apiRequest<PaginatedResponse<Teacher>>(endpoints.teachers, {
    params,
  })
}

export async function listTeachersWithAssignments() {
  return apiRequest<TeacherWithAssignments[]>(`${endpoints.teachers}/with_assignments/`)
}

export async function getTeacher(id: number) {
  return apiRequest<Teacher>(teacherUrl(id))
}

export async function getTeacherAssignments(id: number) {
  return apiRequest<TeacherAssignment[]>(teacherAssignmentsUrl(id))
}

export async function getTeacherRanking(id: number) {
  return apiRequest<TeacherRanking>(teacherRankingUrl(id))
}

export async function getTeacherRankings(category: RankingCategory) {
  return apiRequest<TeacherRanking[]>(teacherRankingsUrl(category))
}

export async function getNextUnratedTeacher() {
  return apiRequest<NextUnratedResponse>(nextUnratedUrl(), {
    cache: "no-store",
  })
}

export async function skipTeacher(teacherId: number) {
  return apiRequest<{ skipped: boolean }>(skipTeacherUrl(teacherId), {
    method: "POST",
  })
}
