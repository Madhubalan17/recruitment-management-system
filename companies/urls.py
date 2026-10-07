from django.urls import path

from .views import (
    CompanyCreateView,
    MyCompanyView
)


urlpatterns = [

    path(
        "create/",
        CompanyCreateView.as_view()
    ),

    path(
        "me/",
        MyCompanyView.as_view()
    ),

]