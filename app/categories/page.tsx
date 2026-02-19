"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "@/components/FieldError";

type Category = { id: number; name: string };

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(100, "Maksimal 100 karakter"),
});

type CategoryFormInput = z.input<typeof categorySchema>;
type CategoryFormOutput = z.output<typeof categorySchema>;

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);

  async function load() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Create form
  const {
    register: regCreate,
    handleSubmit: submitCreateHandler,
    formState: { errors: createErrors, isSubmitting: isCreating },
    reset: resetCreate,
  } = useForm<CategoryFormInput, any, CategoryFormOutput>({
    resolver: zodResolver(categorySchema),
    mode: "onTouched",
    defaultValues: { name: "" },
  });

  function openCreateModal() {
    resetCreate({ name: "" });
    setIsCreateOpen(true);
  }
  function closeCreateModal() {
    setIsCreateOpen(false);
    resetCreate({ name: "" });
  }

  const submitCreate = submitCreateHandler(async (values) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name.trim() }),
    });

    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(out?.message || "Gagal membuat category");
      return;
    }

    closeCreateModal();
    await load();
  });

  // Edit form
  const {
    register: regEdit,
    handleSubmit: submitEditHandler,
    formState: { errors: editErrors, isSubmitting: isUpdating },
    reset: resetEdit,
  } = useForm<CategoryFormInput, any, CategoryFormOutput>({
    resolver: zodResolver(categorySchema),
    mode: "onTouched",
    defaultValues: { name: "" },
  });

  function openEditModal(item: Category) {
    setEditItem(item);
    resetEdit({ name: item.name });
    setIsEditOpen(true);
  }
  function closeEditModal() {
    setIsEditOpen(false);
    setEditItem(null);
    resetEdit({ name: "" });
  }

  const submitEdit = submitEditHandler(async (values) => {
    if (!editItem) return;

    const res = await fetch(`/api/categories/${editItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name.trim() }),
    });

    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(out?.message || "Gagal update category");
      return;
    }

    closeEditModal();
    await load();
  });

  async function onDelete(item: Category) {
    if (!confirm(`Hapus category "${item.name}"?`)) return;

    const res = await fetch(`/api/categories/${item.id}`, { method: "DELETE" });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(out?.message || "Gagal menghapus category");
      return;
    }

    await load();
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Daftar Kategori Buku
            </h1>
            <p className="mt-1 text-sm text-slate-500">Kelola kategori buku.</p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 active:scale-[0.99] cursor-pointer"
          >
            Tambah Kategori
          </button>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="text-sm font-medium text-slate-700">
              Daftar Kategori
            </div>
            <div className="text-xs text-slate-500">
              {loadingList ? "Loading..." : `${items.length} items`}
            </div>
          </div>

          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600">
                    <th className="w-24 px-3 py-3 bg-slate-50 border-b border-slate-200 rounded-tl-2xl">
                      No
                    </th>
                    <th className="px-3 py-3 bg-slate-50 border-b border-slate-200">
                      Nama
                    </th>
                    <th className="w-56 px-3 py-3 bg-slate-50 border-b border-slate-200 rounded-tr-2xl">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-3 border-b border-slate-100 text-sm text-slate-700">
                        {1 + items.findIndex((i) => i.id === c.id)}
                      </td>
                      <td className="px-3 py-3 border-b border-slate-100 text-sm text-slate-900">
                        {c.name}
                      </td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(c)}
                            className="rounded-lg border border-slate-200 bg-rose-400 px-3 font-bold text-white py-1.5 text-sm hover:bg-rose-500 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-10 text-center text-sm text-slate-500"
                      >
                        {loadingList ? "Loading..." : "Belum ada category"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreateModal();
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold">Tambah Kategori</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi nama kategori.
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                onClick={closeCreateModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitCreate} className="p-5 grid gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Nama Kategori
                </label>
                <input
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white focus:ring-4 focus:ring-slate-100 ${
                    createErrors.name ? "border-red-400" : "border-slate-200"
                  }`}
                  placeholder="Contoh: Fiksi"
                  {...regCreate("name")}
                  aria-invalid={!!createErrors.name}
                />
                <FieldError message={createErrors.name?.message} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isCreating}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  disabled={isCreating}
                  className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isCreating ? "Menambahkan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold">Update Category</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah nama kategori.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm hover:bg-slate-50"
                onClick={closeEditModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitEdit} className="p-5 grid gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Category name
                </label>
                <input
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white focus:ring-4 focus:ring-slate-100 ${
                    editErrors.name ? "border-red-400" : "border-slate-200"
                  }`}
                  placeholder="Contoh: Sains"
                  {...regEdit("name")}
                  aria-invalid={!!editErrors.name}
                />
                <FieldError message={editErrors.name?.message} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isUpdating}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  disabled={isUpdating}
                  className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
