from django.urls import path

from .views import (
    InterviewCreateView,
    MyInterviewsView,
    EmployerInterviewsView,
    InterviewDetailView,
    InterviewUpdateView,
    InterviewStatusUpdateView,
    InterviewCancelView,
)


urlpatterns = [

    # ============================================================
    # CREATE / SCHEDULE
    # ============================================================

    path(
        "create/",
        InterviewCreateView.as_view(),
        name="interview-create"
    ),

    # ============================================================
    # CANDIDATE INTERVIEWS
    # ============================================================

    path(
        "my/",
        MyInterviewsView.as_view(),
        name="my-interviews"
    ),

    # ============================================================
    # EMPLOYER INTERVIEWS
    # ============================================================

    path(
        "employer/",
        EmployerInterviewsView.as_view(),
        name="employer-interviews"
    ),

    # ============================================================
    # DETAIL
    # ============================================================

    path(
        "<int:interview_id>/",
        InterviewDetailView.as_view(),
        name="interview-detail"
    ),

    # ============================================================
    # UPDATE
    # ============================================================

    path(
        "<int:interview_id>/update/",
        InterviewUpdateView.as_view(),
        name="interview-update"
    ),

    # ============================================================
    # STATUS
    # ============================================================

    path(
        "<int:interview_id>/status/",
        InterviewStatusUpdateView.as_view(),
        name="interview-status"
    ),

    # ============================================================
    # CANCEL
    # ============================================================

    path(
        "<int:interview_id>/cancel/",
        InterviewCancelView.as_view(),
        name="interview-cancel"
    ),
]