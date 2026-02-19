export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Category } from "@/models";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const row = await Category.findByPk(id);
  if (!row)
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );
  return NextResponse.json({ ok: true, data: row });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const row = await Category.findByPk(id);
  if (!row)
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );

  const body = await req.json();
  const name = body?.name !== undefined ? String(body.name).trim() : row.name;

  if (!name)
    return NextResponse.json(
      { ok: false, message: "name wajib" },
      { status: 400 },
    );

  await row.update({ name });
  return NextResponse.json({ ok: true, data: row });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const row = await Category.findByPk(id);
  if (!row)
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404 },
    );

  await row.destroy();
  return NextResponse.json({ ok: true });
}
