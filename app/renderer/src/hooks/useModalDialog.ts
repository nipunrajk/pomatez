import { useEffect, useRef } from "react";

/**
 * Drives a native <dialog> from React state: opens it modally when `open`
 * turns true (the browser traps focus and handles Esc via onCancel) and,
 * on close, returns focus to whatever opened it if still on the page.
 */
export const useModalDialog = (open: boolean) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      if (openerRef.current?.isConnected) openerRef.current.focus();
    }
  }, [open]);

  return dialogRef;
};
