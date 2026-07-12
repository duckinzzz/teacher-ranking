from django.db import models
from django.db.models import Avg, Count, Prefetch
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .authentication import SESSION_PERSON_KEY
from .models import Course, Person, Rating, RatingLike, SkippedTeacher, Subject, Teacher, TeacherAssignment
from .serializers import (
    CourseSerializer,
    PersonSerializer,
    RatingSerializer,
    SubjectSerializer,
    TeacherAssignmentSerializer,
    TeacherRankingSerializer,
    TeacherSerializer,
    TeacherWithAssignmentsSerializer,
)

CATEGORY_CONFIG = {
    "vibe": {"title": "Вайбовость", "avg_key": "avg_vibe"},
    "easy": {"title": "Халявность", "avg_key": "avg_easy"},
    "quality": {"title": "Качество обучения", "avg_key": "avg_quality"},
}


class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    @action(detail=False, methods=["get"])
    def with_assignments(self, request):
        queryset = self.get_queryset()
        serializer = TeacherWithAssignmentsSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def assignments(self, request, pk=None):
        teacher = self.get_object()
        assignments = teacher.assignments.select_related("subject", "course")
        serializer = TeacherAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def ranking(self, request, pk=None):
        teacher = self.get_object()
        stats = (
            Rating.objects.filter(teacher=teacher)
            .values("teacher__id", "teacher__full_name")
            .annotate(
                avg_vibe=Avg("vibe_score"),
                avg_easy=Avg("easy_score"),
                avg_quality=Avg("quality_score"),
                ratings_count=Count("id"),
            )
            .order_by("teacher__full_name")
            .first()
        )
        if stats is None:
            return Response(
                {
                    "id": teacher.pk,
                    "full_name": teacher.full_name,
                    "avg_vibe": None,
                    "avg_easy": None,
                    "avg_quality": None,
                    "ratings_count": 0,
                    "rank": None,
                }
            )
        stats["rank"] = 1
        serializer = TeacherRankingSerializer(stats)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def next_unrated(self, request):
        person = request.user
        rated_ids = Rating.objects.filter(person=person).values_list(
            "teacher_id", flat=True
        )
        skipped_ids = SkippedTeacher.objects.filter(person=person).values_list(
            "teacher_id", flat=True
        )
        teacher = (
            Teacher.objects.exclude(pk__in=rated_ids)
            .exclude(pk__in=skipped_ids)
            .first()
        )
        if teacher is None:
            return Response({"done": True, "teacher": None})
        serializer = TeacherWithAssignmentsSerializer(teacher)
        return Response({"done": False, "teacher": serializer.data})

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def skip(self, request, pk=None):
        teacher = self.get_object()
        SkippedTeacher.objects.get_or_create(
            person=request.user, teacher=teacher
        )
        return Response({"skipped": True})

    @action(detail=False, methods=["get"])
    def rankings(self, request):
        category = request.query_params.get("category")
        if category not in CATEGORY_CONFIG:
            return Response(
                {
                    "detail": (
                        f"Недопустимая категория. "
                        f"Доступные: {list(CATEGORY_CONFIG.keys())}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        avg_key = CATEGORY_CONFIG[category]["avg_key"]
        stats = (
            Rating.objects.values("teacher__id", "teacher__full_name")
            .annotate(
                avg_vibe=Avg("vibe_score"),
                avg_easy=Avg("easy_score"),
                avg_quality=Avg("quality_score"),
                ratings_count=Count("id"),
            )
            .order_by("teacher__full_name")
        )
        sorted_list = sorted(stats, key=lambda x: x[avg_key] or 0, reverse=True)
        for rank, item in enumerate(sorted_list, start=1):
            item["rank"] = rank
        serializer = TeacherRankingSerializer(sorted_list, many=True)
        return Response(serializer.data)


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    pagination_class = None  # small reference table – no pagination needed


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    pagination_class = None  # small reference table – no pagination needed


class TeacherAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeacherAssignment.objects.all()
    serializer_class = TeacherAssignmentSerializer


class PersonViewSet(viewsets.GenericViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    permission_classes = [permissions.AllowAny]

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[permissions.AllowAny],
    )
    def login(self, request):
        name = request.data.get("name", "").strip()
        if not name:
            return Response(
                {"detail": "Введите имя"}, status=status.HTTP_400_BAD_REQUEST
            )

        person, _ = Person.objects.get_or_create(name=name)
        request.session[SESSION_PERSON_KEY] = person.pk
        request.session.set_expiry(0)
        serializer = self.get_serializer(person)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[permissions.AllowAny],
    )
    def logout(self, request):
        request.session.flush()
        return Response({"detail": "Выход выполнен"})

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    pagination_class = None  # frontend always queries with filters; manageable dataset

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ("update", "partial_update", "destroy"):
            queryset = queryset.filter(person=self.request.user)
        person_id = self.request.query_params.get("person")
        teacher_id = self.request.query_params.get("teacher")
        if person_id:
            queryset = queryset.filter(person_id=person_id)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)

        queryset = queryset.prefetch_related(
            Prefetch("likes", queryset=RatingLike.objects.select_related("person"))
        )

        ordering = self.request.query_params.get("ordering")
        if ordering == "like_count":
            queryset = queryset.annotate(
                _like_count=Count("likes", filter=models.Q(likes__value=RatingLike.Value.LIKE))
            ).order_by("-_like_count", "-created_at")
        elif ordering == "-like_count":
            queryset = queryset.annotate(
                _like_count=Count("likes", filter=models.Q(likes__value=RatingLike.Value.LIKE))
            ).order_by("_like_count", "-created_at")
        else:
            queryset = queryset.order_by("-created_at")

        return queryset

    def perform_create(self, serializer):
        serializer.save(person=self.request.user)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def react(self, request, pk=None):
        rating = self.get_object()
        person = request.user

        if rating.person_id == person.pk:
            return Response(
                {"detail": "Нельзя реагировать на собственное мнение"},
                status=status.HTTP_403_FORBIDDEN,
            )

        value = request.data.get("value")
        if value not in (RatingLike.Value.LIKE, RatingLike.Value.DISLIKE):
            return Response(
                {"detail": "Укажите value: 1 (лайк) или -1 (дизлайк)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = RatingLike.objects.filter(person=person, rating=rating).first()

        if existing:
            if existing.value == value:
                # Toggle off — same reaction clicked again
                existing.delete()
                return Response({"reaction": None})
            else:
                # Switch reaction
                existing.value = value
                existing.save(update_fields=["value"])
                return Response({"reaction": value})
        else:
            RatingLike.objects.create(person=person, rating=rating, value=value)
            return Response({"reaction": value}, status=status.HTTP_201_CREATED)
