import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .services import FileProcessingError, parse_uploaded_file, process_table, suggest_regex_from_text


def health_check(_request):
    return JsonResponse({"status": "ok"})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def parse_file(request):
    uploaded = request.FILES.get("file")
    if not uploaded:
        return JsonResponse({"error": "Missing file."}, status=400)

    try:
        return JsonResponse(parse_uploaded_file(uploaded))
    except (FileProcessingError, UnicodeDecodeError) as exc:
        return JsonResponse({"error": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def suggest_regex(request):
    payload = _json_payload(request)
    description = payload.get("description", "")
    column = payload.get("column", "")

    try:
        suggestion = suggest_regex_from_text(description, column)
        return JsonResponse(
            {
                "pattern": suggestion.pattern,
                "explanation": suggestion.explanation,
                "source": suggestion.source,
            }
        )
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def process_rows(request):
    payload = _json_payload(request)
    try:
        result = process_table(
            rows=payload.get("rows", []),
            columns=payload.get("columns", []),
            pattern=payload.get("pattern", ""),
            replacement=payload.get("replacement", ""),
        )
        return JsonResponse(result)
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)


def _json_payload(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}
