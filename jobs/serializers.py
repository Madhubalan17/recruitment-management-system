from rest_framework import serializers

from .models import Job


class JobSerializer(serializers.ModelSerializer):

    company_name = serializers.CharField(
        source="company.company_name",
        read_only=True
    )

    employer_name = serializers.CharField(
        source="employer.username",
        read_only=True
    )


    class Meta:

        model = Job

        fields = [

            "id",

            "company",

            "company_name",

            "employer",

            "employer_name",

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

            "created_at",

            "updated_at",
        ]

        read_only_fields = [

            "id",

            "employer",

            "company_name",

            "employer_name",

            "created_at",

            "updated_at",

        ]


    def validate(self, data):

        min_salary = data.get(
            "min_salary"
        )

        max_salary = data.get(
            "max_salary"
        )


        if (
            min_salary is not None
            and max_salary is not None
            and min_salary > max_salary
        ):

            raise serializers.ValidationError({

                "salary":
                "Minimum salary cannot be greater than maximum salary."

            })


        return data