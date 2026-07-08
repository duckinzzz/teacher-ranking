import { useQuery } from "@tanstack/react-query"
import { listCourses, listSubjects } from "@/api/references"

export const referenceKeys = {
  subjects: ["subjects"] as const,
  courses: ["courses"] as const,
}

export function useSubjects() {
  return useQuery({
    queryKey: referenceKeys.subjects,
    queryFn: listSubjects,
  })
}

export function useCourses() {
  return useQuery({
    queryKey: referenceKeys.courses,
    queryFn: listCourses,
  })
}
