// =============================================================================
// apps/web/lib/upload/insforge-upload-provider.ts
// InsForge Storage SDK implementation. Uses @insforge/sdk.
// Requires INSFORGE_API_BASE and INSFORGE_API_KEY in env.
// =============================================================================

import { createClient } from "@insforge/sdk";
import type { IUploadProvider } from "./upload-provider.interface";

export class InsforgeUploadProvider implements IUploadProvider {
  private readonly client;
  private readonly bucket: string;

  constructor() {
    const baseUrl =
      process.env.INSFORGE_API_BASE ?? "https://6rip9ut9.us-east.insforge.app";
    const apiKey = process.env.INSFORGE_API_KEY ?? "";
    this.bucket = process.env.INSFORGE_STORAGE_BUCKET ?? "product-images";

    this.client = createClient({
      baseUrl,
      anonKey: apiKey,
    });
  }

  async upload(file: File): Promise<{ url: string; key: string }> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .uploadAuto(file);

    if (error || !data) {
      throw new Error(
        `InsForge upload failed: ${error?.message ?? "Unknown error"}`,
      );
    }

    return { url: data.url, key: data.key };
  }
}
