from django.conf import settings
from django.core.mail import send_mail


def send_company_registration_email(company):
    """
    Send email when a company/employer registers.
    """

    if not company.email:
        return False

    subject = "Company Registration Successful"

    message = f"""
Hello {company.company_name},

Your company has been successfully registered in the Recruitment Management System.

Company Name: {company.company_name}
Email: {company.email}

You can now use the platform to create and manage job postings.

Thank you,
Recruitment Management System
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[company.email],
            fail_silently=False,
        )

        return True

    except Exception as e:
        print("Company registration email error:", e)
        return False