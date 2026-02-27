import { useEffect, useState } from "react";
import { api } from "../api";
import type { Tag } from "../types";
import { useToast } from "../components/ToastProvider";

export function TagsPage() {
  const { push } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");

  const load = () => api.getTags().then(setTags);

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    await api.createTag(name.trim());
    setName("");
    await load();
    push("Tag created");
  };

  const update = async (tag: Tag) => {
    const newName = prompt("Rename tag", tag.name);
    if (!newName) return;
    await api.updateTag(tag.id, newName);
    await load();
    push("Tag updated");
  };

  const remove = async (tag: Tag) => {
    if (!confirm(`Delete ${tag.name}?`)) return;
    await api.deleteTag(tag.id);
    await load();
    push("Tag deleted");
  };

  return (
    <div className="page">
      <div className="panel stack">
        <div className="section-title">Manage tags</div>
        <div className="actions">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag" />
          <button className="button accent" onClick={create}>
            Add
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.name}</td>
                <td className="actions">
                  <button className="button secondary" onClick={() => update(tag)}>
                    Edit
                  </button>
                  <button className="button danger" onClick={() => remove(tag)}>
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
