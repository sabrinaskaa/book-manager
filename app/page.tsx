import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Pengelola Perpustakaan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pilih menu untuk mulai mengelola data.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/books"
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Buku
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Lihat, tambah, update, dan hapus buku.
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/categories"
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Kategori
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Kelola kategori buku.
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
