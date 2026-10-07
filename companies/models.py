from django.db import models

from accounts.models import User


class Company(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="company"
    )

    company_name = models.CharField(
        max_length=200
    )

    description = models.TextField(
        blank=True
    )

    logo = models.ImageField(
        upload_to="companies/",
        null=True,
        blank=True
    )

    website = models.URLField(
        blank=True
    )

    industry = models.CharField(
        max_length=100,
        blank=True
    )

    location = models.CharField(
        max_length=200
    )

    employee_count = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return self.company_name