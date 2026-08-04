import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  magic: Sparkles,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((title, { type = 'success', description = '', duration = 3200 } = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((list) => [...list.slice(-3), { id, title, description, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const value = useMemo(() => ({
    toast: push,
    success: (title, description) => push(title, { type: 'success', description }),
    error: (title, description) => push(title, { type: 'error', description, duration: 4200 }),
    info: (title, description) => push(title, { type: 'info', description }),
    magic: (title, description) => push(title, { type: 'magic', description }),
    remove,
  }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <Icon size={18} className="toast-icon" />
              <div className="toast-body">
                <div className="toast-title">{t.title}</div>
                {t.description && <div className="toast-desc">{t.description}</div>}
              </div>
              <button className="toast-close" onClick={() => remove(t.id)} aria-label="დახურვა">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast უნდა გამოიყენოთ ToastProvider-ის შიგნით');
  return ctx;
}
