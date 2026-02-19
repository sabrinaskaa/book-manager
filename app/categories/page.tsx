"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  description: string | null;
};

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description.trim() ? description : null,
        }),
      });

      const out = await res.json();
      if (!res.ok) {
        alert(out?.message || "Gagal membuat category");
        return;
      }

      setName("");
      setDescription("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Categories</h1>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", gap: 8, margin: "12px 0" }}
      >
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button disabled={loading || !name.trim()}>
          {loading ? "Saving..." : "Add"}
        </button>
      </form>

      <table
        border={1}
        cellPadding={8}
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th style={{ width: 80 }}>ID</th>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.description ?? "-"}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
                Belum ada category
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
