from django.db import models

from accounts.models import User
from companies.models import Company


class Job(models.Model):

    class JobType(models.TextChoices):

        FULL_TIME = "full_time", "Full Time"
        PART_TIME = "part_time", "Part Time"
        INTERNSHIP = "internship", "Internship"
        CONTRACT = "contract", "Contract"


    class ExperienceLevel(models.TextChoices):

        FRESHER = "fresher", "Fresher"
        JUNIOR = "junior", "0-2 Years"
        MID = "mid", "2-5 Years"
        SENIOR = "senior", "5+ Years"


    class Status(models.TextChoices):

        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"


    # ========================================================
    # EMPLOYER
    # ========================================================

    employer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posted_jobs"
    )


    # ========================================================
    # COMPANY
    # ========================================================

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="jobs"
    )


    # ========================================================
    # JOB INFORMATION
    # ========================================================

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()


    # ========================================================
    # SKILLS
    # ========================================================

    skills = models.TextField(
        help_text="Example: Python, Django, MySQL, REST API"
    )


    # ========================================================
    # LOCATION
    # ========================================================

    location = models.CharField(
        max_length=200
    )


    # ========================================================
    # EXPERIENCE
    # ========================================================

    experience_level = models.CharField(
        max_length=20,
        choices=ExperienceLevel.choices,
        default=ExperienceLevel.FRESHER
    )


    # ========================================================
    # SALARY
    # ========================================================

    min_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    max_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )


    # ========================================================
    # JOB TYPE
    # ========================================================

    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.FULL_TIME
    )


    # ========================================================
    # OPENINGS
    # ========================================================

    openings = models.PositiveIntegerField(
        default=1
    )


    # ========================================================
    # DEADLINE
    # ========================================================

    application_deadline = models.DateField(
        null=True,
        blank=True
    )


    # ========================================================
    # STATUS
    # ========================================================

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )


    # ========================================================
    # TIMESTAMPS
    # ========================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return self.title