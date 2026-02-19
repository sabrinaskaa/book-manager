import path from "path";
import fs from "fs/promises";

function getTime() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function preprocessingDefaultFileName(name: string) {
  // preprocessing nama file
  const base = name.replace(/\.[^/.]+$/, "");
  return base
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function saveUploadedImage(file: File) {
  // validasi mime
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(file.type)) {
    throw new Error("Format gambar harus JPG/PNG/WEBP.");
  }

  // limit size 5 MB
  const MAX = 5 * 1024 * 1024;
  if (file.size > MAX) {
    throw new Error("Ukuran gambar maksimal 5MB.");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await ensureDir(uploadsDir);

  const datePrefix = getTime();

  const originalName = file.name || "image";
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const base = preprocessingDefaultFileName(originalName) || "image";

  let filename = `${datePrefix}-${base}${ext}`;
  let fullPath = path.join(uploadsDir, filename);

  // if exists, add angka
  let i = 1;
  while (await fileExists(fullPath)) {
    filename = `${datePrefix}-${base}-${i}${ext}`;
    fullPath = path.join(uploadsDir, filename);
    i++;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(fullPath, buffer);

  const imageUrl = `/uploads/${filename}`;
  return { filename, imageUrl };
}
