"use client";
// =============================================================================
// components/ui/LegalModal.tsx — Premium legal modal with scroll body
// =============================================================================

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function LegalModal({ open, onClose, title, children }: LegalModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-up"
        style={{ animationDuration: "0.2s" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-[95vw] max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-md shadow-2xl animate-fade-up"
        style={{ animationDuration: "0.3s" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header — always visible */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 id="legal-modal-title" className="font-serif text-2xl text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-full text-gray-400 hover:text-cerise-600 hover:bg-cerise-50 transition-colors"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-cerise-600 text-white py-3 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
