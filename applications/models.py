from django.db import models
from django.core.validators import FileExtensionValidator

from accounts.models import User
from jobs.models import Job


class Application(models.Model):

    # ============================================================
    # APPLICATION STATUS
    # ============================================================

    class Status(models.TextChoices):

        APPLIED = "applied", "Applied"

        SHORTLISTED = "shortlisted", "Shortlisted"

        INTERVIEW = "interview", "Interview"

        SELECTED = "selected", "Selected"

        REJECTED = "rejected", "Rejected"

        WITHDRAWN = "withdrawn", "Withdrawn"

    # ============================================================
    # JOB
    # ============================================================

    job = models.ForeignKey(
        Job,
        on_delete=models.PROTECT,
        related_name="applications"
    )

    # ============================================================
    # CANDIDATE
    # ============================================================

    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="job_applications"
    )

    # ============================================================
    # RESUME
    # ============================================================

    resume = models.FileField(
        upload_to="resumes/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=[
                    "pdf",
                    "doc",
                    "docx"
                ]
            )
        ]
    )

    # ============================================================
    # COVER LETTER
    # ============================================================

    cover_letter = models.TextField(
        blank=True,
        null=True
    )

    # ============================================================
    # APPLICATION STATUS
    # ============================================================

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED
    )

    # ============================================================
    # EMPLOYER MESSAGE
    # ============================================================

    employer_message = models.TextField(
        blank=True,
        null=True
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    applied_at = models.DateTimeField(
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
            "-applied_at"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "job",
                    "candidate"
                ],
                name="unique_job_candidate_application"
            )
        ]

    # ============================================================
    # STRING
    # ============================================================

    def __str__(self):

        return (
            f"{self.candidate.username} - "
            f"{self.job.title}"
        )