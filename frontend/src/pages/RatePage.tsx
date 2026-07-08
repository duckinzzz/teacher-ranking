import {useParams} from "react-router-dom"
import {RatingForm} from "@/components/rating/RatingForm"
import {useTeacher} from "@/hooks/useTeachers"
import {Skeleton} from "@/components/ui/skeleton"

export function RatePage() {
    const {id} = useParams()
    const teacherId = Number(id)
    const {data: teacher, isLoading} = useTeacher(teacherId)

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
            <RatingForm teacher={teacher}/>
        </div>
    )
}
