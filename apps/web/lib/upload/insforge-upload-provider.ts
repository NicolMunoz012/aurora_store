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
    // Retry once on transient network failures (common in edge environments)
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .uploadAuto(file);

      if (data && !error) {
        return { url: data.url, key: data.key };
      }

      const message = error?.message ?? "Unknown error";
      const isRetryable =
        attempt < 2 &&
        (message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("timeout") ||
          message.toLowerCase().includes("econnreset") ||
          message.toLowerCase().includes("fetch"));

      if (isRetryable) {
        console.warn(`[InsforgeUpload] Attempt ${attempt} failed, retrying…`, message);
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      throw new Error(`InsForge upload failed: ${message}`);
    }

    throw new Error("InsForge upload failed after retries");
  }
}
