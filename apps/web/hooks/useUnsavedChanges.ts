"use client";
// =============================================================================
// hooks/useUnsavedChanges.ts — Intercept navigation when there are unsaved changes
// =============================================================================

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useUnsavedChanges(
  isDirty: boolean,
  onConfirm: (href: string) => void,
) {
  // Warn on browser close / tab close
  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Return an interceptor for Link clicks
  const intercept = useCallback(
    (href: string) => {
      if (!isDirty) return true; // allow navigation
      onConfirm(href); // show custom dialog
      return false; // block navigation
    },
    [isDirty, onConfirm],
  );

  return { intercept };
}
