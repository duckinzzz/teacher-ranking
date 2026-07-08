from rest_framework.routers import DefaultRouter

from .views import (
    CourseViewSet,
    PersonViewSet,
    RatingViewSet,
    SubjectViewSet,
    TeacherAssignmentViewSet,
    TeacherViewSet,
)

app_name = "teacher_rank"

router = DefaultRouter()
router.register(r"teachers", TeacherViewSet)
router.register(r"subjects", SubjectViewSet)
router.register(r"courses", CourseViewSet)
router.register(r"assignments", TeacherAssignmentViewSet)
router.register(r"persons", PersonViewSet)
router.register(r"ratings", RatingViewSet)

urlpatterns = router.urls
