from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Teacher(models.Model):
    full_name = models.CharField("ФИО", max_length=255, unique=True)

    class Meta:
        verbose_name = "Преподаватель"
        verbose_name_plural = "Преподаватели"
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name


class Subject(models.Model):
    name = models.CharField("Название", max_length=255, unique=True)

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(models.Model):
    number = models.PositiveSmallIntegerField("Курс", unique=True)

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"

    def __str__(self):
        return f"{self.number}-й курс"


class TeacherAssignment(models.Model):
    """Связка преподаватель — предмет — курс."""
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE,
        verbose_name="Преподаватель",
        related_name="assignments",
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE,
        verbose_name="Предмет",
        related_name="assignments",
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE,
        verbose_name="Курс",
        related_name="assignments",
    )

    class Meta:
        verbose_name = "Предмет преподавателя"
        verbose_name_plural = "Предметы преподавателей"
        ordering = ["course__number", "subject__name"]
        unique_together = [("teacher", "subject", "course")]

    def __str__(self):
        return f"{self.subject.name} ({self.course.number}-й курс)"


class Person(models.Model):
    """Пользователь приложения (только имя, без пароля)."""
    name = models.CharField("Имя", max_length=100, unique=True)
    created_at = models.DateTimeField("Зарегистрирован", auto_now_add=True)

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        return self.name

    @property
    def is_authenticated(self):
        return True


class SkippedTeacher(models.Model):
    """Преподаватель, которого пользователь пропустил («не знаю кто это»)."""
    person = models.ForeignKey(
        Person, on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="skipped",
    )
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE,
        verbose_name="Преподаватель",
        related_name="skipped",
    )
    created_at = models.DateTimeField("Пропущен", auto_now_add=True)

    class Meta:
        verbose_name = "Пропущенный преподаватель"
        verbose_name_plural = "Пропущенные преподаватели"
        unique_together = [("person", "teacher")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.person} пропустил {self.teacher}"


class Rating(models.Model):
    """Оценка преподавателя пользователем (один препод — один раз)."""
    person = models.ForeignKey(
        Person, on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="ratings",
    )
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE,
        verbose_name="Преподаватель",
        related_name="ratings",
    )
    vibe_score = models.PositiveSmallIntegerField(
        "Вайбовость",
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    easy_score = models.PositiveSmallIntegerField(
        "Халявность",
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    quality_score = models.PositiveSmallIntegerField(
        "Качество обучения",
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    comment = models.TextField("Комментарий", blank=True, default="")
    is_anonymous = models.BooleanField("Анонимно", default=False)
    created_at = models.DateTimeField("Дата оценки", auto_now_add=True)
    updated_at = models.DateTimeField("Изменено", auto_now=True)

    class Meta:
        verbose_name = "Оценка"
        verbose_name_plural = "Оценки"
        unique_together = [("person", "teacher")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.person} → {self.teacher}"


class RatingLike(models.Model):
    """Лайк / дизлайк мнения (оценки) от пользователя."""

    class Value(models.IntegerChoices):
        LIKE = 1, "👍"
        DISLIKE = -1, "👎"

    person = models.ForeignKey(
        Person, on_delete=models.CASCADE,
        verbose_name="Пользователь",
        related_name="rating_likes",
    )
    rating = models.ForeignKey(
        Rating, on_delete=models.CASCADE,
        verbose_name="Оценка",
        related_name="likes",
    )
    value = models.SmallIntegerField("Реакция", choices=Value.choices)
    created_at = models.DateTimeField("Поставлена", auto_now_add=True)

    class Meta:
        verbose_name = "Лайк/дизлайк"
        verbose_name_plural = "Лайки/дизлайки"
        unique_together = [("person", "rating")]
        ordering = ["-created_at"]

    def __str__(self):
        label = "👍" if self.value == self.Value.LIKE else "👎"
        return f"{self.person} {label} мнение {self.rating_id}"
