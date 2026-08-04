import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useEscape, useLockBody } from '../../hooks';

/**
 * ხელმისაწვდომი modal:
 *  • Escape ხურავს
 *  • ფონზე დაწკაპუნება ხურავს
 *  • ფოკუსი რჩება modal-ის შიგნით (focus trap)
 */
export function Modal({ open, onClose, title, children, footer, size = '' }) {
  const ref = useRef(null);
  const lastFocused = useRef(null);

  useEscape(onClose, open);
  useLockBody(open);

  useEffect(() => {
    if (!open) return undefined;
    lastFocused.current = document.activeElement;
    const node = ref.current;
    const focusable = node?.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node?.addEventListener('keydown', onKeyDown);
    return () => {
      node?.removeEventListener('keydown', onKeyDown);
      lastFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'ფანჯარა'} ref={ref}>
        {title && (
          <div className="modal-head">
            <h3 className="modal-title">{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="დახურვა" style={{ width: 36, height: 36 }}>
              <X size={17} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** დადასტურების ფანჯარა (წაშლა და მსგავსი მოქმედებები) */
export function ConfirmDialog({ open, onClose, onConfirm, title = 'დარწმუნებული ხართ?', message, confirmLabel = 'დიახ, წაშალე', cancelLabel = 'გაუქმება', danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="modal-sm"
      footer={(
        <>
          <button className="btn btn-ghost" onClick={onClose}>{cancelLabel}</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </>
      )}
    >
      <div className="flex gap-14" style={{ alignItems: 'flex-start' }}>
        <AlertTriangle size={22} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
        <p className="text-soft">{message}</p>
      </div>
    </Modal>
  );
}
