from django.urls import path

from . import views


urlpatterns = [
    path("health/", views.health_check, name="health_check"),
    path("parse-file/", views.parse_file, name="parse_file"),
    path("suggest-regex/", views.suggest_regex, name="suggest_regex"),
    path("process/", views.process_rows, name="process_rows"),
]
