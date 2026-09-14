"use client";

import { useEffect, useRef, type RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const modalStack: symbol[] = [];
let previousBodyOverflow = "";

function visibleFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true" && element.getClientRects().length > 0,
  );
}

/**
 * Provides the keyboard behaviour expected from an ARIA modal:
 * initial focus, contained Tab navigation, Escape close, scroll locking, and
 * focus restoration. The stack prevents Escape from closing a parent dialog
 * when a second dialog is open above it.
 */
export function useModalAccessibility<T extends HTMLElement>({
  open = true,
  onClose,
  initialFocusRef,
}: {
  open?: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  const modalRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const token = Symbol("modal");
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalStack.push(token);
    if (modalStack.length === 1) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    const focusInitialElement = window.requestAnimationFrame(() => {
      const container = modalRef.current;
      if (!container || modalStack.at(-1) !== token) return;
      const target = initialFocusRef?.current || visibleFocusableElements(container)[0] || container;
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (modalStack.at(-1) !== token) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const container = modalRef.current;
      if (!container) return;
      const focusable = visibleFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(focusInitialElement);
      document.removeEventListener("keydown", onKeyDown, true);
      const stackIndex = modalStack.lastIndexOf(token);
      if (stackIndex >= 0) modalStack.splice(stackIndex, 1);
      if (modalStack.length === 0) document.body.style.overflow = previousBodyOverflow;
      window.requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      });
    };
  }, [initialFocusRef, open]);

  return modalRef;
}
