import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscape, useLockBody } from '../../hooks';

/** გვერდითი პანელი — მობილურის მენიუსა და ფილტრებისთვის */
export function Drawer({ open, onClose, title, side = 'left', children, footer }) {
  useEscape(onClose, open);
  useLockBody(open);

  if (!open) return null;

  return createPortal(
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className={`drawer ${side === 'right' ? 'right' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <h3 style={{ fontSize: '1.02rem' }}>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="დახურვა" style={{ width: 36, height: 36 }}>
            <X size={17} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>,
    document.body,
  );
}
