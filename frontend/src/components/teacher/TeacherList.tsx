import { useMemo } from "react"
import { TeacherCard } from "./TeacherCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { TeacherWithAssignments } from "@/api/types"

interface TeacherListProps {
  teachers?: TeacherWithAssignments[]
  isLoading: boolean
  search: string
  selectedCourse: string
  selectedSubject: string
}

export function TeacherList({
  teachers = [],
  isLoading,
  search,
  selectedCourse,
  selectedSubject,
}: TeacherListProps) {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return teachers.filter((teacher) => {
      const matchesSearch =
        !query ||
        teacher.full_name.toLowerCase().includes(query) ||
        teacher.assignments.some((a) =>
          a.subject.name.toLowerCase().includes(query)
        )
      const matchesCourse =
        selectedCourse === "all" ||
        teacher.assignments.some(
          (a) => String(a.course.id) === selectedCourse
        )
      const matchesSubject =
        selectedSubject === "all" ||
        teacher.assignments.some(
          (a) => String(a.subject.id) === selectedSubject
        )
      return matchesSearch && matchesCourse && matchesSubject
    })
  }, [teachers, search, selectedCourse, selectedSubject])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-lg font-medium">Ничего не найдено</p>
        <p className="text-sm text-muted-foreground">
          Попробуйте изменить фильтры или поисковый запрос
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((teacher) => (
        <TeacherCard key={teacher.id} teacher={teacher} />
      ))}
    </div>
  )
}
