export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Book } from "@/models";
import { bookFormSchema } from "@/validations/bookForm";
import { saveUploadedImage } from "@/lib/upload";

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

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  try {
    const id = Number(ctx.params.id);
    const book = await Book.findByPk(id);
    if (!book)
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 },
      );

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
          errors: parsed.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    // ubah image optional
    const image = form.get("image");
    let imageUrl = book.imageUrl;
    if (image instanceof File && image.size > 0) {
      const saved = await saveUploadedImage(image);
      imageUrl = saved.imageUrl;
    }

    await book.update({ ...parsed.data, imageUrl });
    return NextResponse.json({ ok: true, data: book });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { ok: false, message: errorMessage },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const book = await Book.findByPk(id);
  if (!book)
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );

  await book.destroy();
  return NextResponse.json({ ok: true });
}
