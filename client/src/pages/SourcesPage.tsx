import { useEffect, useState } from "react";
import { api } from "../api";
import type { Source } from "../types";
import { useToast } from "../components/ToastProvider";

export function SourcesPage() {
  const { push } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const load = () => api.getSources().then(setSources);

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    await api.createSource({ name: name.trim(), url: url.trim() || undefined });
    setName("");
    setUrl("");
    await load();
    push("Source created");
  };

  const update = async (source: Source) => {
    const newName = prompt("Rename source", source.name);
    if (!newName) return;
    const newUrl = prompt("Source URL", source.url ?? "") ?? "";
    await api.updateSource(source.id, { name: newName, url: newUrl });
    await load();
    push("Source updated");
  };

  const remove = async (source: Source) => {
    if (!confirm(`Delete ${source.name}?`)) return;
    await api.deleteSource(source.id);
    await load();
    push("Source deleted");
  };

  return (
    <div className="page">
      <div className="panel stack">
        <div className="section-title">Manage sources</div>
        <div className="grid-2">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Source name" />
          <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Source URL" />
        </div>
        <div>
          <button className="button accent" onClick={create}>
            Add source
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id}>
                <td>{source.name}</td>
                <td>{source.url ?? ""}</td>
                <td className="actions">
                  <button className="button secondary" onClick={() => update(source)}>
                    Edit
                  </button>
                  <button className="button danger" onClick={() => remove(source)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
