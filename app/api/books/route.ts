export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { Book, Category } from "@/models";
import { bookFormSchema } from "@/validations/bookForm";
import { saveUploadedImage } from "@/lib/upload";

const ALLOWED_SORT = new Set([
  "title",
  "author",
  "publisher",
  "publicationDate",
  "pages",
  "createdAt",
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const draw = Number(searchParams.get("draw") || 1);
  const start = Number(searchParams.get("start") || 0);
  const length = Number(searchParams.get("length") || 10);
  const searchValue = (searchParams.get("search[value]") || "").trim();

  // filter table
  const categoryId = searchParams.get("categoryId");
  const pubFrom = searchParams.get("pubDateFrom");
  const pubTo = searchParams.get("pubDateTo");

  // sorting
  const orderColIndex = searchParams.get("order[0][column]");
  const orderDirRaw = (
    searchParams.get("order[0][dir]") || "asc"
  ).toLowerCase();
  const orderDir = orderDirRaw === "desc" ? "DESC" : "ASC";

  const sortKey = orderColIndex
    ? searchParams.get(`columns[${orderColIndex}][data]`) || "createdAt"
    : "createdAt";
  const sortBy = ALLOWED_SORT.has(sortKey) ? sortKey : "createdAt";

  const where: any = {};

  if (categoryId) where.categoryId = Number(categoryId);

  if (pubFrom || pubTo) {
    if (pubFrom && pubTo)
      where.publicationDate = { [Op.between]: [pubFrom, pubTo] };
    else if (pubFrom) where.publicationDate = { [Op.gte]: pubFrom };
    else if (pubTo) where.publicationDate = { [Op.lte]: pubTo };
  }

  if (searchValue) {
    where[Op.or] = [
      { title: { [Op.like]: `%${searchValue}%` } },
      { author: { [Op.like]: `%${searchValue}%` } },
      { publisher: { [Op.like]: `%${searchValue}%` } },
    ];
  }

  const recordsTotal = await Book.count();
  const recordsFiltered = await Book.count({ where });

  const rows = await Book.findAll({
    where,
    include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
    order: [[sortBy, orderDir]],
    offset: start,
    limit: length,
  });

  const data = rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    author: r.author,
    publisher: r.publisher,
    publicationDate: r.publicationDate,
    pages: r.pages,
    categoryId: r.categoryId,
    categoryName: r.category?.name ?? "-",
    imageUrl: r.imageUrl,
  }));

  return NextResponse.json({ draw, recordsTotal, recordsFiltered, data });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const raw = {
      title: String(form.get("title") ?? ""),
      author: String(form.get("author") ?? ""),
      publicationDate: String(form.get("publicationDate") ?? ""),
      publisher: String(form.get("publisher") ?? ""),
      pages: String(form.get("pages") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
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

    const image = form.get("image");
    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Field 'image' wajib diupload (multipart/form-data).",
        },
        { status: 400 },
      );
    }

    // save ke uploads
    const { imageUrl } = await saveUploadedImage(image);

    // simpan ke DB
    const created = await Book.create({
      ...parsed.data,
      imageUrl,
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
