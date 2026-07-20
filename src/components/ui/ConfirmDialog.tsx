"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import "./ConfirmDialog.scss";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
  variant?: "danger" | "success";
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "Оставить заказ",
  loadingLabel,
  variant = "danger",
  isLoading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="confirm-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className={`confirm-dialog confirm-dialog--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button className="confirm-dialog-close" type="button" aria-label="Закрыть" disabled={isLoading} onClick={onClose}>×</button>
        <div className="confirm-dialog-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {variant === "success" ? (
              <path d="m5 12 4 4L19 6" />
            ) : (
              <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 10v6M14 10v6" /></>
            )}
          </svg>
        </div>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="secondary" disabled={isLoading} onClick={onClose} autoFocus>{cancelLabel}</button>
          <button type="button" className={variant} disabled={isLoading} onClick={onConfirm}>
            {isLoading ? loadingLabel || (variant === "danger" ? "Отменяем…" : "Обновляем…") : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
