from django.contrib import admin

from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin
from import_export.widgets import ForeignKeyWidget

from .models import Application
from accounts.models import User
from jobs.models import Job

# ============================================================
# APPLICATION RESOURCE
# ============================================================


class ApplicationResource(resources.ModelResource):

    job = fields.Field(
        column_name="job", attribute="job", widget=ForeignKeyWidget(Job, field="id")
    )

    candidate = fields.Field(
        column_name="candidate",
        attribute="candidate",
        widget=ForeignKeyWidget(User, field="username"),
    )

    class Meta:
        model = Application

        fields = (
            "id",
            "job",
            "candidate",
            "resume",
            "cover_letter",
            "status",
            "employer_message",
            "applied_at",
            "updated_at",
        )

        export_order = (
            "id",
            "job",
            "candidate",
            "resume",
            "cover_letter",
            "status",
            "employer_message",
            "applied_at",
            "updated_at",
        )


# ============================================================
# APPLICATION ADMIN
# ============================================================


@admin.register(Application)
class ApplicationAdmin(ImportExportModelAdmin):

    resource_class = ApplicationResource

    # ========================================================
    # LIST DISPLAY
    # ========================================================

    list_display = [
        "id",
        "candidate",
        "job",
        "get_company",
        "status",
        "applied_at",
        "updated_at",
    ]

    # ========================================================
    # FILTERS
    # ========================================================

    list_filter = [
        "status",
        "applied_at",
        "updated_at",
    ]

    # ========================================================
    # SEARCH
    # ========================================================

    search_fields = [
        "candidate__username",
        "candidate__email",
        "job__title",
        "job__company__company_name",
        "cover_letter",
        "employer_message",
    ]

    # ========================================================
    # ORDERING
    # ========================================================

    ordering = ["-applied_at"]

    # ========================================================
    # READ ONLY
    # ========================================================

    readonly_fields = [
        "applied_at",
        "updated_at",
    ]

    # ========================================================
    # PAGINATION
    # ========================================================

    list_per_page = 20

    # ========================================================
    # DATE HIERARCHY
    # ========================================================

    date_hierarchy = "applied_at"

    # ========================================================
    # COMPANY
    # ========================================================

    @admin.display(description="Company")
    def get_company(self, obj):
        return obj.job.company.company_name

    # ========================================================
    # FIELDSETS
    # ========================================================

    fieldsets = (
        (
            "Application Information",
            {
                "fields": (
                    "job",
                    "candidate",
                    "resume",
                    "cover_letter",
                )
            },
        ),
        (
            "Application Status",
            {
                "fields": (
                    "status",
                    "employer_message",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "applied_at",
                    "updated_at",
                )
            },
        ),
    )
