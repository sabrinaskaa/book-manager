import path from "path";
import fs from "fs/promises";

function isLocalUploadUrl(imageUrl: string) {
  return typeof imageUrl === "string" && imageUrl.startsWith("/uploads/");
}

function toUploadsAbsolutePath(imageUrl: string) {
  const filename = path.basename(imageUrl);
  return path.join(process.cwd(), "public", "uploads", filename);
}

export async function deleteUploadedImageByUrl(imageUrl: string) {
  if (!isLocalUploadUrl(imageUrl)) return;

  const abs = toUploadsAbsolutePath(imageUrl);

  try {
    await fs.unlink(abs);
  } catch (e) {
    if ((e as any)?.code === "ENOENT") return;
    throw e;
  }
}
