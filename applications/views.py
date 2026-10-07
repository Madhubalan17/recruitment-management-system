from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.permissions import IsAuthenticated

from .models import Application
from .serializers import ApplicationSerializer

from jobs.models import Job


# ============================================================
# APPLY FOR JOB
#
# POST
# /api/applications/apply/
#
# CANDIDATE ONLY
# ============================================================

class ApplyJobView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        # --------------------------------------------------------
        # CHECK CANDIDATE
        # --------------------------------------------------------

        if request.user.role != "candidate":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only candidates can apply for jobs."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET JOB ID
        # --------------------------------------------------------

        job_id = request.data.get(
            "job"
        )

        if not job_id:

            return Response(
                {
                    "success": False,
                    "message":
                    "Job ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # GET JOB
        # --------------------------------------------------------

        try:

            job = Job.objects.select_related(
                "company",
                "employer"
            ).get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message":
                    "Job not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------------
        # CHECK ACTIVE
        # --------------------------------------------------------

        if job.status != "active":

            return Response(
                {
                    "success": False,
                    "message":
                    "This job is no longer active."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # CHECK DEADLINE
        # --------------------------------------------------------

        from django.utils import timezone

        if (
            job.application_deadline
            and
            job.application_deadline < timezone.localdate()
        ):

            return Response(
                {
                    "success": False,
                    "message":
                    "The application deadline has passed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # CHECK DUPLICATE APPLICATION
        # --------------------------------------------------------

        existing_application = Application.objects.filter(
            job=job,
            candidate=request.user
        ).first()

        if existing_application:

            return Response(
                {
                    "success": False,
                    "message":
                    "You have already applied for this job.",
                    "application_id":
                    existing_application.id
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # SERIALIZER
        # --------------------------------------------------------

        serializer = ApplicationSerializer(
            data=request.data
        )

        # --------------------------------------------------------
        # VALIDATE
        # --------------------------------------------------------

        if serializer.is_valid():

            application = serializer.save(
                candidate=request.user,
                job=job
            )

            return Response(
                {
                    "success": True,
                    "message":
                    "Job application submitted successfully.",
                    "data":
                    ApplicationSerializer(
                        application
                    ).data
                },
                status=status.HTTP_201_CREATED
            )

        # --------------------------------------------------------
        # VALIDATION ERROR
        # --------------------------------------------------------

        return Response(
            {
                "success": False,
                "message":
                "Application failed.",
                "errors":
                serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# MY APPLICATIONS
#
# GET
# /api/applications/my/
#
# CANDIDATE ONLY
# ============================================================

class MyApplicationsView(APIView):

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
                    "Only candidates can view their applications."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET APPLICATIONS
        # --------------------------------------------------------

        applications = Application.objects.filter(
            candidate=request.user
        ).select_related(
            "job",
            "job__company",
            "candidate"
        )

        # --------------------------------------------------------
        # SERIALIZE
        # --------------------------------------------------------

        serializer = ApplicationSerializer(
            applications,
            many=True
        )

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Applications fetched successfully.",
                "data":
                serializer.data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# APPLICATION DETAIL
#
# GET
# /api/applications/<application_id>/
#
# CANDIDATE / JOB OWNER
# ============================================================

class ApplicationDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        application_id
    ):

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
        # CHECK ACCESS
        # --------------------------------------------------------

        is_candidate = (
            application.candidate == request.user
        )

        is_employer = (
            application.job.employer == request.user
        )

        if not (
            is_candidate
            or
            is_employer
        ):

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to view this application."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # SERIALIZE
        # --------------------------------------------------------

        serializer = ApplicationSerializer(
            application
        )

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Application details fetched successfully.",
                "data":
                serializer.data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# WITHDRAW APPLICATION
#
# PATCH
# /api/applications/<application_id>/withdraw/
#
# CANDIDATE ONLY
# ============================================================

class WithdrawApplicationView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        application_id
    ):

        # --------------------------------------------------------
        # CHECK CANDIDATE
        # --------------------------------------------------------

        if request.user.role != "candidate":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only candidates can withdraw applications."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET APPLICATION
        # --------------------------------------------------------

        try:

            application = Application.objects.get(
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
        # CHECK OWNER
        # --------------------------------------------------------

        if application.candidate != request.user:

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to withdraw this application."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # CHECK CURRENT STATUS
        # --------------------------------------------------------

        if application.status in [
            "selected",
            "rejected",
            "withdrawn"
        ]:

            return Response(
                {
                    "success": False,
                    "message":
                    "This application cannot be withdrawn."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # UPDATE STATUS
        # --------------------------------------------------------

        application.status = (
            Application.Status.WITHDRAWN
        )

        application.save()

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Application withdrawn successfully.",
                "data":
                ApplicationSerializer(
                    application
                ).data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# EMPLOYER APPLICATIONS
#
# GET
# /api/applications/job/<job_id>/
#
# EMPLOYER ONLY
# ============================================================

class JobApplicationsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        job_id
    ):

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        if request.user.role != "employer":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only employers can view job applicants."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET JOB
        # --------------------------------------------------------

        try:

            job = Job.objects.get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message":
                    "Job not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------------------------------
        # CHECK JOB OWNER
        # --------------------------------------------------------

        if job.employer != request.user:

            return Response(
                {
                    "success": False,
                    "message":
                    "You are not allowed to view applicants for this job."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET APPLICATIONS
        # --------------------------------------------------------

        applications = Application.objects.filter(
            job=job
        ).select_related(
            "candidate",
            "job",
            "job__company"
        )

        # --------------------------------------------------------
        # SERIALIZE
        # --------------------------------------------------------

        serializer = ApplicationSerializer(
            applications,
            many=True
        )

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Job applicants fetched successfully.",
                "job_id":
                job.id,
                "job_title":
                job.title,
                "total_applications":
                applications.count(),
                "data":
                serializer.data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# UPDATE APPLICATION STATUS
#
# PATCH
# /api/applications/<application_id>/status/
#
# EMPLOYER ONLY
# ============================================================

class UpdateApplicationStatusView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        application_id
    ):

        # --------------------------------------------------------
        # CHECK EMPLOYER
        # --------------------------------------------------------

        if request.user.role != "employer":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only employers can update application status."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------------------------------
        # GET APPLICATION
        # --------------------------------------------------------

        try:

            application = Application.objects.select_related(
                "job",
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
                    "You are not allowed to update this application."
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
                    "Status is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # VALID STATUS
        # --------------------------------------------------------

        valid_statuses = [
            "applied",
            "shortlisted",
            "interview",
            "selected",
            "rejected",
        ]

        if new_status not in valid_statuses:

            return Response(
                {
                    "success": False,
                    "message":
                    "Invalid application status.",
                    "allowed_statuses":
                    valid_statuses
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------------
        # UPDATE STATUS
        # --------------------------------------------------------

        application.status = new_status

        # --------------------------------------------------------
        # EMPLOYER MESSAGE
        # --------------------------------------------------------

        employer_message = request.data.get(
            "employer_message"
        )

        if employer_message is not None:

            application.employer_message = (
                employer_message
            )

        application.save()

        # --------------------------------------------------------
        # RESPONSE
        # --------------------------------------------------------

        return Response(
            {
                "success": True,
                "message":
                "Application status updated successfully.",
                "data":
                ApplicationSerializer(
                    application
                ).data
            },
            status=status.HTTP_200_OK
        )