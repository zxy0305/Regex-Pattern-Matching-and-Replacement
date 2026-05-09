#!/usr/bin/env python
import os
import sys


def main():
    # Specify the Django settings module to load project configuration
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "regex_app.settings")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
