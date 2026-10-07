from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import (
    IsAuthenticated
)

from .models import Company

from .serializers import (
    CompanySerializer
)


class CompanyCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        if request.user.role != "employer":

            return Response({

                "success": False,

                "message":
                "Only employers can create a company."

            }, status=status.HTTP_403_FORBIDDEN)

        if Company.objects.filter(
            user=request.user
        ).exists():

            return Response({

                "success": False,

                "message":
                "Company profile already exists."

            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = CompanySerializer(
            data=request.data
        )

        if serializer.is_valid():

            company = serializer.save(
                user=request.user
            )

            return Response({

                "success": True,

                "message":
                "Company created successfully.",

                "data":
                serializer.data

            }, status=status.HTTP_201_CREATED)

        return Response({

            "success": False,

            "errors":
            serializer.errors

        }, status=status.HTTP_400_BAD_REQUEST)


class MyCompanyView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        try:

            company = Company.objects.get(
                user=request.user
            )

        except Company.DoesNotExist:

            return Response({

                "success": False,

                "message":
                "Company profile not found."

            }, status=status.HTTP_404_NOT_FOUND)

        return Response({

            "success": True,

            "data":
            CompanySerializer(company).data

        })