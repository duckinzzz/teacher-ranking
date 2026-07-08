import {useParams} from "react-router-dom"
import {RatingForm} from "@/components/rating/RatingForm"
import {useTeacher, useTeacherAssignments} from "@/hooks/useTeachers"
import {useMyRatings} from "@/hooks/useRatings"
import {useAuthContext} from "@/hooks/useAuthContext"
import {Skeleton} from "@/components/ui/skeleton"

export function RatePage() {
    const {id} = useParams()
    const teacherId = Number(id)
    const {person} = useAuthContext()
    const {data: teacher, isLoading} = useTeacher(teacherId)
    const {data: assignments, isLoading: assignmentsLoading} = useTeacherAssignments(teacherId)
    const {data: myRatings} = useMyRatings(person?.id)

    const existingRating = myRatings?.find((r) => r.teacher.id === teacherId)

    if (isLoading || !teacher) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2"/>
                <Skeleton className="h-64 w-full"/>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-1">
                <p className="text-muted-foreground">Оценка преподавателя</p>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {teacher.full_name}
                </h1>
            </div>
            <RatingForm teacher={teacher} assignments={assignments} isLoadingAssignments={assignmentsLoading} existingRating={existingRating}/>
        </div>
    )
}
