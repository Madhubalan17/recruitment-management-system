from django.db import models

from applications.models import Application


class Interview(models.Model):

    # ============================================================
    # INTERVIEW TYPE
    # ============================================================

    class InterviewType(models.TextChoices):

        ONLINE = "online", "Online"

        PHONE = "phone", "Phone"

        IN_PERSON = "in_person", "In Person"

    # ============================================================
    # INTERVIEW STATUS
    # ============================================================

    class Status(models.TextChoices):

        SCHEDULED = "scheduled", "Scheduled"

        COMPLETED = "completed", "Completed"

        CANCELLED = "cancelled", "Cancelled"

        RESCHEDULED = "rescheduled", "Rescheduled"

        NO_SHOW = "no_show", "No Show"

    # ============================================================
    # APPLICATION
    # ============================================================

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="interviews"
    )

    # ============================================================
    # INTERVIEW TYPE
    # ============================================================

    interview_type = models.CharField(
        max_length=20,
        choices=InterviewType.choices,
        default=InterviewType.ONLINE
    )

    # ============================================================
    # INTERVIEW DATE
    # ============================================================

    interview_date = models.DateField()

    # ============================================================
    # INTERVIEW TIME
    # ============================================================

    interview_time = models.TimeField()

    # ============================================================
    # DURATION
    # ============================================================

    duration_minutes = models.PositiveIntegerField(
        default=30
    )

    # ============================================================
    # MEETING LINK
    # ============================================================

    meeting_link = models.URLField(
        blank=True,
        null=True
    )

    # ============================================================
    # LOCATION
    # ============================================================

    location = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    # ============================================================
    # INTERVIEWER NAME
    # ============================================================

    interviewer_name = models.CharField(
        max_length=150
    )

    # ============================================================
    # INTERVIEWER EMAIL
    # ============================================================

    interviewer_email = models.EmailField(
        blank=True,
        null=True
    )

    # ============================================================
    # NOTES
    # ============================================================

    notes = models.TextField(
        blank=True,
        null=True
    )

    # ============================================================
    # STATUS
    # ============================================================

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # ============================================================
    # META
    # ============================================================

    class Meta:

        ordering = [
            "-interview_date",
            "-interview_time"
        ]

    # ============================================================
    # STRING
    # ============================================================

    def __str__(self):

        return (
            f"{self.application.candidate.username} - "
            f"{self.application.job.title} - "
            f"{self.interview_date}"
        )