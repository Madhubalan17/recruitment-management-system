from django.urls import path

from .views import (
    ApplyJobView,
    MyApplicationsView,
    ApplicationDetailView,
    WithdrawApplicationView,
    JobApplicationsView,
    UpdateApplicationStatusView,
)


urlpatterns = [

    # ============================================================
    # APPLY
    # ============================================================

    path(
        "apply/",
        ApplyJobView.as_view(),
        name="apply-job"
    ),

    # ============================================================
    # MY APPLICATIONS
    # ============================================================

    path(
        "my/",
        MyApplicationsView.as_view(),
        name="my-applications"
    ),

    # ============================================================
    # JOB APPLICANTS
    # ============================================================

    path(
        "job/<int:job_id>/",
        JobApplicationsView.as_view(),
        name="job-applications"
    ),

    # ============================================================
    # APPLICATION DETAIL
    # ============================================================

    path(
        "<int:application_id>/",
        ApplicationDetailView.as_view(),
        name="application-detail"
    ),

    # ============================================================
    # WITHDRAW
    # ============================================================

    path(
        "<int:application_id>/withdraw/",
        WithdrawApplicationView.as_view(),
        name="withdraw-application"
    ),

    # ============================================================
    # UPDATE STATUS
    # ============================================================

    path(
        "<int:application_id>/status/",
        UpdateApplicationStatusView.as_view(),
        name="update-application-status"
    ),
]