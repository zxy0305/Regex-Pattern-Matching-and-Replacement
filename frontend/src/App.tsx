import { ChangeEvent, useMemo, useState } from "react";
import { Download, FileSpreadsheet, Loader2, Play, Sparkles, Upload } from "lucide-react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Row = Record<string, string>;

type ParsedFile = {
  columns: string[];
  rows: Row[];
  rowCount: number;
};

type Summary = {
  totalMatches: number;
  changedRows: number;
  totalRows: number;
};

const api = {
  async parseFile(file: File): Promise<ParsedFile> {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/parse-file/", { method: "POST", body: form });
    return readJson(response);
  },
  async suggestRegex(description: string, column: string) {
    const response = await fetch("/api/suggest-regex/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, column })
    });
    return readJson(response);
  },
  async process(rows: Row[], columns: string[], pattern: string, replacement: string) {
    const response = await fetch("/api/process/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, columns, pattern, replacement })
    });
    return readJson(response);
  }
};

async function readJson(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function App() {
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [processedRows, setProcessedRows] = useState<Row[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [description, setDescription] = useState("Find email addresses");
  const [pattern, setPattern] = useState("");
  const [replacement, setReplacement] = useState("REDACTED");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const visibleRows = processedRows.length ? processedRows : rows;
  const canProcess = rows.length > 0 && selectedColumns.length > 0 && pattern.trim().length > 0;

  const changedCells = useMemo(() => {
    const keys = new Set<string>();
    processedRows.forEach((row, rowIndex) => {
      selectedColumns.forEach((column) => {
        if ((rows[rowIndex]?.[column] ?? "") !== (row[column] ?? "")) {
          keys.add(`${rowIndex}:${column}`);
        }
      });
    });
    return keys;
  }, [processedRows, rows, selectedColumns]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy("upload");
    setNotice("");
    setProcessedRows([]);
    setSummary(null);
    try {
      const parsed = await api.parseFile(file);
      setColumns(parsed.columns);
      setRows(parsed.rows);
      setSelectedColumns(parsed.columns.slice(0, 1));
      setNotice(`Loaded ${parsed.rowCount} rows from ${file.name}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not parse the file.");
    } finally {
      setBusy("");
    }
  }

  async function handleSuggest() {
    setBusy("suggest");
    setNotice("");
    try {
      const result = await api.suggestRegex(description, selectedColumns[0] || "");
      setPattern(result.pattern);
      setNotice(`${result.source === "llm" ? "LLM" : "Rule"} suggestion: ${result.explanation}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not suggest a regex.");
    } finally {
      setBusy("");
    }
  }

  async function handleProcess() {
    setBusy("process");
    setNotice("");
    try {
      const result = await api.process(rows, selectedColumns, pattern, replacement);
      setProcessedRows(result.rows);
      setSummary(result.summary);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not process rows.");
    } finally {
      setBusy("");
    }
  }

  function toggleColumn(column: string) {
    setSelectedColumns((current) =>
      current.includes(column) ? current.filter((item) => item !== column) : [...current, column]
    );
  }

  function downloadCsv() {
    const csv = toCsv(columns, visibleRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "processed-data.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>Regex Pattern Matching and Replacement</h1>
          <p>Upload CSV/XLSX data, convert a plain-language pattern into regex, then replace matches in selected columns.</p>
        </div>
        <label className="uploadButton">
          {busy === "upload" ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
          Upload File
          <input type="file" accept=".csv,.xlsx" onChange={handleFile} />
        </label>
      </header>

      <section className="workspace">
        <aside className="panel controls">
          <div className="sectionTitle">
            <FileSpreadsheet size={18} />
            Data Columns
          </div>
          <div className="columnList">
            {columns.length === 0 ? (
              <p className="empty">Upload a CSV or XLSX file to begin.</p>
            ) : (
              columns.map((column) => (
                <label key={column} className="checkRow">
                  <input checked={selectedColumns.includes(column)} type="checkbox" onChange={() => toggleColumn(column)} />
                  <span>{column}</span>
                </label>
              ))
            )}
          </div>

          <label className="field">
            <span>Natural Language Pattern</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          </label>
          <button className="secondary" onClick={handleSuggest} disabled={!description.trim() || busy === "suggest"}>
            {busy === "suggest" ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />}
            Suggest Regex
          </button>

          <label className="field">
            <span>Regex Pattern</span>
            <input value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="\\b[A-Za-z0-9._%+-]+@..." />
          </label>
          <label className="field">
            <span>Replacement Value</span>
            <input value={replacement} onChange={(event) => setReplacement(event.target.value)} />
          </label>

          <button className="primary" onClick={handleProcess} disabled={!canProcess || busy === "process"}>
            {busy === "process" ? <Loader2 className="spin" size={17} /> : <Play size={17} />}
            Run Replacement
          </button>

          {summary && (
            <div className="summary">
              <strong>{summary.totalMatches}</strong>
              <span>matches across {summary.changedRows} of {summary.totalRows} rows</span>
            </div>
          )}
          {notice && <p className="notice">{notice}</p>}
        </aside>

        <section className="tablePanel">
          <div className="tableActions">
            <div>
              <h2>Processed Data</h2>
              <span>{visibleRows.length} rows</span>
            </div>
            <button className="iconButton" onClick={downloadCsv} disabled={visibleRows.length === 0} title="Download CSV">
              <Download size={18} />
            </button>
          </div>
          <div className="tableWrap">
            {visibleRows.length === 0 ? (
              <div className="placeholder">No data loaded.</div>
            ) : (
              <table>
                <thead>
                  <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
                </thead>
                <tbody>
                  {visibleRows.slice(0, 200).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((column) => (
                        <td key={column} className={changedCells.has(`${rowIndex}:${column}`) ? "changed" : ""}>
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function toCsv(columns: string[], rows: Row[]) {
  const escape = (value: string) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [columns.map(escape).join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n");
}

createRoot(document.getElementById("root")!).render(<App />);
