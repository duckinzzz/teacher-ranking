import { useQuery } from "@tanstack/react-query"
import {
  getNextUnratedTeacher,
  getTeacher,
  getTeacherAssignments,
  getTeacherRanking,
  getTeacherRankings,
  listTeachers,
  listTeachersWithAssignments,
} from "@/api/teachers"
import type { RankingCategory } from "@/api/types"

export const teacherKeys = {
  all: ["teachers"] as const,
  list: (search?: string) => [...teacherKeys.all, "list", search ?? ""] as const,
  withAssignments: () => [...teacherKeys.all, "with-assignments"] as const,
  detail: (id: number) => [...teacherKeys.all, "detail", id] as const,
  assignments: (id: number) =>
    [...teacherKeys.all, "assignments", id] as const,
  ranking: (id: number) => [...teacherKeys.all, "ranking", id] as const,
  rankings: (category: RankingCategory) =>
    [...teacherKeys.all, "rankings", category] as const,
  nextUnrated: () => [...teacherKeys.all, "next-unrated"] as const,
}

export function useTeachers(search?: string) {
  return useQuery({
    queryKey: teacherKeys.list(search),
    queryFn: () => listTeachers({ search }),
  })
}

export function useTeachersWithAssignments() {
  return useQuery({
    queryKey: teacherKeys.withAssignments(),
    queryFn: listTeachersWithAssignments,
  })
}

export function useTeacher(id: number) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => getTeacher(id),
    enabled: Number.isFinite(id),
  })
}

export function useTeacherAssignments(id: number) {
  return useQuery({
    queryKey: teacherKeys.assignments(id),
    queryFn: () => getTeacherAssignments(id),
    enabled: Number.isFinite(id),
  })
}

export function useTeacherRanking(id: number) {
  return useQuery({
    queryKey: teacherKeys.ranking(id),
    queryFn: () => getTeacherRanking(id),
    enabled: Number.isFinite(id),
  })
}

export function useTeacherRankings(category: RankingCategory) {
  return useQuery({
    queryKey: teacherKeys.rankings(category),
    queryFn: () => getTeacherRankings(category),
  })
}

export function useNextUnratedTeacher() {
  return useQuery({
    queryKey: teacherKeys.nextUnrated(),
    queryFn: getNextUnratedTeacher,
  })
}
