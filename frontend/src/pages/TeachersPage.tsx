import { useState } from "react"
import { ListMagnifyingGlass, WarningCircle } from "@phosphor-icons/react"
import { TeacherFilters } from "@/components/teacher/TeacherFilters"
import { TeacherList } from "@/components/teacher/TeacherList"
import { useCourses, useSubjects } from "@/hooks/useReferences"
import { useTeachersWithAssignments } from "@/hooks/useTeachers"
import { useMyRatings } from "@/hooks/useRatings"
import { useAuthContext } from "@/hooks/useAuthContext"
import type { Rating } from "@/api/types"

export function TeachersPage() {
  const [search, setSearch] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const { person } = useAuthContext()

  const {
    data: teachers,
    isLoading: isLoadingTeachers,
    error: teachersError,
  } = useTeachersWithAssignments()
  const { data: courses, isLoading: isLoadingCourses } = useCourses()
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjects()
  const { data: myRatings } = useMyRatings(person?.id)

  const ratingsByTeacher: Record<number, Rating> = {}
  if (myRatings) {
    for (const r of myRatings) {
      ratingsByTeacher[r.teacher.id] = r
    }
  }

  if (teachersError) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
        <WarningCircle className="h-12 w-12 text-destructive" />
        <div>
          <p className="text-lg font-semibold">Не удалось загрузить данные</p>
          <p className="text-sm text-muted-foreground">
            Проверьте подключение к серверу и повторите попытку
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <ListMagnifyingGlass className="h-8 w-8 text-primary" />
          Преподаватели
        </h1>
        <p className="text-muted-foreground">
          Найдите преподавателя и посмотрите его рейтинг
        </p>
      </div>

      <TeacherFilters
        search={search}
        onSearchChange={setSearch}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        courses={courses}
        subjects={subjects}
        isLoading={isLoadingCourses || isLoadingSubjects}
      />

      <TeacherList
        teachers={teachers}
        isLoading={isLoadingTeachers || isLoadingCourses || isLoadingSubjects}
        search={search}
        selectedCourse={selectedCourse}
        selectedSubject={selectedSubject}
        ratingsByTeacher={ratingsByTeacher}
      />
    </div>
  )
}
