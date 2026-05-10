# Regex Processor

A Django + React application for uploading CSV/XLSX files, describing text patterns in natural language, converting those descriptions into regex pattern using OpenAI, replacing matches with custom replacement value, and exporting the processed data as CSV.

## Features

- Upload CSV and XLSX files.
- Display uploaded data in a table.
- Display columns parsed from files for processing.
- Convert natural language descriptions to regex patterns.
- Use OpenAI when `OPENAI_API_KEY` is configured.
- Fall back to built-in rules for common patterns such as emails, phone numbers, URLs, dates, numbers, and names.
- Replace matched text with custom replacement value and highlight changed cells.
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

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
  
### Backend
- Django
- Python

### AI Integration
- OpenAI API

### Deployment
- Vercel
- Render

## Deployment URL

https://regex-pattern-matching-and-replacem.vercel.app/

## Local Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver 127.0.0.1:8000
```

Optional LLM configuration:

```bash
export OPENAI_API_KEY="api_key"
export OPENAI_MODEL="gpt-4o-mini"
```

Without `OPENAI_API_KEY`, the app still works with built-in rule-based regex suggestions.

## Local Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## API Endpoints

- `GET /api/health/`
- `POST /api/parse-file/` with multipart field `file`
- `POST /api/suggest-regex/` with JSON `{ "description": "..."}`
- `POST /api/process/` with JSON `{ "rows": [...], "pattern": "...", "replacement": "..." }`

## Demo Video
[Watch Demo](https://drive.google.com/file/d/1YII9XwEvDdoon7jHfVX-ZuERGBW7TG1X/view?usp=drive_link)

## Future Improvement
- Add support for selecting one or more columns that need to be updated to flexibily match patterns.
- Integrate database and user authentication to support history tracking ad saved draft.
- Further explore AI integration by considering AI workflow engineering instead of only performing API calls.
