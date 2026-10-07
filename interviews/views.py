from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.permissions import IsAuthenticated

from .models import Interview
from .serializers import InterviewSerializer

from applications.models import Application


# ============================================================
# SCHEDULE INTERVIEW
#
# POST
# /api/interviews/create/
#
# EMPLOYER ONLY
# ============================================================

class InterviewCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        if request.user.role != "employer":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only employers can schedule interviews."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET APPLICATION ID
        # --------------------------------------------------------

        application_id = request.data.get(
            "application"
        )

        if not application_id:

            return Response(
                {
                    "success": False,
                    "message":
                    "Application ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # GET APPLICATION
        # --------------------------------------------------------

        try:

            application = Application.objects.select_related(
                "job",
                "job__company",
                "job__employer",
                "candidate"
            ).get(
                id=application_id
            )

        except Application.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message":
                    "Application not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------------
        # CHECK JOB OWNER
        # --------------------------------------------------------

        if application.job.employer != request.user:

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to schedule an interview for this application."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # CHECK APPLICATION STATUS
        # --------------------------------------------------------

        if application.status in [
            "rejected",
            "withdrawn"
        ]:

            return Response(
                {
                    "success": False,
                    "message":
                    "Interview cannot be scheduled for this application."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # CHECK EXISTING ACTIVE INTERVIEW
        # --------------------------------------------------------

        existing_interview = Interview.objects.filter(
            application=application,
            status__in=[
                "scheduled",
                "rescheduled"
            ]
        ).first()

        if existing_interview:

            return Response(
                {
                    "success": False,
                    "message":
                    "An active interview already exists for this application.",
                    "interview_id":
                    existing_interview.id
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # SERIALIZER
        # --------------------------------------------------------

        serializer = InterviewSerializer(
            data=request.data
        )

        # --------------------------------------------------------
        # VALIDATE
        # --------------------------------------------------------

        if serializer.is_valid():

            interview = serializer.save(
                application=application
            )

            # ----------------------------------------------------
            # UPDATE APPLICATION STATUS
            # ----------------------------------------------------

            application.status = "interview"

            application.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "success": True,
                    "message":
                    "Interview scheduled successfully.",
                    "data":
                    InterviewSerializer(
                        interview
                    ).data
                },
                status=status.HTTP_201_CREATED
            )

        # --------------------------------------------------------
        # ERROR
        # --------------------------------------------------------

        return Response(
            {
                "success": False,
                "message":
                "Interview scheduling failed.",
                "errors":
                serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# MY INTERVIEWS
#
# GET
# /api/interviews/my/
#
# CANDIDATE ONLY
# ============================================================

class MyInterviewsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        # --------------------------------------------------------
        # CHECK CANDIDATE
        # --------------------------------------------------------

        if request.user.role != "candidate":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only candidates can view their interviews."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET INTERVIEWS
        # --------------------------------------------------------

        interviews = Interview.objects.filter(
            application__candidate=request.user
        ).select_related(
            "application",
            "application__job",
            "application__job__company",
            "application__candidate"
        )

        # --------------------------------------------------------
        # SERIALIZER
        # --------------------------------------------------------

        serializer = InterviewSerializer(
            interviews,
            many=True
        )

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Interviews fetched successfully.",
                "data":
                serializer.data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# EMPLOYER INTERVIEWS
#
# GET
# /api/interviews/employer/
#
# EMPLOYER ONLY
# ============================================================

class EmployerInterviewsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        if request.user.role != "employer":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only employers can view their interviews."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET INTERVIEWS
        # --------------------------------------------------------

        interviews = Interview.objects.filter(
            application__job__employer=request.user
        ).select_related(
            "application",
            "application__job",
            "application__job__company",
            "application__candidate"
        )

        # --------------------------------------------------------
        # SERIALIZE
        # --------------------------------------------------------

        serializer = InterviewSerializer(
            interviews,
            many=True
        )

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Employer interviews fetched successfully.",
                "data":
                serializer.data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# INTERVIEW DETAIL
#
# GET
# /api/interviews/<interview_id>/
#
# CANDIDATE OR EMPLOYER
# ============================================================

class InterviewDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        interview_id
    ):

        # --------------------------------------------------------
        # GET INTERVIEW
        # --------------------------------------------------------

        try:

            interview = Interview.objects.select_related(
                "application",
                "application__candidate",
                "application__job",
                "application__job__company",
                "application__job__employer"
            ).get(
                id=interview_id
            )

        except Interview.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message":
                    "Interview not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------------
        # CHECK CANDIDATE
        # --------------------------------------------------------

        is_candidate = (
            interview.application.candidate
            == request.user
        )

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        is_employer = (
            interview.application.job.employer
            == request.user
        )

        # --------------------------------------------------------
        # ACCESS CONTROL
        # --------------------------------------------------------

        if not (
            is_candidate
            or
            is_employer
        ):

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to view this interview."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # SERIALIZER
        # --------------------------------------------------------

        serializer = InterviewSerializer(
            interview
        )

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Interview details fetched successfully.",
                "data":
                serializer.data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# UPDATE INTERVIEW
#
# PUT
# /api/interviews/<interview_id>/update/
#
# EMPLOYER ONLY
# ============================================================

class InterviewUpdateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def put(
        self,
        request,
        interview_id
    ):

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        if request.user.role != "employer":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only employers can update interviews."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET INTERVIEW
        # --------------------------------------------------------

        try:

            interview = Interview.objects.select_related(
                "application",
                "application__job"
            ).get(
                id=interview_id
            )

        except Interview.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message":
                    "Interview not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------------
        # CHECK OWNER
        # --------------------------------------------------------

        if interview.application.job.employer != request.user:

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to update this interview."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # CHECK CANCELLED
        # --------------------------------------------------------

        if interview.status == "cancelled":

            return Response(
                {
                    "success": False,
                    "message":
                    "A cancelled interview cannot be updated."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # SERIALIZER
        # --------------------------------------------------------

        serializer = InterviewSerializer(
            interview,
            data=request.data
        )

        # --------------------------------------------------------
        # VALIDATE
        # --------------------------------------------------------

        if serializer.is_valid():

            updated_interview = serializer.save()

            return Response(
                {
                    "success": True,
                    "message":
                    "Interview updated successfully.",
                    "data":
                    InterviewSerializer(
                        updated_interview
                    ).data
                },
                status=status.HTTP_200_OK
            )

        # --------------------------------------------------------
        # ERROR
        # --------------------------------------------------------

        return Response(
            {
                "success": False,
                "message":
                "Interview update failed.",
                "errors":
                serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# UPDATE INTERVIEW STATUS
#
# PATCH
# /api/interviews/<interview_id>/status/
#
# EMPLOYER ONLY
# ============================================================

class InterviewStatusUpdateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        interview_id
    ):

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        if request.user.role != "employer":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only employers can update interview status."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET INTERVIEW
        # --------------------------------------------------------

        try:

            interview = Interview.objects.select_related(
                "application",
                "application__job"
            ).get(
                id=interview_id
            )

        except Interview.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message":
                    "Interview not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------------
        # CHECK OWNER
        # --------------------------------------------------------

        if interview.application.job.employer != request.user:

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to update this interview."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET STATUS
        # --------------------------------------------------------

        new_status = request.data.get(
            "status"
        )

        if not new_status:

            return Response(
                {
                    "success": False,
                    "message":
                    "Interview status is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # VALID STATUS
        # --------------------------------------------------------

        valid_statuses = [
            "scheduled",
            "completed",
            "cancelled",
            "rescheduled",
            "no_show",
        ]

        if new_status not in valid_statuses:

            return Response(
                {
                    "success": False,
                    "message":
                    "Invalid interview status.",
                    "allowed_statuses":
                    valid_statuses
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # UPDATE
        # --------------------------------------------------------

        interview.status = new_status

        interview.save()

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Interview status updated successfully.",
                "data":
                InterviewSerializer(
                    interview
                ).data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# CANCEL INTERVIEW
#
# PATCH
# /api/interviews/<interview_id>/cancel/
#
# EMPLOYER ONLY
# ============================================================

class InterviewCancelView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        interview_id
    ):

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        if request.user.role != "employer":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only employers can cancel interviews."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET INTERVIEW
        # --------------------------------------------------------

        try:

            interview = Interview.objects.select_related(
                "application",
                "application__job"
            ).get(
                id=interview_id
            )

        except Interview.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message":
                    "Interview not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------------
        # CHECK OWNER
        # --------------------------------------------------------

        if interview.application.job.employer != request.user:

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to cancel this interview."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # CHECK ALREADY CANCELLED
        # --------------------------------------------------------

        if interview.status == "cancelled":

            return Response(
                {
                    "success": False,
                    "message":
                    "Interview is already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # CANCEL
        # --------------------------------------------------------

        interview.status = (
            Interview.Status.CANCELLED
        )

        interview.save()

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Interview cancelled successfully.",
                "data":
                InterviewSerializer(
                    interview
                ).data
            },
            status=status.HTTP_200_OK
        )