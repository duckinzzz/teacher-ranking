from rest_framework.authentication import BaseAuthentication

try:
    from drf_spectacular.extensions import OpenApiAuthenticationExtension
except ImportError:  # pragma: no cover
    OpenApiAuthenticationExtension = None

from .models import Person

SESSION_PERSON_KEY = "person_id"


class PersonAuthentication(BaseAuthentication):
    """Аутентификация по кастомной сессии person_id."""

    def authenticate(self, request):
        person_id = request.session.get(SESSION_PERSON_KEY)
        if not person_id:
            return None
        try:
            person = Person.objects.get(pk=person_id)
        except Person.DoesNotExist:
            return None
        return (person, None)


if OpenApiAuthenticationExtension is not None:

    class PersonAuthenticationScheme(OpenApiAuthenticationExtension):
        target_class = "teacher_rank.authentication.PersonAuthentication"
        name = "PersonSessionAuth"

        def get_security_definition(self, auto_schema):
            return {
                "type": "apiKey",
                "in": "cookie",
                "name": "sessionid",
                "description": (
                    "Аутентификация через сессию. "
                    "Сначала выполните POST /api/persons/login/."
                ),
            }
