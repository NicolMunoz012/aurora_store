// =============================================================================
// apps/web/lib/upload/get-upload-provider.ts (Req 16.6)
// Selects concrete IUploadProvider based on UPLOAD_PROVIDER env var.
// =============================================================================

import type { IUploadProvider } from "./upload-provider.interface";
import { InsforgeUploadProvider } from "./insforge-upload-provider";

export function getUploadProvider(): IUploadProvider {
  const provider = process.env.UPLOAD_PROVIDER ?? "insforge";
  switch (provider) {
    case "insforge":
    default:
      return new InsforgeUploadProvider();
  }
}
