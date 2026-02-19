"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Category = { id: number; name: string };

type BookRow = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  publicationDate: string;
  pages: number;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-600 text-xs mt-1">{message}</p>;
}

const MAX_IMAGE = 5 * 1024 * 1024;
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

const createBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title wajib diisi"),
  author: z
    .string()
    .trim()
    .min(1, "Author wajib diisi"),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid (YYYY-MM-DD)"),
  publisher: z
    .string()
    .trim()
    .min(1, "Publisher wajib diisi"),

  pages: z
    .string()
    .trim()
    .min(1, "Pages wajib diisi")
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), "Pages harus berupa angka")
    .refine((n) => Number.isInteger(n), "Pages harus angka bulat")
    .refine((n) => n > 0, "Pages harus lebih dari 0"),

  categoryId: z
    .string()
    .trim()
    .min(1, "Category wajib dipilih")
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), "Category tidak valid")
    .refine((n) => Number.isInteger(n) && n > 0, "Category wajib dipilih"),

  image: z
    .any()
    .refine(
      (v) => v instanceof FileList && v.length === 1,
      "Image wajib diupload",
    )
    .refine(
      (v) => (v instanceof FileList ? v[0]?.size <= MAX_IMAGE : false),
      "Ukuran image maks 5MB",
    )
    .refine(
      (v) => v instanceof FileList && ALLOWED_MIMES.includes(v[0]?.type),
      "Format image harus JPG/PNG/WEBP",
    ),
});

type CreateBookFormInput = z.input<typeof createBookSchema>;
type CreateBookFormOutput = z.output<typeof createBookSchema>;

const editBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title wajib diisi"),
  author: z
    .string()
    .trim()
    .min(1, "Author wajib diisi"),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid (YYYY-MM-DD)"),
  publisher: z
    .string()
    .trim()
    .min(1, "Publisher wajib diisi"),

  pages: z
    .string()
    .trim()
    .min(1, "Pages wajib diisi")
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), "Pages harus berupa angka")
    .refine((n) => Number.isInteger(n), "Pages harus angka bulat")
    .refine((n) => n > 0, "Pages harus lebih dari 0"),

  categoryId: z
    .string()
    .trim()
    .min(1, "Category wajib dipilih")
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), "Category tidak valid")
    .refine((n) => Number.isInteger(n) && n > 0, "Category wajib dipilih"),

  image: z
    .any()
    .optional()
    .refine(
      (v) => v === undefined || v instanceof FileList,
      "File image tidak valid",
    )
    .refine(
      (v) => v === undefined || (v instanceof FileList && v.length <= 1),
      "Maksimal 1 file",
    )
    .refine(
      (v) =>
        v === undefined ||
        (v instanceof FileList && (v.length === 0 || v[0].size <= MAX_IMAGE)),
      "Ukuran image maks 5MB",
    )
    .refine(
      (v) =>
        v === undefined ||
        (v instanceof FileList &&
          (v.length === 0 || ALLOWED_MIMES.includes(v[0].type))),
      "Format image harus JPG/PNG/WEBP",
    ),
});

type EditBookFormInput = z.input<typeof editBookSchema>;
type EditBookFormOutput = z.output<typeof editBookSchema>;

function inputClass(hasError?: boolean) {
  return [
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white",
    "focus:ring-4 focus:ring-slate-100",
    hasError ? "border-red-400" : "border-slate-200",
  ].join(" ");
}

function selectClass(hasError?: boolean) {
  return [
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white",
    "focus:ring-4 focus:ring-slate-100",
    hasError ? "border-red-400" : "border-slate-200",
  ].join(" ");
}

function buttonPrimary(disabled?: boolean) {
  return [
    "rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800",
    disabled ? "opacity-60 cursor-not-allowed" : "",
  ].join(" ");
}

function buttonGhost(disabled?: boolean) {
  return [
    "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50",
    disabled ? "opacity-60 cursor-not-allowed" : "",
  ].join(" ");
}

