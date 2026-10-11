// ─── Modal ────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { classNames } from '../../utils/formatters';
import { Button } from './Button';

export const Modal = ({ open, isOpen, onClose, title, children, footer, size = 'md' }) => {
  // Accept both 'open' and 'isOpen' for compatibility
  const isVisible = open ?? isOpen ?? false;
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isVisible]);

  if (!isVisible) return null;

  const SIZES = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={classNames(
          'relative w-full bg-white rounded-2xl shadow-soft-xl animate-scale-in overflow-hidden',
          SIZES[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 id="modal-title" className="text-base font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirm dialog pattern
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading = false }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }
  >
    <p className="text-sm text-neutral-600">{message}</p>
  </Modal>
);
