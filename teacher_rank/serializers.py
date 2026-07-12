from rest_framework import serializers

from .models import Course, Person, Rating, RatingLike, Subject, Teacher, TeacherAssignment


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ["id", "full_name"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name"]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "number"]


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source="teacher", write_only=True
    )
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source="subject", write_only=True
    )
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    class Meta:
        model = TeacherAssignment
        fields = [
            "id",
            "teacher",
            "teacher_id",
            "subject",
            "subject_id",
            "course",
            "course_id",
        ]


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["id", "name", "created_at"]
        read_only_fields = ["created_at"]


class RatingSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source="teacher", write_only=True
    )
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Rating
        fields = [
            "id",
            "person",
            "teacher",
            "teacher_id",
            "vibe_score",
            "easy_score",
            "quality_score",
            "comment",
            "is_anonymous",
            "created_at",
            "updated_at",
            "like_count",
            "dislike_count",
            "user_reaction",
        ]
        read_only_fields = ["created_at", "updated_at"]
        validators = []

    def _get_reaction_counts(self, obj):
        """Compute like/dislike counts from the prefetched likes relation."""
        likes = 0
        dislikes = 0
        for rl in obj.likes.all():
            if rl.value == RatingLike.Value.LIKE:
                likes += 1
            elif rl.value == RatingLike.Value.DISLIKE:
                dislikes += 1
        return likes, dislikes

    def get_like_count(self, obj) -> int:
        likes, _ = self._get_reaction_counts(obj)
        return likes

    def get_dislike_count(self, obj) -> int:
        _, dislikes = self._get_reaction_counts(obj)
        return dislikes

    def get_user_reaction(self, obj) -> int | None:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        person = request.user
        for rl in obj.likes.all():
            if rl.person_id == person.pk:
                return rl.value
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_anonymous:
            data["person"] = None
        return data

    def create(self, validated_data):
        person = validated_data.pop("person")
        teacher = validated_data.pop("teacher")
        rating, _ = Rating.objects.update_or_create(
            person=person,
            teacher=teacher,
            defaults=validated_data,
        )
        return rating


class TeacherRankingSerializer(serializers.Serializer):
    """Read-only агрегированные данные рейтинга преподавателя."""

    id = serializers.IntegerField(source="teacher__id")
    full_name = serializers.CharField(source="teacher__full_name")
    avg_vibe = serializers.FloatField()
    avg_easy = serializers.FloatField()
    avg_quality = serializers.FloatField()
    ratings_count = serializers.IntegerField()
    rank = serializers.IntegerField()


class TeacherWithAssignmentsSerializer(serializers.ModelSerializer):
    assignments = TeacherAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Teacher
        fields = ["id", "full_name", "assignments"]
