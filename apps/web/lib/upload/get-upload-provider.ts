// =============================================================================
// apps/web/lib/upload/get-upload-provider.ts
// Selects concrete IUploadProvider based on UPLOAD_PROVIDER env var.
// Default: "insforge" (cloud storage via InsForge SDK).
// =============================================================================

import type { IUploadProvider } from "./upload-provider.interface";
import { InsforgeUploadProvider } from "./insforge-upload-provider";
import { LocalUploadProvider } from "./local-upload-provider";

export function getUploadProvider(): IUploadProvider {
  const provider = process.env.UPLOAD_PROVIDER ?? "insforge";

  switch (provider) {
    case "local":
      return new LocalUploadProvider();
    case "insforge":
    default:
      return new InsforgeUploadProvider();
  }
}
