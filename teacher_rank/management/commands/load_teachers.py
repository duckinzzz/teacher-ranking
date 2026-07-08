import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from teacher_rank.models import Teacher, Subject, Course, TeacherAssignment

REQUIRED_COLUMNS = ("Курс", "Предмет", "Преподаватель")


class Command(BaseCommand):
    help = "Загружает преподавателей, предметы и курсы из CSV-файла"

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_path",
            type=str,
            nargs="?",
            default="data.csv",
            help="Путь к CSV-файлу (по умолчанию data.csv)",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["csv_path"])
        if not csv_path.exists():
            raise CommandError(f"Файл {csv_path} не найден")

        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            if reader.fieldnames is None:
                raise CommandError("CSV-файл пуст или не содержит заголовков")

            missing = [col for col in REQUIRED_COLUMNS if col not in reader.fieldnames]
            if missing:
                raise CommandError(
                    f"В CSV отсутствуют обязательные колонки: {', '.join(missing)}. "
                    f"Ожидаются: {', '.join(REQUIRED_COLUMNS)}"
                )

            created_count = 0
            skipped_count = 0
            error_count = 0

            for row_num, row in enumerate(reader, start=2):  # start=2: row 1 is header
                try:
                    course_num = int(row["Курс"])
                except (KeyError, ValueError) as exc:
                    self.stderr.write(
                        self.style.WARNING(
                            f"Строка {row_num}: некорректное значение курса — "
                            f"{row.get('Курс', '<отсутствует>')!r} ({exc})"
                        )
                    )
                    error_count += 1
                    continue

                subject_name = row.get("Предмет", "").strip()
                teacher_name = row.get("Преподаватель", "").strip()

                if not subject_name or not teacher_name:
                    self.stderr.write(
                        self.style.WARNING(
                            f"Строка {row_num}: пустое название предмета или имя "
                            f"преподавателя — предмет={subject_name!r}, "
                            f"преподаватель={teacher_name!r}"
                        )
                    )
                    error_count += 1
                    continue

                course, _ = Course.objects.get_or_create(number=course_num)
                subject, _ = Subject.objects.get_or_create(name=subject_name)
                teacher, _ = Teacher.objects.get_or_create(full_name=teacher_name)

                _, was_created = TeacherAssignment.objects.get_or_create(
                    teacher=teacher,
                    subject=subject,
                    course=course,
                )
                if was_created:
                    created_count += 1
                else:
                    skipped_count += 1

            summary = (
                f"Загружено: {created_count} предметов, "
                f"пропущено (уже есть): {skipped_count}"
            )
            if error_count:
                summary += f", ошибок: {error_count}"
                self.stdout.write(self.style.WARNING(summary))
            else:
                self.stdout.write(self.style.SUCCESS(summary))
