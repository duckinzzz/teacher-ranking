import { useId, useState } from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Course, Subject } from "@/api/types"

interface TeacherFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  selectedCourse: string
  onCourseChange: (value: string) => void
  selectedSubject: string
  onSubjectChange: (value: string) => void
  courses?: Course[]
  subjects?: Subject[]
  isLoading?: boolean
}

export function TeacherFilters({
  search,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  selectedSubject,
  onSubjectChange,
  courses,
  subjects,
  isLoading = false,
}: TeacherFiltersProps) {
  const searchId = useId()
  const selectDisabled = isLoading || (!courses && !subjects)
  const [courseOpen, setCourseOpen] = useState(false)
  const [subjectOpen, setSubjectOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor={searchId}>Поиск</Label>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={searchId}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Имя преподавателя или предмет"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:w-[420px]">
        <div className="space-y-2">
          <Label>Курс</Label>
          <Select
            value={selectedCourse}
            onValueChange={onCourseChange}
            open={courseOpen}
            onOpenChange={setCourseOpen}
            disabled={selectDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Загрузка..." : "Все курсы"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все курсы</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.number} курс
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Предмет</Label>
          <Select
            value={selectedSubject}
            onValueChange={onSubjectChange}
            open={subjectOpen}
            onOpenChange={setSubjectOpen}
            disabled={selectDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Загрузка..." : "Все предметы"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все предметы</SelectItem>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={String(subject.id)}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
