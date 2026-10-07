from django.urls import path

from .views import (
    JobCreateView,
    JobListView,
    JobDetailView,
    JobUpdateView,
    JobDeleteView
)


urlpatterns = [

    # Create
    path(
        "create/",
        JobCreateView.as_view(),
        name="job-create"
    ),

    # List
    path(
        "",
        JobListView.as_view(),
        name="job-list"
    ),

    # Details
    path(
        "<int:job_id>/",
        JobDetailView.as_view(),
        name="job-detail"
    ),

    # Update
    path(
        "<int:job_id>/update/",
        JobUpdateView.as_view(),
        name="job-update"
    ),

    # Delete
    path(
        "<int:job_id>/delete/",
        JobDeleteView.as_view(),
        name="job-delete"
    ),

]