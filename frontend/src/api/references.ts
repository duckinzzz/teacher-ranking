import { apiRequest } from "./client"
import { endpoints } from "./endpoints"
import type { Course, Subject } from "./types"

export async function listSubjects() {
  return apiRequest<Subject[]>(endpoints.subjects)
}

export async function listCourses() {
  return apiRequest<Course[]>(endpoints.courses)
}
