from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .authentication import SESSION_PERSON_KEY
from .models import Course, Person, Rating, Subject, Teacher, TeacherAssignment


class TeacherRankingAPITests(APITestCase):
    def setUp(self):
        self.teacher = Teacher.objects.create(full_name="Иванов Иван Иванович")
        self.subject = Subject.objects.create(name="Математика")
        self.course = Course.objects.create(number=1)
        TeacherAssignment.objects.create(
            teacher=self.teacher,
            subject=self.subject,
            course=self.course,
        )

    def _login(self, name="Тестовый пользователь"):
        """Create and login a new person via the API."""
        return self.client.post(reverse("teacher_rank:person-login"), {"name": name})

    def _login_as(self, person):
        """Login as an existing person by setting the session directly."""
        session = self.client.session
        session[SESSION_PERSON_KEY] = person.pk
        session.save()

    def test_login_creates_person_and_returns_data(self):
        response = self._login("Тестовый пользователь")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Person.objects.count(), 1)
        self.assertEqual(response.data["name"], "Тестовый пользователь")

    def test_login_requires_name(self):
        response = self.client.post(reverse("teacher_rank:person-login"), {"name": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_rejects_duplicate_name(self):
        Person.objects.create(name="Занятое имя")
        response = self._login("Занятое имя")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("уже занято", response.data["detail"])

    def test_logout(self):
        self._login("Тестовый пользователь")
        response = self.client.post(reverse("teacher_rank:person-logout"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # After logout, authenticated endpoints should return 403
        me_response = self.client.get(reverse("teacher_rank:person-me"))
        self.assertEqual(me_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_teachers(self):
        response = self.client.get(reverse("teacher_rank:teacher-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["full_name"], self.teacher.full_name)

    def test_list_courses(self):
        response = self.client.get(reverse("teacher_rank:course-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["number"], 1)

    def test_list_subjects(self):
        response = self.client.get(reverse("teacher_rank:subject-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Математика")

    def test_teacher_with_assignments(self):
        response = self.client.get(
            reverse("teacher_rank:teacher-with-assignments")
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["assignments"][0]["subject"]["name"],
            "Математика",
        )

    def test_teacher_assignments_detail(self):
        response = self.client.get(
            reverse("teacher_rank:teacher-assignments", kwargs={"pk": self.teacher.pk})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(response.data[0]["course"]["number"], 1)

    def test_create_rating(self):
        self._login("Оценивающий")
        response = self.client.post(
            reverse("teacher_rank:rating-list"),
            {
                "teacher_id": self.teacher.pk,
                "vibe_score": 8,
                "easy_score": 6,
                "quality_score": 9,
                "comment": "Понятные объяснения",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        rating = Rating.objects.get()
        self.assertEqual(rating.vibe_score, 8)
        self.assertEqual(rating.easy_score, 6)
        self.assertEqual(rating.quality_score, 9)
        self.assertEqual(rating.person.name, "Оценивающий")

    def test_create_rating_updates_existing(self):
        """Повторная оценка того же преподавателя обновляет существующую."""
        person = Person.objects.create(name="Оценивающий")
        Rating.objects.create(
            person=person,
            teacher=self.teacher,
            vibe_score=5,
            easy_score=5,
            quality_score=5,
        )
        self._login_as(person)
        response = self.client.post(
            reverse("teacher_rank:rating-list"),
            {
                "teacher_id": self.teacher.pk,
                "vibe_score": 10,
                "easy_score": 10,
                "quality_score": 10,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rating.objects.count(), 1)
        rating = Rating.objects.get()
        self.assertEqual(rating.vibe_score, 10)

    def test_create_rating_requires_authentication(self):
        response = self.client.post(
            reverse("teacher_rank:rating-list"),
            {
                "teacher_id": self.teacher.pk,
                "vibe_score": 8,
                "easy_score": 6,
                "quality_score": 9,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_rating_invalid_scores(self):
        self._login("Оценивающий")
        response = self.client.post(
            reverse("teacher_rank:rating-list"),
            {
                "teacher_id": self.teacher.pk,
                "vibe_score": 11,  # MaxValidator is 10
                "easy_score": -1,  # MinValidator is 0
                "quality_score": 5,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_next_unrated_teacher(self):
        self._login("Оценивающий")
        response = self.client.get(reverse("teacher_rank:teacher-next-unrated"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["done"])
        self.assertEqual(response.data["teacher"]["id"], self.teacher.pk)

    def test_next_unrated_requires_authentication(self):
        response = self.client.get(reverse("teacher_rank:teacher-next-unrated"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_rankings_by_category(self):
        person = Person.objects.create(name="Оценивающий")
        Rating.objects.create(
            person=person,
            teacher=self.teacher,
            vibe_score=10,
            easy_score=5,
            quality_score=8,
        )
        response = self.client.get(
            reverse("teacher_rank:teacher-rankings"), {"category": "vibe"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["rank"], 1)
        self.assertEqual(response.data[0]["avg_vibe"], 10.0)

    def test_rankings_invalid_category(self):
        response = self.client.get(
            reverse("teacher_rank:teacher-rankings"), {"category": "invalid"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_teacher_ranking_detail(self):
        person = Person.objects.create(name="Оценивающий")
        Rating.objects.create(
            person=person,
            teacher=self.teacher,
            vibe_score=10,
            easy_score=5,
            quality_score=8,
        )
        response = self.client.get(
            reverse("teacher_rank:teacher-ranking", kwargs={"pk": self.teacher.pk})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ratings_count"], 1)

    def test_teacher_ranking_detail_unrated(self):
        """Преподаватель без оценок возвращает null-значения."""
        response = self.client.get(
            reverse("teacher_rank:teacher-ranking", kwargs={"pk": self.teacher.pk})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["avg_vibe"])
        self.assertEqual(response.data["ratings_count"], 0)

    def test_schema_and_docs_available(self):
        schema_response = self.client.get(reverse("schema"))
        self.assertEqual(schema_response.status_code, status.HTTP_200_OK)

        docs_response = self.client.get(reverse("swagger-ui"))
        self.assertEqual(docs_response.status_code, status.HTTP_200_OK)

        redoc_response = self.client.get(reverse("redoc"))
        self.assertEqual(redoc_response.status_code, status.HTTP_200_OK)

    def test_rating_update_restricted_to_owner(self):
        owner = Person.objects.create(name="Владелец")
        other = Person.objects.create(name="Другой")
        rating = Rating.objects.create(
            person=owner,
            teacher=self.teacher,
            vibe_score=5,
            easy_score=5,
            quality_score=5,
        )

        self._login_as(other)
        response = self.client.patch(
            reverse("teacher_rank:rating-detail", kwargs={"pk": rating.pk}),
            {"vibe_score": 10},
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_me_endpoint(self):
        self._login("Тестовый пользователь")
        response = self.client.get(reverse("teacher_rank:person-me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Тестовый пользователь")
