from django.contrib import admin
from django.db.models import Avg, Count, Q

from .models import (
    Course,
    Person,
    Rating,
    RatingLike,
    SkippedTeacher,
    Subject,
    Teacher,
    TeacherAssignment,
)


# ---------------------------------------------------------------------------
# Inline-формы
# ---------------------------------------------------------------------------

class TeacherAssignmentInline(admin.TabularInline):
    model = TeacherAssignment
    extra = 1
    autocomplete_fields = ["subject"]
    verbose_name = "Предмет"
    verbose_name_plural = "Предметы преподавателя"


class RatingInline(admin.TabularInline):
    model = Rating
    extra = 0
    fields = [
        "teacher",
        "vibe_score_display",
        "easy_score_display",
        "quality_score_display",
        "comment",
        "is_anonymous",
        "created_at",
    ]
    readonly_fields = [
        "teacher",
        "vibe_score_display",
        "easy_score_display",
        "quality_score_display",
        "comment",
        "is_anonymous",
        "created_at",
    ]
    can_delete = False
    show_change_link = True
    verbose_name = "Оценка"
    verbose_name_plural = "Оценки пользователя"

    @admin.display(description="Вайбовость")
    def vibe_score_display(self, obj):
        return f"{obj.vibe_score}/10" if obj.vibe_score is not None else "—"

    @admin.display(description="Халявность")
    def easy_score_display(self, obj):
        return f"{obj.easy_score}/10" if obj.easy_score is not None else "—"

    @admin.display(description="Качество")
    def quality_score_display(self, obj):
        return f"{obj.quality_score}/10" if obj.quality_score is not None else "—"

    def has_add_permission(self, request, obj):
        return False


class RatingTeacherInline(admin.TabularInline):
    """Оценки преподавателя — read-only, показывает кто оценил."""
    model = Rating
    extra = 0
    fields = ["person", "vibe_score_display", "easy_score_display", "quality_score_display", "comment", "is_anonymous", "created_at"]
    readonly_fields = ["person", "vibe_score_display", "easy_score_display", "quality_score_display", "comment", "is_anonymous", "created_at"]
    can_delete = False
    show_change_link = True
    verbose_name = "Оценка"
    verbose_name_plural = "Оценки преподавателя"

    @admin.display(description="Вайбовость")
    def vibe_score_display(self, obj):
        return f"{obj.vibe_score}/10" if obj.vibe_score is not None else "—"

    @admin.display(description="Халявность")
    def easy_score_display(self, obj):
        return f"{obj.easy_score}/10" if obj.easy_score is not None else "—"

    @admin.display(description="Качество")
    def quality_score_display(self, obj):
        return f"{obj.quality_score}/10" if obj.quality_score is not None else "—"

    def has_add_permission(self, request, obj):
        return False


class LikeInline(admin.TabularInline):
    model = RatingLike
    extra = 0
    fields = ["rating", "value", "created_at"]
    readonly_fields = ["rating", "value", "created_at"]
    can_delete = False
    verbose_name = "Реакция"
    verbose_name_plural = "Реакции пользователя"

    def has_add_permission(self, request, obj):
        return False


class SkippedInline(admin.TabularInline):
    model = SkippedTeacher
    extra = 0
    fields = ["teacher", "created_at"]
    readonly_fields = ["teacher", "created_at"]
    can_delete = False
    verbose_name = "Пропущенный преподаватель"
    verbose_name_plural = "Пропущенные преподаватели"


# ---------------------------------------------------------------------------
# Преподаватель
# ---------------------------------------------------------------------------

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "assignments_count",
        "ratings_count",
        "avg_vibe",
        "avg_easy",
        "avg_quality",
    ]
    search_fields = ["full_name"]
    inlines = [TeacherAssignmentInline, RatingTeacherInline]
    list_per_page = 30

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _assignments_count=Count("assignments", distinct=True),
            _ratings_count=Count("ratings", distinct=True),
            _avg_vibe=Avg("ratings__vibe_score"),
            _avg_easy=Avg("ratings__easy_score"),
            _avg_quality=Avg("ratings__quality_score"),
        )

    @admin.display(description="Предметов", ordering="_assignments_count")
    def assignments_count(self, obj):
        return obj._assignments_count

    @admin.display(description="Оценок", ordering="_ratings_count")
    def ratings_count(self, obj):
        return obj._ratings_count

    @admin.display(description="Вайб", ordering="_avg_vibe")
    def avg_vibe(self, obj):
        return f"{obj._avg_vibe:.1f}" if obj._avg_vibe is not None else "—"

    @admin.display(description="Хал", ordering="_avg_easy")
    def avg_easy(self, obj):
        return f"{obj._avg_easy:.1f}" if obj._avg_easy is not None else "—"

    @admin.display(description="Кач", ordering="_avg_quality")
    def avg_quality(self, obj):
        return f"{obj._avg_quality:.1f}" if obj._avg_quality is not None else "—"


