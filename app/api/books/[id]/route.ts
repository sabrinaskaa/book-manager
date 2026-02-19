export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Book } from "@/models";
import { bookFormSchema } from "@/validations/bookForm";
import { saveUploadedImage } from "@/lib/upload";
import { deleteUploadedImageByUrl } from "@/lib/uploadDelete";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const book = await Book.findByPk(id);
  if (!book)
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );
  return NextResponse.json({ ok: true, data: book });
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const bookId = Number(id);

    const book = await Book.findByPk(bookId);
    if (!book) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 },
      );
    }

    const oldImageUrl = book.imageUrl;

    const form = await req.formData();
    const raw = {
      title: String(form.get("title") ?? book.title),
      author: String(form.get("author") ?? book.author),
      publicationDate: String(
        form.get("publicationDate") ?? book.publicationDate,
      ),
      publisher: String(form.get("publisher") ?? book.publisher),
      pages: String(form.get("pages") ?? book.pages),
      categoryId: String(form.get("categoryId") ?? book.categoryId),
    };

    const parsed = bookFormSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Validasi gagal",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const image = form.get("image");

    let newImageUrl = oldImageUrl;
    let uploadedNewUrl: string | null = null;

    // kalau ada image baru, simpan ke uploads
    if (image instanceof File && image.size > 0) {
      const saved = await saveUploadedImage(image);
      newImageUrl = saved.imageUrl;
      uploadedNewUrl = saved.imageUrl;
    }

    try {
      await book.update({ ...parsed.data, imageUrl: newImageUrl });
    } catch (err) {
      if (uploadedNewUrl) {
        await deleteUploadedImageByUrl(uploadedNewUrl).catch(() => {});
      }
      throw err;
    }

    // hapus file lama jika ada dan berbeda dengan yang baru
    if (uploadedNewUrl && oldImageUrl && oldImageUrl !== uploadedNewUrl) {
      await deleteUploadedImageByUrl(oldImageUrl).catch(() => {});
    }

    return NextResponse.json({ ok: true, data: book });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const bookId = Number(id);

  const book = await Book.findByPk(bookId);
  if (!book)
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );

  const imageUrl = book.imageUrl;
  await book.destroy();

  await deleteUploadedImageByUrl(imageUrl).catch(() => {});
  return NextResponse.json({ ok: true });
}
