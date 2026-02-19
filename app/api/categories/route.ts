export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Category } from "@/models";

export async function GET() {
  const rows = await Category.findAll({ order: [["name", "ASC"]] });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { ok: false, message: "Content-Type harus application/json" },
        { status: 415 },
      );
    }

    const body = await req.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { ok: false, message: "name wajib" },
        { status: 400 },
      );
    }

    const created = await Category.create({ name });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
