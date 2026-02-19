export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { Category } from "@/models";
type Ctx = { params: Promise<{ id: string }> };

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi"),
});

function parseId(idRaw: string) {
  const n = Number(idRaw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json(
      { ok: false, message: "Invalid id" },
      { status: 400 },
    );
  }

  const row = await Category.findByPk(categoryId);
  if (!row) {
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, data: row });
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid id" },
        { status: 400 },
      );
    }

    const row = await Category.findByPk(categoryId);
    if (!row) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);

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

    await row.update({ name: parsed.data.name });

    return NextResponse.json({ ok: true, data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const categoryId = parseId(id);

    if (!categoryId) {
      return NextResponse.json(
        { ok: false, message: "Invalid id" },
        { status: 400 },
      );
    }

    const row = await Category.findByPk(categoryId);
    if (!row) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 },
      );
    }

    await row.destroy();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
