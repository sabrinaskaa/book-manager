"use client";

import { useEffect, useRef, useState } from "react";

type Category = { id: number; name: string };

export default function BooksPage() {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const dtRef = useRef<any>(null);

  // dropdown categories untuk filter + form
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");

  // filter tanggal (optional)
  const [pubFrom, setPubFrom] = useState<string>("");
  const [pubTo, setPubTo] = useState<string>("");

  // form create book
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [publisher, setPublisher] = useState("");
  const [pages, setPages] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // load categories
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(data);
    })();
  }, []);

  // init DataTables once
  useEffect(() => {
    let mounted = true;

    (async () => {
      const jquery = (await import("jquery")).default;
      (window as any).$ = (window as any).jQuery = jquery;

      await import("datatables.net-dt");

      if (!mounted || !tableRef.current) return;

      dtRef.current = (jquery(tableRef.current) as any).DataTable({
        serverSide: true,
        processing: true,
        ajax: {
          url: "/api/books",
          data: function(d: any) {
            // custom filters -> akan terbaca backend GET /api/books
            d.categoryId = filterCategoryId || undefined;
            d.pubDateFrom = pubFrom || undefined;
            d.pubDateTo = pubTo || undefined;
          },
        },
        columns: [
          {
            data: "imageUrl",
            title: "Cover",
            orderable: false,
            render: (url: string) =>
              url
                ? `<img src="${url}" style="width:40px;height:60px;object-fit:cover;border-radius:4px" />`
                : "-",
          },
          { data: "title", title: "Title" },
          { data: "author", title: "Author" },
          { data: "publisher", title: "Publisher" },
          { data: "publicationDate", title: "Publication Date" },
          { data: "pages", title: "Pages" },
          { data: "categoryName", title: "Category" },
          {
            data: "id",
            title: "Action",
            orderable: false,
            render: (id: number) =>
              `<button class="btn-del" data-id="${id}">Delete</button>`,
          },
        ],
      });

      // handle delete button
      const $ = jquery;
      $(tableRef.current).on("click", ".btn-del", async function() {
        const id = $(this).attr("data-id");
        if (!id) return;
        if (!confirm("Delete this book?")) return;

        await fetch(`/api/books/${id}`, { method: "DELETE" });
        dtRef.current?.ajax.reload(null, false);
      });
    })();

    return () => {
      mounted = false;
      if (dtRef.current) {
        dtRef.current.destroy(true);
        dtRef.current = null;
      }
    };
  }, []); // init sekali

  // reload saat filter berubah
  useEffect(() => {
    if (dtRef.current) dtRef.current.ajax.reload(null, true);
  }, [filterCategoryId, pubFrom, pubTo]);

  async function submitBook(e: React.FormEvent) {
    e.preventDefault();

    if (!imageFile) return alert("Image wajib diupload.");
    if (!categoryId) return alert("Category wajib dipilih.");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("author", author);
      fd.append("publicationDate", publicationDate);
      fd.append("publisher", publisher);
      fd.append("pages", pages);
      fd.append("categoryId", categoryId);
      fd.append("image", imageFile); // wajib: field name harus "image"

      const res = await fetch("/api/books", { method: "POST", body: fd });
      const out = await res.json();

      if (!res.ok) {
        alert(out?.message || "Gagal membuat book");
        return;
      }

      // reset form
      setTitle("");
      setAuthor("");
      setPublicationDate("");
      setPublisher("");
      setPages("");
      setCategoryId("");
      setImageFile(null);

      // refresh table
      dtRef.current?.ajax.reload(null, true);
      alert("Book berhasil ditambahkan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Books</h1>

      {/* FILTER BAR */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "12px 0",
        }}
      >
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        <div>
          <label>From: </label>
          <input
            type="date"
            value={pubFrom}
            onChange={(e) => setPubFrom(e.target.value)}
          />
        </div>

        <div>
          <label>To: </label>
          <input
            type="date"
            value={pubTo}
            onChange={(e) => setPubTo(e.target.value)}
          />
        </div>
      </div>

      {/* FORM CREATE BOOK */}
      <form
        onSubmit={submitBook}
        style={{ display: "grid", gap: 8, maxWidth: 520, marginBottom: 16 }}
      >
        <h3>Add Book</h3>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <input
          type="date"
          value={publicationDate}
          onChange={(e) => setPublicationDate(e.target.value)}
          required
        />

        <input
          placeholder="Publisher"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          required
        />

        <input
          placeholder="Pages (angka)"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          required
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          required
        />

        <button disabled={saving}>{saving ? "Saving..." : "Save Book"}</button>
      </form>

      {/* TABLE */}
      <table ref={tableRef} style={{ width: "100%" }} />
    </div>
  );
}
