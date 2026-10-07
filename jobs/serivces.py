from django.conf import settings
from django.core.mail import send_mail


def send_job_created_email(job, candidate_email):
    """
    Send email to candidate when a new job is available.
    """

    if not candidate_email:
        return False

    subject = f"New Job Opportunity - {job.title}"

    message = f"""
Hello,

A new job opportunity has been posted on the Recruitment Management System.

Job Title: {job.title}
Company: {job.company.company_name}
Location: {job.location}
Experience Required: {job.experience_required}

Please login to the Recruitment Management System to view
the complete job details and apply.

Thank you,
Recruitment Management System
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate_email],
            fail_silently=False,
        )

        return True

    except Exception as e:
        print("Job email error:", e)
        return False


def send_application_received_email(application):
    """
    Send email to employer when a candidate applies for a job.
    """

    employer_email = application.job.company.email

    if not employer_email:
        return False

    subject = f"New Job Application - {application.job.title}"

    message = f"""
Hello {application.job.company.company_name},

A candidate has applied for your job.

Job: {application.job.title}
Candidate: {application.candidate.name}
Candidate Email: {application.candidate.email}

Please login to the Recruitment Management System
to review the application.

Thank you,
Recruitment Management System
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employer_email],
            fail_silently=False,
        )

        return True

    except Exception as e:
        print("Application notification email error:", e)
        return False


def send_application_status_email(application):
    """
    Send application status update to candidate.
    """

    candidate_email = application.candidate.email

    if not candidate_email:
        return False

    subject = f"Application Status - {application.job.title}"

    message = f"""
Hello {application.candidate.name},

Your application status has been updated.

Job: {application.job.title}
Company: {application.job.company.company_name}

Current Status: {application.status}

Please login to the Recruitment Management System
for more details.

Thank you,
Recruitment Management System
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate_email],
            fail_silently=False,
        )

        return True

    except Exception as e:
        print("Application status email error:", e)
        return False