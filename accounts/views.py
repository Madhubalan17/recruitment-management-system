from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)

from rest_framework_simplejwt.tokens import (
    RefreshToken
)
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer
)


class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response({

                "success": True,

                "message":
                "Registration successful",

                "data":
                UserSerializer(user).data

            }, status=status.HTTP_201_CREATED)

        return Response({

            "success": False,

            "message":
            "Registration failed",

            "errors":
            serializer.errors

        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response({

                "success": False,

                "message":
                "Login failed",

                "errors":
                serializer.errors

            }, status=status.HTTP_401_UNAUTHORIZED)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response({

            "success": True,

            "message":
            "Login successful",

            "data": {

                "user":
                UserSerializer(user).data,

                "access_token":
                str(refresh.access_token),

                "refresh_token":
                str(refresh)

            }

        })


class MeView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        return Response({

            "success": True,

            "data":
            UserSerializer(
                request.user
            ).data

        })


class LogoutView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        refresh_token = request.data.get(
            "refresh_token"
        )

        if not refresh_token:

            return Response({

                "success": False,

                "message":
                "refresh_token is required"

            }, status=status.HTTP_400_BAD_REQUEST)

        try:

            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response({

                "success": True,

                "message":
                "Logout successful"

            })

        except Exception:

            return Response({

                "success": False,

                "message":
                "Invalid refresh token"

            }, status=status.HTTP_400_BAD_REQUEST)