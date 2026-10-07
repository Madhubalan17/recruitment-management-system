from django.utils import timezone

from rest_framework import serializers

from .models import Interview


class InterviewSerializer(
    serializers.ModelSerializer
):

    # ============================================================
    # APPLICATION ID
    # ============================================================

    application_id = serializers.IntegerField(
        source="application.id",
        read_only=True
    )

    # ============================================================
    # JOB TITLE
    # ============================================================

    job_title = serializers.CharField(
        source="application.job.title",
        read_only=True
    )

    # ============================================================
    # COMPANY NAME
    # ============================================================

    company_name = serializers.CharField(
        source="application.job.company.company_name",
        read_only=True
    )

    # ============================================================
    # CANDIDATE NAME
    # ============================================================

    candidate_name = serializers.CharField(
        source="application.candidate.username",
        read_only=True
    )

    # ============================================================
    # CANDIDATE EMAIL
    # ============================================================

    candidate_email = serializers.EmailField(
        source="application.candidate.email",
        read_only=True
    )

    class Meta:

        model = Interview

        fields = [

            "id",

            "application",
            "application_id",

            "job_title",
            "company_name",

            "candidate_name",
            "candidate_email",

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
        ]

        read_only_fields = [

            "id",

            "application_id",

            "job_title",
            "company_name",

            "candidate_name",
            "candidate_email",

            "created_at",
            "updated_at",
        ]

    # ============================================================
    # VALIDATION
    # ============================================================

    def validate(self, data):

        interview_type = data.get(
            "interview_type"
        )

        meeting_link = data.get(
            "meeting_link"
        )

        location = data.get(
            "location"
        )

        interview_date = data.get(
            "interview_date"
        )

        interview_time = data.get(
            "interview_time"
        )

        duration = data.get(
            "duration_minutes"
        )

        # --------------------------------------------------------
        # ONLINE VALIDATION
        # --------------------------------------------------------

        if interview_type == "online":

            if not meeting_link:

                raise serializers.ValidationError(
                    {
                        "meeting_link":
                        "Meeting link is required for online interviews."
                    }
                )

        # --------------------------------------------------------
        # IN-PERSON VALIDATION
        # --------------------------------------------------------

        if interview_type == "in_person":

            if not location:

                raise serializers.ValidationError(
                    {
                        "location":
                        "Location is required for in-person interviews."
                    }
                )

        # --------------------------------------------------------
        # DURATION
        # --------------------------------------------------------

        if duration is not None:

            if duration <= 0:

                raise serializers.ValidationError(
                    {
                        "duration_minutes":
                        "Interview duration must be greater than 0."
                    }
                )

            if duration > 480:

                raise serializers.ValidationError(
                    {
                        "duration_minutes":
                        "Interview duration cannot exceed 480 minutes."
                    }
                )

        # --------------------------------------------------------
        # DATE / TIME
        # --------------------------------------------------------

        if interview_date and interview_time:

            interview_datetime = timezone.make_aware(
                timezone.datetime.combine(
                    interview_date,
                    interview_time
                )
            )

            if interview_datetime <= timezone.now():

                raise serializers.ValidationError(
                    {
                        "interview_date":
                        "Interview date and time must be in the future."
                    }
                )

        return data