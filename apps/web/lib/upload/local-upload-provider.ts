// =============================================================================
// apps/web/lib/upload/local-upload-provider.ts
// Saves uploaded files to public/uploads/ for local dev and MVP.
// =============================================================================

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import type { IUploadProvider } from "./upload-provider.interface";

export class LocalUploadProvider implements IUploadProvider {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), "public", "uploads");
  }

  async upload(file: File): Promise<{ url: string; key: string }> {
    // Ensure upload directory exists
    await mkdir(this.uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(this.uploadDir, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const key = `uploads/${filename}`;
    const url = `/uploads/${filename}`;

    return { url, key };
  }
}
