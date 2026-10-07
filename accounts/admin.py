from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from .models import User

# ============================================================
# USER RESOURCE
# ============================================================


class UserResource(resources.ModelResource):

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
            "phone",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "created_at",
            "updated_at",
        )

        export_order = (
            "id",
            "username",
            "email",
            "phone",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "created_at",
            "updated_at",
        )


# ============================================================
# USER ADMIN
# ============================================================


@admin.register(User)
class CustomUserAdmin(ImportExportModelAdmin, UserAdmin):

    resource_class = UserResource

    # ========================================================
    # LIST DISPLAY
    # ========================================================

    list_display = [
        "id",
        "username",
        "email",
        "phone",
        "role",
        "is_active",
        "is_staff",
        "created_at",
    ]

    # ========================================================
    # FILTERS
    # ========================================================

    list_filter = [
        "role",
        "is_active",
        "is_staff",
        "is_superuser",
        "created_at",
    ]

    # ========================================================
    # SEARCH
    # ========================================================

    search_fields = [
        "username",
        "email",
        "phone",
        "first_name",
        "last_name",
    ]

    # ========================================================
    # ORDERING
    # ========================================================

    ordering = ["-created_at"]

    # ========================================================
    # READ ONLY
    # ========================================================

    readonly_fields = [
        "created_at",
        "updated_at",
        "last_login",
        "date_joined",
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
            "Login Information",
            {
                "fields": (
                    "username",
                    "password",
                )
            },
        ),
        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "phone",
                    "profile_image",
                )
            },
        ),
        ("Role", {"fields": ("role",)}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
