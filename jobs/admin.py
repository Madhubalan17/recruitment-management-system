from django.contrib import admin

from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin
from import_export.widgets import ForeignKeyWidget

from .models import Job
from accounts.models import User
from companies.models import Company


# ============================================================
# JOB RESOURCE
# ============================================================

class JobResource(resources.ModelResource):

    company = fields.Field(
        column_name="company",
        attribute="company",
        widget=ForeignKeyWidget(
            Company,
            field="company_name"
        )
    )

    employer = fields.Field(
        column_name="employer",
        attribute="employer",
        widget=ForeignKeyWidget(
            User,
            field="username"
        )
    )

    class Meta:
        model = Job

        fields = (
            "id",
            "title",
            "description",
            "skills",
            "location",
            "experience_level",
            "min_salary",
            "max_salary",
            "job_type",
            "openings",
            "application_deadline",
            "status",
            "company",
            "employer",
            "created_at",
            "updated_at",
        )

        export_order = (
            "id",
            "title",
            "description",
            "skills",
            "location",
            "experience_level",
            "min_salary",
            "max_salary",
            "job_type",
            "openings",
            "application_deadline",
            "status",
            "company",
            "employer",
            "created_at",
            "updated_at",
        )


# ============================================================
# JOB ADMIN
# ============================================================

@admin.register(Job)
class JobAdmin(ImportExportModelAdmin):

    resource_class = JobResource

    # ========================================================
    # LIST DISPLAY
    # ========================================================

    list_display = [
        "id",
        "title",
        "company",
        "employer",
        "location",
        "experience_level",
        "job_type",
        "openings",
        "min_salary",
        "max_salary",
        "application_deadline",
        "status",
        "created_at",
        "updated_at",
    ]

    # ========================================================
    # FILTERS
    # ========================================================

    list_filter = [
        "status",
        "job_type",
        "experience_level",
        "location",
        "application_deadline",
        "created_at",
    ]

    # ========================================================
    # SEARCH
    # ========================================================

    search_fields = [
        "title",
        "description",
        "skills",
        "location",
        "company__company_name",
        "employer__username",
        "employer__email",
    ]

    # ========================================================
    # ORDERING
    # ========================================================

    ordering = [
        "-created_at"
    ]

    # ========================================================
    # READ ONLY
    # ========================================================

    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    # ========================================================
    # PAGINATION
    # ========================================================

    list_per_page = 20

    # ========================================================
    # DATE HIERARCHY
    # ========================================================

    date_hierarchy = "created_at"

    # ========================================================
    # FIELDSETS
    # ========================================================

    fieldsets = (

        (
            "Job Information",
            {
                "fields": (
                    "title",
                    "description",
                    "skills",
                    "location",
                )
            }
        ),

        (
            "Company & Employer",
            {
                "fields": (
                    "company",
                    "employer",
                )
            }
        ),

        (
            "Experience & Job Type",
            {
                "fields": (
                    "experience_level",
                    "job_type",
                )
            }
        ),

        (
            "Salary & Openings",
            {
                "fields": (
                    "min_salary",
                    "max_salary",
                    "openings",
                )
            }
        ),

        (
            "Application",
            {
                "fields": (
                    "application_deadline",
                    "status",
                )
            }
        ),

        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            }
        ),
    )