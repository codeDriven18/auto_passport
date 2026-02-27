import { useState } from "react";
import { api } from "../api";
import type { ImportResult } from "../types";
import { useToast } from "../components/ToastProvider";

export function ImportPage() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await api.importFile(file, format);
      setResult(data);
      push("Import completed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      push(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="panel stack">
        <div className="section-title">Import jobs</div>
        <div className="form-grid">
          <input
            className="input"
            type="file"
            accept=".csv,.json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <select className="select" value={format} onChange={(e) => setFormat(e.target.value as "csv" | "json")}>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button className="button accent" onClick={onSubmit} disabled={!file || loading}>
            {loading ? "Importing..." : "Import"}
          </button>
        </div>

        {result && (
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="section-title">Summary</div>
            <div className="job-meta">
              <span>Inserted: {result.inserted}</span>
              <span>Updated: {result.updated}</span>
              <span>Failed: {result.failed}</span>
            </div>
            {result.errors.length > 0 && (
              <table className="table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((err) => (
                    <tr key={err.rowNumber}>
                      <td>{err.rowNumber}</td>
                      <td>{err.messages.join(" | ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
