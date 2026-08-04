import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ChevronRight, Cookie, Share2, Link2, Check, ShieldAlert } from 'lucide-react';
import { useScrollProgress } from '../../hooks';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../context/ToastContext';
import { Modal } from './Modal';

/* ─────────── სქროლის პროგრესი ─────────── */
export function ScrollProgress() {
  const progress = useScrollProgress();
  return <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />;
}

/* ─────────── ზემოთ დაბრუნება ─────────── */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;
  return (
    <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="გვერდის დასაწყისში დაბრუნება">
      <ArrowUp size={19} />
    </button>
  );
}

/* ─────────── Breadcrumbs ─────────── */
export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumbs" aria-label="ნავიგაციის გზა">
      <Link to="/">მთავარი</Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex-center gap-6">
          <ChevronRight size={13} className="sep" />
          {item.to && i < items.length - 1
            ? <Link to={item.to}>{item.label}</Link>
            : <span className="current">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ─────────── Cookie შეტყობინება ─────────── */
export function CookieNotice() {
  const [accepted, setAccepted] = useLocalStorage('relicverse_cookies', false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (accepted) return undefined;
    const id = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(id);
  }, [accepted]);

  if (accepted || !visible) return null;

  return (
    <div className="cookie-bar" role="region" aria-label="Cookie შეტყობინება">
      <Cookie size={22} style={{ color: 'var(--gold)', flexShrink: 0 }} />
      <span>
        ჩვენ ვიყენებთ cookie-ს, რომ RelicVerse შენზე მორგებული იყოს. საიტის გამოყენებით ეთანხმები ჩვენს{' '}
        <Link to="/privacy" style={{ color: 'var(--violet-300)', textDecoration: 'underline' }}>კონფიდენციალურობის პოლიტიკას</Link>.
      </span>
      <div className="cookie-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setVisible(false)}>მოგვიანებით</button>
        <button className="btn btn-primary btn-sm" onClick={() => setAccepted(true)}>თანხმობა</button>
      </div>
    </div>
  );
}

/* ─────────── გაზიარება / ბმულის კოპირება ─────────── */
export function ShareButton({ title, text, className = 'btn btn-ghost', compact = false }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; } catch { /* გაუქმდა — ვაკოპირებთ */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('ბმული დაკოპირდა');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error('ბმულის კოპირება ვერ მოხერხდა');
    }
  };

  return (
    <button className={className} onClick={share} aria-label="გაზიარება">
      {copied ? <Check size={16} /> : compact ? <Link2 size={16} /> : <Share2 size={16} />}
      {!compact && <span>{copied ? 'დაკოპირდა' : 'გაზიარება'}</span>}
    </button>
  );
}

/* ─────────── ასაკობრივი გაფრთხილება (18+) ─────────── */
export function AgeGate({ open, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="ასაკობრივი შეზღუდვა"
      size="modal-sm"
      footer={(
        <>
          <button className="btn btn-ghost" onClick={onCancel}>უკან დაბრუნება</button>
          <button className="btn btn-primary" onClick={onConfirm}>18 წელი შემისრულდა</button>
        </>
      )}
    >
      <div className="age-gate-icon"><ShieldAlert size={34} /></div>
      <p className="text-center text-soft">
        ეს განყოფილება შეიცავს საშინელებათა თემატიკის ნივთებს, რომლებიც შესაძლოა შემაშფოთებელი იყოს.
        გასაგრძელებლად დაადასტურე, რომ 18 წელს გადაცილებული ხარ.
      </p>
    </Modal>
  );
}