# ---------------------------------------------------------------------------
# Предмет
# ---------------------------------------------------------------------------

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "assignments_count"]
    search_fields = ["name"]
    list_per_page = 30

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _assignments_count=Count("assignments", distinct=True),
        )

    @admin.display(description="Преподавателей", ordering="_assignments_count")
    def assignments_count(self, obj):
        return obj._assignments_count


# ---------------------------------------------------------------------------
# Курс
# ---------------------------------------------------------------------------

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["number", "assignments_count"]
    list_per_page = 20

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _assignments_count=Count("assignments", distinct=True),
        )

    @admin.display(description="Связей", ordering="_assignments_count")
    def assignments_count(self, obj):
        return obj._assignments_count


# ---------------------------------------------------------------------------
# Связка преподаватель–предмет–курс
# ---------------------------------------------------------------------------

@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ["teacher", "subject", "course"]
    list_filter = ["course", "subject"]
    search_fields = ["teacher__full_name", "subject__name"]
    autocomplete_fields = ["teacher", "subject"]
    list_select_related = ["teacher", "subject", "course"]
    list_per_page = 50


# ---------------------------------------------------------------------------
# Пользователь
# ---------------------------------------------------------------------------

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ["name", "ratings_count", "likes_count", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at"]
    inlines = [RatingInline, LikeInline, SkippedInline]
    list_per_page = 30

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _ratings_count=Count("ratings", distinct=True),
            _likes_count=Count("rating_likes", distinct=True),
        )

    @admin.display(description="Оценок", ordering="_ratings_count")
    def ratings_count(self, obj):
        return obj._ratings_count

    @admin.display(description="Реакций", ordering="_likes_count")
    def likes_count(self, obj):
        return obj._likes_count


# ---------------------------------------------------------------------------
# Оценка (мнение)
# ---------------------------------------------------------------------------

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = [
        "person",
        "teacher",
        "vibe_display",
        "easy_display",
        "quality_display",
        "is_anonymous",
        "like_count_display",
        "created_at",
    ]
    list_filter = ["is_anonymous", "created_at", "teacher"]
    search_fields = [
        "person__name",
        "teacher__full_name",
        "comment",
    ]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at", "updated_at"]
    autocomplete_fields = ["person", "teacher"]
    list_select_related = ["person", "teacher"]
    list_per_page = 50
    fieldsets = [
        (None, {
            "fields": ["person", "teacher", "is_anonymous"],
        }),
        ("Оценки", {
            "fields": ["vibe_score", "easy_score", "quality_score"],
        }),
        ("Комментарий", {
            "fields": ["comment"],
        }),
        ("Даты", {
            "fields": ["created_at", "updated_at"],
            "classes": ["collapse"],
        }),
    ]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _like_count=Count("likes", filter=Q(likes__value=1)),
            _dislike_count=Count("likes", filter=Q(likes__value=-1)),
        )

    @admin.display(description="Вайб", ordering="vibe_score")
    def vibe_display(self, obj):
        return f"{obj.vibe_score}/10" if obj.vibe_score is not None else "—"

    @admin.display(description="Хал", ordering="easy_score")
    def easy_display(self, obj):
        return f"{obj.easy_score}/10" if obj.easy_score is not None else "—"

    @admin.display(description="Кач", ordering="quality_score")
    def quality_display(self, obj):
        return f"{obj.quality_score}/10" if obj.quality_score is not None else "—"

    @admin.display(description="👍/👎", ordering="_like_count")
    def like_count_display(self, obj):
        likes = getattr(obj, "_like_count", 0)
        dislikes = getattr(obj, "_dislike_count", 0)
        return f"👍{likes} 👎{dislikes}"


# ---------------------------------------------------------------------------
# Лайк / дизлайк
# ---------------------------------------------------------------------------

@admin.register(RatingLike)
class RatingLikeAdmin(admin.ModelAdmin):
    list_display = ["person", "rating_summary", "value_display", "created_at"]
    list_filter = ["value", "created_at"]
    search_fields = ["person__name"]
    autocomplete_fields = ["person", "rating"]
    list_select_related = ["person", "rating__teacher"]
    list_per_page = 50

    @admin.display(description="Мнение", ordering="rating")
    def rating_summary(self, obj):
        return f"{obj.rating.person} → {obj.rating.teacher}"

    @admin.display(description="Реакция", ordering="value")
    def value_display(self, obj):
        return "👍" if obj.value == 1 else "👎"


# ---------------------------------------------------------------------------
# Пропущенные преподаватели
# ---------------------------------------------------------------------------

@admin.register(SkippedTeacher)
class SkippedTeacherAdmin(admin.ModelAdmin):
    list_display = ["person", "teacher", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["person__name", "teacher__full_name"]
    autocomplete_fields = ["person", "teacher"]
    list_per_page = 50
