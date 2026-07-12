from django.contrib import admin

from .models import Teacher, Subject, Course, TeacherAssignment, Person, Rating, RatingLike


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("full_name",)
    search_fields = ("full_name",)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("number",)


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ("teacher", "subject", "course")
    list_filter = ("course", "subject")
    search_fields = ("teacher__full_name", "subject__name")


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("person", "teacher", "vibe_score", "easy_score", "quality_score", "created_at")
    list_filter = ("person", "teacher")


@admin.register(RatingLike)
class RatingLikeAdmin(admin.ModelAdmin):
    list_display = ("person", "rating", "value", "created_at")
    list_filter = ("value", "person")
