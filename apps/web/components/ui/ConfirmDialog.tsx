"use client";
// =============================================================================
// components/ui/ConfirmDialog.tsx — Custom confirmation dialog
// =============================================================================

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-up" style={{ animationDuration: "0.15s" }} onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-white rounded-md shadow-2xl p-6 animate-fade-up" style={{ animationDuration: "0.2s" }}>
        <h2 className="font-serif text-xl text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[12px] tracking-luxe font-semibold text-gray-500 border border-gray-200 rounded-sm hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-[12px] tracking-luxe font-semibold text-white rounded-sm transition-colors ${
              destructive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-cerise-600 hover:bg-cerise-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
