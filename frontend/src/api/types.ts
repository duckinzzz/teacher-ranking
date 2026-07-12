export interface Person {
  id: number
  name: string
  created_at: string
}

export interface Teacher {
  id: number
  full_name: string
}

export interface Subject {
  id: number
  name: string
}

export interface Course {
  id: number
  number: number
}

export interface TeacherAssignment {
  id: number
  teacher: Teacher
  subject: Subject
  course: Course
}

export interface TeacherWithAssignments extends Teacher {
  assignments: TeacherAssignment[]
}

export interface Rating {
  id: number
  person: Person
  teacher: Teacher
  vibe_score: number
  easy_score: number
  quality_score: number
  comment: string
  created_at: string
  updated_at: string
  like_count: number
  dislike_count: number
  user_reaction: 1 | -1 | null
}

export interface TeacherRanking {
  id: number
  full_name: string
  avg_vibe: number | null
  avg_easy: number | null
  avg_quality: number | null
  ratings_count: number
  rank: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface NextUnratedResponse {
  done: boolean
  teacher: TeacherWithAssignments | null
}

export interface LoginPayload {
  name: string
}

export interface RatingPayload {
  teacher_id: number
  vibe_score: number
  easy_score: number
  quality_score: number
  comment?: string
}

export type RankingCategory = "vibe" | "easy" | "quality"
