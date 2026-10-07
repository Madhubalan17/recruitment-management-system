from django.contrib import admin

from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin
from import_export.widgets import ForeignKeyWidget

from .models import Company
from accounts.models import User

# ============================================================
# COMPANY RESOURCE
# ============================================================


class CompanyResource(resources.ModelResource):

    user = fields.Field(
        column_name="user",
        attribute="user",
        widget=ForeignKeyWidget(User, field="username"),
    )

    class Meta:
        model = Company

        fields = (
            "id",
            "user",
            "company_name",
            "description",
            "logo",
            "website",
            "industry",
            "location",
            "employee_count",
            "created_at",
            "updated_at",
        )

        export_order = (
            "id",
            "user",
            "company_name",
            "description",
            "logo",
            "website",
            "industry",
            "location",
            "employee_count",
            "created_at",
            "updated_at",
        )


# ============================================================
# COMPANY ADMIN
# ============================================================


@admin.register(Company)
class CompanyAdmin(ImportExportModelAdmin):

    resource_class = CompanyResource

    list_display = [
        "id",
        "company_name",
        "user",
        "industry",
        "location",
        "employee_count",
        "website",
        "created_at",
        "updated_at",
    ]

    list_filter = [
        "industry",
        "location",
        "created_at",
    ]

    search_fields = [
        "company_name",
        "description",
        "industry",
        "location",
        "website",
        "user__username",
        "user__email",
    ]

    ordering = ["-created_at"]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    list_per_page = 20

    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Company Information",
            {
                "fields": (
                    "company_name",
                    "description",
                    "logo",
                    "website",
                )
            },
        ),
        (
            "Business Details",
            {
                "fields": (
                    "industry",
                    "location",
                    "employee_count",
                )
            },
        ),
        ("Employer", {"fields": ("user",)}),
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