export default function BooksPage() {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const dtRef = useRef<any>(null);

  const createFileInputElRef = useRef<HTMLInputElement | null>(null);
  const editFileInputElRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  // filters
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [pubFrom, setPubFrom] = useState<string>("");
  const [pubTo, setPubTo] = useState<string>("");

  const filterRef = useRef<{
    categoryId: string;
    pubFrom: string;
    pubTo: string;
  }>({ categoryId: "", pubFrom: "", pubTo: "" });

  // modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<BookRow | null>(null);

  // create form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
    reset: resetCreate,
  } = useForm<CreateBookFormInput, any, CreateBookFormOutput>({
    resolver: zodResolver(createBookSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      author: "",
      publicationDate: "",
      publisher: "",
      pages: "",
      categoryId: "",
      image: undefined,
    },
  });

  const createImageReg = registerCreate("image");

  // edit form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors, isSubmitting: isUpdating },
    reset: resetEdit,
  } = useForm<EditBookFormInput, any, EditBookFormOutput>({
    resolver: zodResolver(editBookSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      author: "",
      publicationDate: "",
      publisher: "",
      pages: "",
      categoryId: "",
      image: undefined,
    },
  });

  const editImageReg = registerEdit("image");

  // load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  // init datatables
  useEffect(() => {
    let mounted = true;
    let $: any;

    (async () => {
      const jqMod: any = await import("jquery");
      $ = jqMod.default ?? jqMod;
      (window as any).$ = (window as any).jQuery = $;

      await import("datatables.net-dt");

      if (!mounted || !tableRef.current) return;

      dtRef.current = ($(tableRef.current) as any).DataTable({
        serverSide: true,
        processing: true,
        ajax: {
          url: "/api/books",
          data: function(d: any) {
            const f = filterRef.current;
            d.categoryId = f.categoryId || undefined;
            d.pubDateFrom = f.pubFrom || undefined;
            d.pubDateTo = f.pubTo || undefined;
          },
        },
        columns: [
          {
            data: "imageUrl",
            title: "Cover",
            orderable: false,
            render: (url: string) =>
              url
                ? `<img src="${url}" style="width:40px;height:60px;object-fit:cover;border-radius:10px;border:1px solid rgba(15,23,42,.10)" />`
                : "-",
          },
          { data: "title", title: "Judul" },
          { data: "author", title: "Penulis" },
          { data: "publisher", title: "Penerbit" },
          { data: "publicationDate", title: "Tanggal Terbit" },
          { data: "pages", title: "Halaman" },
          { data: "categoryName", title: "Kategori", orderable: false },
          {
            data: "id",
            title: "Aksi",
            orderable: false,
            render: (_id: number, _type: any, row: BookRow) => `
              <div style="display:flex;gap:8px;">
                <button class="btn-edit rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 cursor-pointer" data-id="${row.id}">
                  Update
                </button>
                <button class="btn-del rounded-lg border border-slate-200 bg-rose-400 px-3 font-bold text-white py-1.5 text-sm hover:bg-rose-500 cursor-pointer" data-id="${row.id}">
                  Hapus
                </button>
              </div>
            `,
          },
        ],
      });

      // delete
      $(tableRef.current).on("click", ".btn-del", async (ev: any) => {
        const el = ev.currentTarget as HTMLElement;
        const id = el.getAttribute("data-id");
        if (!id) return;
        if (!confirm("Delete this book?")) return;

        const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(out?.message || "Gagal menghapus book");
          return;
        }
        dtRef.current?.ajax.reload(null, false);
      });

      // edit
      $(tableRef.current).on("click", ".btn-edit", async (ev: any) => {
        const el = ev.currentTarget as HTMLElement;
        const tr = ($ as any)(el).closest("tr");
        const rowData: BookRow | undefined = dtRef.current?.row(tr).data();
        if (!rowData) return;

        setEditRow(rowData);
        setIsEditOpen(true);

        resetEdit({
          title: rowData.title ?? "",
          author: rowData.author ?? "",
          publicationDate: rowData.publicationDate ?? "",
          publisher: rowData.publisher ?? "",
          pages: String(rowData.pages ?? ""),
          categoryId: String(rowData.categoryId ?? ""),
          image: undefined,
        });

        if (editFileInputElRef.current) editFileInputElRef.current.value = "";
      });
    })();

    return () => {
      mounted = false;
      if (tableRef.current && $) {
        $(tableRef.current).off("click", ".btn-del");
        $(tableRef.current).off("click", ".btn-edit");
      }
      if (dtRef.current) {
        dtRef.current.destroy(true);
        dtRef.current = null;
      }
    };
  }, [resetEdit]);

  // reload table when filter changed
  useEffect(() => {
    filterRef.current = { categoryId: filterCategoryId, pubFrom, pubTo };
    if (dtRef.current) dtRef.current.ajax.reload(null, true);
  }, [filterCategoryId, pubFrom, pubTo]);

  function openCreateModal() {
    setIsCreateOpen(true);
    resetCreate({
      title: "",
      author: "",
      publicationDate: "",
      publisher: "",
      pages: "",
      categoryId: "",
      image: undefined,
    });
    if (createFileInputElRef.current) createFileInputElRef.current.value = "";
  }

  function closeCreateModal() {
    setIsCreateOpen(false);
    resetCreate({
      title: "",
      author: "",
      publicationDate: "",
      publisher: "",
      pages: "",
      categoryId: "",
      image: undefined,
    });
    if (createFileInputElRef.current) createFileInputElRef.current.value = "";
  }

  function closeEditModal() {
    setIsEditOpen(false);
    setEditRow(null);
    if (editFileInputElRef.current) editFileInputElRef.current.value = "";
  }

  // create submit
  const submitCreate = handleSubmitCreate(async (values) => {
    const file = (values.image as FileList)[0];

    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("author", values.author);
    fd.append("publicationDate", values.publicationDate);
    fd.append("publisher", values.publisher);
    fd.append("pages", String(values.pages));
    fd.append("categoryId", String(values.categoryId));
    fd.append("image", file);

    const res = await fetch("/api/books", { method: "POST", body: fd });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(out?.message || "Gagal membuat book");
      return;
    }

    closeCreateModal();
    dtRef.current?.ajax.reload(null, true);
    alert("Book berhasil ditambahkan.");
  });

  // edit submit
  const submitEdit = handleSubmitEdit(async (values) => {
    if (!editRow) return;

    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("author", values.author);
    fd.append("publicationDate", values.publicationDate);
    fd.append("publisher", values.publisher);
    fd.append("pages", String(values.pages));
    fd.append("categoryId", String(values.categoryId));

    const fileList = values.image as FileList | undefined;
    if (fileList instanceof FileList && fileList.length === 1) {
      fd.append("image", fileList[0]);
    }

    const res = await fetch(`/api/books/${editRow.id}`, {
      method: "PUT",
      body: fd,
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(out?.message || "Gagal update book");
      return;
    }

    closeEditModal();
    dtRef.current?.ajax.reload(null, true);
    alert("Book berhasil diupdate.");
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Daftar Buku
            </h1>
            <p className="mt-1 text-sm text-slate-500">Kelola detail buku.</p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className={`${buttonGhost()} inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 active:scale-[0.99] cursor-pointer`}
          >
            Tambah Buku
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="text-sm font-medium text-slate-700">Filter</div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Kategori
                </label>
                <select
                  className={selectClass(false)}
                  value={filterCategoryId}
                  onChange={(e) => setFilterCategoryId(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Tanggal Terbit dari
                </label>
                <input
                  type="date"
                  className={inputClass(false)}
                  value={pubFrom}
                  onChange={(e) => setPubFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Tanggal Terbit ke
                </label>
                <input
                  type="date"
                  className={inputClass(false)}
                  value={pubTo}
                  onChange={(e) => setPubTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DataTable card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="text-sm font-medium text-slate-700">
              Daftar Buku
            </div>
          </div>

          <div className="p-5">
            <table ref={tableRef} className="w-full notion-table" />
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
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold">Tambah Buku</h3>
                <p className="text-xs text-slate-500 mt-0.5">Isi data buku.</p>
              </div>
              <button
                type="button"
                className={buttonGhost()}
                onClick={closeCreateModal}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={submitCreate}
              className="p-5 grid gap-3 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Judul Buku
                </label>
                <input
                  className={inputClass(!!createErrors.title)}
                  placeholder="Contoh: Atomic Habits"
                  {...registerCreate("title")}
                />
                <FieldError message={createErrors.title?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Penulis
                </label>
                <input
                  className={inputClass(!!createErrors.author)}
                  placeholder="Contoh: James Clear"
                  {...registerCreate("author")}
                />
                <FieldError message={createErrors.author?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Tanggal Terbit
                </label>
                <input
                  type="date"
                  className={inputClass(!!createErrors.publicationDate)}
                  {...registerCreate("publicationDate")}
                />
                <FieldError message={createErrors.publicationDate?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Penerbit
                </label>
                <input
                  className={inputClass(!!createErrors.publisher)}
                  placeholder="Contoh: Gramedia"
                  {...registerCreate("publisher")}
                />
                <FieldError message={createErrors.publisher?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Halaman
                </label>
                <input
                  className={inputClass(!!createErrors.pages)}
                  placeholder="Contoh: 240"
                  inputMode="numeric"
                  {...registerCreate("pages")}
                />
                <FieldError message={createErrors.pages?.message} />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Kategori
                </label>
                <select
                  className={selectClass(!!createErrors.categoryId)}
                  {...registerCreate("categoryId")}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FieldError message={createErrors.categoryId?.message} />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Cover Buku
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className={inputClass(!!createErrors.image)}
                  {...createImageReg}
                  ref={(el) => {
                    createImageReg.ref(el);
                    createFileInputElRef.current = el;
                  }}
                />
                <FieldError message={createErrors.image?.message as any} />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className={buttonGhost(isCreating)}
                  onClick={closeCreateModal}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  className={buttonPrimary(isCreating)}
                  disabled={isCreating}
                >
                  {isCreating ? "Menambahkan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && editRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold">Update Book</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload cover baru opsional.
                </p>
              </div>
              <button
                type="button"
                className={buttonGhost()}
                onClick={closeEditModal}
              >
                ✕
              </button>
            </div>

            <div className="px-5 pt-4">
              <div className="flex gap-3 items-start">
                <img
                  src={editRow.imageUrl}
                  alt="cover"
                  className="w-20 h-28 object-cover rounded-xl border border-slate-200"
                />
                <p className="text-sm text-slate-500">
                  *Kalau tidak upload image baru, cover lama tetap dipakai.
                </p>
              </div>
            </div>

            <form
              onSubmit={submitEdit}
              className="p-5 grid gap-3 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Title
                </label>
                <input
                  className={inputClass(!!editErrors.title)}
                  {...registerEdit("title")}
                />
                <FieldError message={editErrors.title?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Author
                </label>
                <input
                  className={inputClass(!!editErrors.author)}
                  {...registerEdit("author")}
                />
                <FieldError message={editErrors.author?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Publication Date
                </label>
                <input
                  type="date"
                  className={inputClass(!!editErrors.publicationDate)}
                  {...registerEdit("publicationDate")}
                />
                <FieldError message={editErrors.publicationDate?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Publisher
                </label>
                <input
                  className={inputClass(!!editErrors.publisher)}
                  {...registerEdit("publisher")}
                />
                <FieldError message={editErrors.publisher?.message} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Pages
                </label>
                <input
                  className={inputClass(!!editErrors.pages)}
                  inputMode="numeric"
                  {...registerEdit("pages")}
                />
                <FieldError message={editErrors.pages?.message} />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Category
                </label>
                <select
                  className={selectClass(!!editErrors.categoryId)}
                  {...registerEdit("categoryId")}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FieldError message={editErrors.categoryId?.message} />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className={inputClass(!!editErrors.image)}
                  {...editImageReg}
                  ref={(el) => {
                    editImageReg.ref(el);
                    editFileInputElRef.current = el;
                  }}
                />
                <FieldError message={editErrors.image?.message as any} />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className={buttonGhost(isUpdating)}
                  onClick={closeEditModal}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  className={buttonPrimary(isUpdating)}
                  disabled={isUpdating}
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
