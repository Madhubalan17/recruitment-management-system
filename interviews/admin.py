from django.contrib import admin

from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin
from import_export.widgets import ForeignKeyWidget

from .models import Interview
from applications.models import Application

# ============================================================
# INTERVIEW RESOURCE
# ============================================================


class InterviewResource(resources.ModelResource):

    application = fields.Field(
        column_name="application",
        attribute="application",
        widget=ForeignKeyWidget(Application, field="id"),
    )

    class Meta:
        model = Interview

        fields = (
            "id",
            "application",
            "interview_type",
            "interview_date",
            "interview_time",
            "duration_minutes",
            "meeting_link",
            "location",
            "interviewer_name",
            "interviewer_email",
            "notes",
            "status",
            "created_at",
            "updated_at",
        )

        export_order = (
            "id",
            "application",
            "interview_type",
            "interview_date",
            "interview_time",
            "duration_minutes",
            "meeting_link",
            "location",
            "interviewer_name",
            "interviewer_email",
            "notes",
            "status",
            "created_at",
            "updated_at",
        )


# ============================================================
# INTERVIEW ADMIN
# ============================================================


@admin.register(Interview)
class InterviewAdmin(ImportExportModelAdmin):

    resource_class = InterviewResource

    # ========================================================
    # LIST DISPLAY
    # ========================================================

    list_display = [
        "id",
        "get_candidate",
        "get_job",
        "get_company",
        "interview_type",
        "interview_date",
        "interview_time",
        "duration_minutes",
        "interviewer_name",
        "interviewer_email",
        "status",
        "created_at",
    ]

    # ========================================================
    # FILTERS
    # ========================================================

    list_filter = [
        "interview_type",
        "status",
        "interview_date",
        "created_at",
    ]

    # ========================================================
    # SEARCH
    # ========================================================

    search_fields = [
        "application__candidate__username",
        "application__candidate__email",
        "application__job__title",
        "application__job__company__company_name",
        "interviewer_name",
        "interviewer_email",
        "notes",
    ]

    # ========================================================
    # ORDERING
    # ========================================================

    ordering = [
        "-interview_date",
        "-interview_time",
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

    date_hierarchy = "interview_date"

    # ========================================================
    # DISPLAY METHODS
    # ========================================================

    @admin.display(description="Candidate")
    def get_candidate(self, obj):
        return obj.application.candidate.username

    @admin.display(description="Job")
    def get_job(self, obj):
        return obj.application.job.title

    @admin.display(description="Company")
    def get_company(self, obj):
        return obj.application.job.company.company_name

    # ========================================================
    # FIELDSETS
    # ========================================================

    fieldsets = (
        ("Application", {"fields": ("application",)}),
        (
            "Interview Details",
            {
                "fields": (
                    "interview_type",
                    "interview_date",
                    "interview_time",
                    "duration_minutes",
                )
            },
        ),
        (
            "Online / In-Person Details",
            {
                "fields": (
                    "meeting_link",
                    "location",
                )
            },
        ),
        (
            "Interviewer",
            {
                "fields": (
                    "interviewer_name",
                    "interviewer_email",
                )
            },
        ),
        (
            "Additional Information",
            {
                "fields": (
                    "notes",
                    "status",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
