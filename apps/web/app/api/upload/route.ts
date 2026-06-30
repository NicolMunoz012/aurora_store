// =============================================================================
// app/api/upload/route.ts — Image upload route handler (Req 16.3–16.6, 22.2)
// Requires ADMIN session. Validates file type and size before uploading.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUploadProvider } from "@/lib/upload/get-upload-provider";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  // 1. Authenticate as ADMIN (Req 16.3)
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Parse multipart form
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 3. Validate file type (Req 16.5)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Solo JPG, PNG o WebP." },
      { status: 422 },
    );
  }

  // 4. Validate file size (Req 16.5)
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el tamaño máximo de 2 MB." },
      { status: 422 },
    );
  }

  // 5. Upload via provider (Req 16.4)
  try {
    // Ensure the file object is a proper File with a name for the InsForge SDK.
    // Next.js formData() can return a Blob without a filename in some edge runtimes.
    const uploadFile =
      file.name && file.name !== "blob"
        ? file
        : new File([file], `upload-${Date.now()}.${file.type.split("/")[1] ?? "jpg"}`, {
            type: file.type,
          });

    const provider = getUploadProvider();
    const result = await provider.upload(uploadFile);
    return NextResponse.json({ url: result.url, key: result.key });
  } catch (err) {
    const insforgeErr = err as { statusCode?: number; error?: string; message?: string };
    console.error("[Upload Route] Error details:", {
      message: insforgeErr?.message,
      statusCode: insforgeErr?.statusCode,
      errorCode: insforgeErr?.error,
      fileName: (file as File).name,
      fileType: file.type,
      fileSize: file.size,
      raw: String(err),
    });
    const userMessage =
      insforgeErr?.statusCode === 404
        ? "El bucket de almacenamiento no existe. Verifica la configuración de InsForge."
        : insforgeErr?.statusCode === 401 || insforgeErr?.statusCode === 403
          ? "Sin permisos para subir archivos. Verifica INSFORGE_API_KEY."
          : "Error al subir el archivo. Intenta de nuevo.";
    return NextResponse.json(
      { error: userMessage },
      { status: 500 },
    );
  }
}
