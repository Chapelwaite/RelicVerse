import { useState } from 'react';
import { Mail, Send, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../ui/Primitives';

/** Newsletter — ელფოსტა ინახება server/data/newsletter.json ფაილში */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('შეიყვანეთ სწორი ელფოსტა');
      return;
    }
    setLoading(true);
    try {
      const res = await api.subscribe(email.trim());
      toast.success(res.message);
      setEmail('');
    } catch (err) {
      setError(err.message);
      toast.error('დაფიქსირდა შეცდომა', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="newsletter reveal">
          <span className="badge" style={{ marginBottom: 14 }}><Sparkles size={12} /> RelicVerse Club</span>
          <h2 className="section-title" style={{ marginBottom: 8 }}>შემოგვიერთდი <span className="accent">RelicVerse-ში</span></h2>
          <p className="text-soft" style={{ maxWidth: '52ch', marginInline: 'auto' }}>
            მიიღე ინფორმაცია ახალ ნივთებზე, კოლექციებსა და ფასდაკლებებზე.
          </p>

          <form onSubmit={submit} noValidate>
            <input
              className={`input${error ? ' has-error' : ''}`}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="შენი ელფოსტა"
              aria-label="ელფოსტა"
              disabled={loading}
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Spinner /> : <Send size={16} />}
              გამოწერა
            </button>
          </form>

          {error && <p className="error-text" style={{ justifyContent: 'center', marginTop: 10 }}><Mail size={13} /> {error}</p>}
          <p className="text-xs text-dim mt-14">არ გამოვგზავნით სპამს. გამოწერის გაუქმება ნებისმიერ დროს შეგიძლია.</p>
        </div>
      </div>
    </section>
  );
}
