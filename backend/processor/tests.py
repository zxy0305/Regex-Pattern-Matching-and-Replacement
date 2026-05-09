from django.test import TestCase

from .services import process_table, suggest_regex_from_text


class RegexProcessingTests(TestCase):
    def test_rule_based_email_suggestion(self):
        suggestion = suggest_regex_from_text("find email addresses")

        self.assertIn("@", suggestion.pattern)
        self.assertEqual(suggestion.source, "rules")

    def test_replaces_matches_across_all_columns(self):
        rows = [
            {"Name": "John Doe", "Email": "john.doe@example.com"},
            {"Name": "Jane Smith", "Email": "jane@domain.com"},
        ]

        result = process_table(rows, r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b", "REDACTED")

        self.assertEqual(result["summary"]["totalMatches"], 2)
        self.assertEqual(result["rows"][0]["Name"], "John Doe")
        self.assertEqual(result["rows"][0]["Email"], "REDACTED")
