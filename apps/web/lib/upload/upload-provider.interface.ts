// =============================================================================
// apps/web/lib/upload/upload-provider.interface.ts (Req 16.6)
// =============================================================================

export interface IUploadProvider {
  upload(file: File): Promise<{ url: string; key: string }>;
}
