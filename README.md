# Web Application for Regex Pattern Matching and Replacement

A Django + React application for uploading CSV/XLSX files, describing text patterns in natural language, converting those descriptions into regular expressions, replacing matches in selected columns, and exporting the processed data.

## Features

- Upload CSV and XLSX files.
- Display uploaded data in a table.
- Select one or more columns for processing.
- Convert natural language descriptions to regex patterns.
- Use OpenAI when `OPENAI_API_KEY` is configured.
- Fall back to built-in rules for common patterns such as emails, phone numbers, URLs, dates, numbers, and names.
- Replace matched text and highlight changed cells.
- Export processed rows as CSV.

## Project Structure

```text
backend/
  manage.py
  regex_app/
  processor/
frontend/
  src/
```

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Optional LLM configuration:

```bash
export OPENAI_API_KEY="your_api_key"
export OPENAI_MODEL="gpt-4o-mini"
```

Without `OPENAI_API_KEY`, the app still works with direct regex input and built-in rule-based suggestions.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## API Endpoints

- `GET /api/health/`
- `POST /api/parse-file/` with multipart field `file`
- `POST /api/suggest-regex/` with JSON `{ "description": "...", "column": "..." }`
- `POST /api/process/` with JSON `{ "rows": [...], "columns": [...], "pattern": "...", "replacement": "..." }`

## Tests

```bash
cd backend
python manage.py test
```
