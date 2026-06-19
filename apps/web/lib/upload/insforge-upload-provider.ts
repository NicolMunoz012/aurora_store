// =============================================================================
// apps/web/lib/upload/insforge-upload-provider.ts (Req 16.6, 22.2)
// InsForge Storage implementation of IUploadProvider.
// Reads INSFORGE_STORAGE_BUCKET and INSFORGE_API_KEY from env.
// =============================================================================

import type { IUploadProvider } from "./upload-provider.interface";

export class InsforgeUploadProvider implements IUploadProvider {
  private readonly apiBase: string;
  private readonly bucket: string;
  private readonly apiKey: string;

  constructor() {
    this.apiBase =
      process.env.INSFORGE_API_BASE ?? "https://6rip9ut9.us-east.insforge.app";
    this.bucket = process.env.INSFORGE_STORAGE_BUCKET ?? "product-images";
    this.apiKey = process.env.INSFORGE_API_KEY ?? "";
  }

  async upload(file: File): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", this.bucket);

    const response = await fetch(`${this.apiBase}/storage/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`InsForge upload failed: ${response.status} ${text}`);
    }

    const json = (await response.json()) as { url: string; key: string };
    return { url: json.url, key: json.key };
  }
}
