from django.utils import timezone

from rest_framework import serializers

from .models import Application


class ApplicationSerializer(
    serializers.ModelSerializer
):

    # ============================================================
    # JOB TITLE
    # ============================================================

    job_title = serializers.CharField(
        source="job.title",
        read_only=True
    )

    # ============================================================
    # COMPANY NAME
    # ============================================================

    company_name = serializers.CharField(
        source="job.company.company_name",
        read_only=True
    )

    # ============================================================
    # CANDIDATE NAME
    # ============================================================

    candidate_name = serializers.CharField(
        source="candidate.username",
        read_only=True
    )

    # ============================================================
    # CANDIDATE EMAIL
    # ============================================================

    candidate_email = serializers.EmailField(
        source="candidate.email",
        read_only=True
    )

    # ============================================================
    # JOB LOCATION
    # ============================================================

    job_location = serializers.CharField(
        source="job.location",
        read_only=True
    )

    class Meta:

        model = Application

        fields = [
            "id",

            "job",
            "job_title",
            "company_name",
            "job_location",

            "candidate",
            "candidate_name",
            "candidate_email",

            "resume",
            "cover_letter",

            "status",

            "employer_message",

            "applied_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",

            "candidate",

            "candidate_name",
            "candidate_email",

            "job_title",
            "company_name",
            "job_location",

            "status",

            "employer_message",

            "applied_at",
            "updated_at",
        ]

    # ============================================================
    # VALIDATE JOB
    # ============================================================

    def validate_job(self, job):

        # --------------------------------------------------------
        # CHECK JOB STATUS
        # --------------------------------------------------------

        if job.status != "active":

            raise serializers.ValidationError(
                "This job is no longer active."
            )

        # --------------------------------------------------------
        # CHECK APPLICATION DEADLINE
        # --------------------------------------------------------

        if (
            job.application_deadline
            and
            job.application_deadline < timezone.localdate()
        ):

            raise serializers.ValidationError(
                "The application deadline has passed."
            )

        # --------------------------------------------------------
        # CHECK OPENINGS
        # --------------------------------------------------------

        if job.openings <= 0:

            raise serializers.ValidationError(
                "No openings are currently available."
            )

        return job