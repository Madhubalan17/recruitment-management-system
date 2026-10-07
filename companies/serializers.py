from rest_framework import serializers

from .models import Company


class CompanySerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Company

        fields = [
            "id",
            "company_name",
            "description",
            "logo",
            "website",
            "industry",
            "location",
            "employee_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]