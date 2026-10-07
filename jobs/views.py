from django.db.models import Q

from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)

from .models import Job

from .serializers import JobSerializer

from companies.models import Company


# ============================================================
# CREATE JOB
# POST
# /api/jobs/create/
# ============================================================

class JobCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def post(self, request):

        if request.user.role != "employer":

            return Response({

                "success": False,

                "message":
                "Only employers can create jobs."

            }, status=status.HTTP_403_FORBIDDEN)


        try:

            company = Company.objects.get(
                user=request.user
            )

        except Company.DoesNotExist:

            return Response({

                "success": False,

                "message":
                "Please create your company profile first."

            }, status=status.HTTP_400_BAD_REQUEST)


        serializer = JobSerializer(
            data=request.data
        )


        if not serializer.is_valid():

            return Response({

                "success": False,

                "message":
                "Job creation failed.",

                "errors":
                serializer.errors

            }, status=status.HTTP_400_BAD_REQUEST)


        job = serializer.save(

            employer=request.user,

            company=company

        )


        return Response({

            "success": True,

            "message":
            "Job created successfully.",

            "data":
            JobSerializer(job).data

        }, status=status.HTTP_201_CREATED)


# ============================================================
# GET ALL JOBS
# GET
# /api/jobs/
# ============================================================

class JobListView(APIView):

    permission_classes = [
        AllowAny
    ]


    def get(self, request):

        jobs = Job.objects.filter(
            status=Job.Status.ACTIVE
        ).select_related(
            "company",
            "employer"
        ).order_by(
            "-created_at"
        )


        # SEARCH
        search = request.GET.get(
            "search"
        )


        if search:

            jobs = jobs.filter(

                Q(title__icontains=search)
                |
                Q(description__icontains=search)
                |
                Q(skills__icontains=search)
                |
                Q(company__company_name__icontains=search)

            )


        # LOCATION
        location = request.GET.get(
            "location"
        )


        if location:

            jobs = jobs.filter(
                location__icontains=location
            )


        # EXPERIENCE
        experience = request.GET.get(
            "experience"
        )


        if experience:

            jobs = jobs.filter(
                experience_level=experience
            )


        # JOB TYPE
        job_type = request.GET.get(
            "job_type"
        )


        if job_type:

            jobs = jobs.filter(
                job_type=job_type
            )


        # PAGINATION
        page = request.GET.get(
            "page",
            1
        )

        limit = request.GET.get(
            "limit",
            10
        )


        try:

            page = int(page)

            limit = int(limit)


            if page < 1:

                page = 1


            if limit < 1:

                limit = 10


            if limit > 100:

                limit = 100

        except ValueError:

            page = 1

            limit = 10


        total_jobs = jobs.count()


        start = (
            page - 1
        ) * limit

        end = start + limit


        jobs = jobs[start:end]


        serializer = JobSerializer(
            jobs,
            many=True
        )


        return Response({

            "success": True,

            "message":
            "Jobs retrieved successfully.",

            "pagination": {

                "page": page,

                "limit": limit,

                "total": total_jobs,

                "has_next":
                end < total_jobs,

                "has_previous":
                page > 1

            },

            "data":
            serializer.data

        })


# ============================================================
# GET JOB DETAILS
# GET
# /api/jobs/<job_id>/
# ============================================================

class JobDetailView(APIView):

    permission_classes = [
        AllowAny
    ]


    def get(self, request, job_id):

        try:

            job = Job.objects.select_related(
                "company",
                "employer"
            ).get(
                id=job_id,
                status=Job.Status.ACTIVE
            )

        except Job.DoesNotExist:

            return Response({

                "success": False,

                "message":
                "Job not found."

            }, status=status.HTTP_404_NOT_FOUND)


        return Response({

            "success": True,

            "data":
            JobSerializer(job).data

        })


# ============================================================
# UPDATE JOB
# PUT
# /api/jobs/<job_id>/
# ============================================================

class JobUpdateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def put(self, request, job_id):

        if request.user.role != "employer":

            return Response({

                "success": False,

                "message":
                "Only employers can update jobs."

            }, status=status.HTTP_403_FORBIDDEN)


        try:

            job = Job.objects.get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response({

                "success": False,

                "message":
                "Job not found."

            }, status=status.HTTP_404_NOT_FOUND)


        if job.employer != request.user:

            return Response({

                "success": False,

                "message":
                "You can only update your own jobs."

            }, status=status.HTTP_403_FORBIDDEN)


        serializer = JobSerializer(
            job,
            data=request.data
        )


        if not serializer.is_valid():

            return Response({

                "success": False,

                "errors":
                serializer.errors

            }, status=status.HTTP_400_BAD_REQUEST)


        serializer.save()


        return Response({

            "success": True,

            "message":
            "Job updated successfully.",

            "data":
            serializer.data

        })


# ============================================================
# DELETE JOB
# DELETE
# /api/jobs/<job_id>/
# ============================================================

class JobDeleteView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def delete(self, request, job_id):

        if request.user.role != "employer":

            return Response({

                "success": False,

                "message":
                "Only employers can delete jobs."

            }, status=status.HTTP_403_FORBIDDEN)


        try:

            job = Job.objects.get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response({

                "success": False,

                "message":
                "Job not found."

            }, status=status.HTTP_404_NOT_FOUND)


        if job.employer != request.user:

            return Response({

                "success": False,

                "message":
                "You can only delete your own jobs."

            }, status=status.HTTP_403_FORBIDDEN)


        job.delete()


        return Response({

            "success": True,

            "message":
            "Job deleted successfully."

        })