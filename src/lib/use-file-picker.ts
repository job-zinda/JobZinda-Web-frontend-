"use client";

import { useCallback, useRef } from "react";

/** Opens a hidden file input and resolves with the chosen file (or null). */
export function useFilePicker() {
  const resolver = useRef<((f: File | null) => void) | null>(null);

  return useCallback((accept: string) => {
    return new Promise<File | null>((resolve) => {
      resolver.current = resolve;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.oncancel = () => resolve(null);
      input.click();
    });
  }, []);
}

export const MAX_UPLOAD_MB = 100;

export function tooLarge(file: File, mb = MAX_UPLOAD_MB) {
  return file.size > mb * 1024 * 1024;
}
