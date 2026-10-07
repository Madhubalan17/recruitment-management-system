"""
URL configuration for main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static


# ============================================================
# FRONTEND PAGES
# ============================================================

def home(request):
    return render(request, "frontend/index.html")


def register_page(request):
    return render(request, "frontend/register.html")


def dashboard_page(request):
    return render(request, "frontend/dashboard.html")


def jobs_page(request):
    return render(request, "frontend/jobs.html")


def job_details_page(request):
    return render(request, "frontend/job-details.html")


def applications_page(request):
    return render(request, "frontend/applications.html")


def interviews_page(request):
    return render(request, "frontend/interviews.html")


def company_page(request):
    return render(request, "frontend/company.html")


def employer_jobs_page(request):
    return render(request, "frontend/employer-jobs.html")


# ============================================================
# URL PATTERNS
# ============================================================

urlpatterns = [

    # ========================================================
    # ADMIN
    # ========================================================

    path(
        "admin/",
        admin.site.urls
    ),


    # ========================================================
    # FRONTEND
    # ========================================================

    path(
        "",
        home,
        name="home"
    ),

    path(
        "register/",
        register_page,
        name="register-page"
    ),

    path(
        "dashboard/",
        dashboard_page,
        name="dashboard-page"
    ),

    path(
        "jobs/",
        jobs_page,
        name="jobs-page"
    ),

    path(
        "job-details/",
        job_details_page,
        name="job-details-page"
    ),

    path(
        "applications/",
        applications_page,
        name="applications-page"
    ),

    path(
        "interviews/",
        interviews_page,
        name="interviews-page"
    ),

    path(
        "company/",
        company_page,
        name="company-page"
    ),

    path(
        "employer-jobs/",
        employer_jobs_page,
        name="employer-jobs-page"
    ),


    # ========================================================
    # API - AUTHENTICATION
    # ========================================================

    path(
        "api/auth/",
        include("accounts.urls")
    ),


    # ========================================================
    # API - COMPANIES
    # ========================================================

    path(
        "api/companies/",
        include("companies.urls")
    ),


    # ========================================================
    # API - JOBS
    # ========================================================

    path(
        "api/jobs/",
        include("jobs.urls")
    ),


    # ========================================================
    # API - APPLICATIONS
    # ========================================================

    path(
        "api/applications/",
        include("applications.urls")
    ),


    # ========================================================
    # API - INTERVIEWS
    # ========================================================

    path(
        "api/interviews/",
        include("interviews.urls")
    ),
]


# ============================================================
# MEDIA FILES
# ============================================================

if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )