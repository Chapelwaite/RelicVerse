import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogoMark } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Primitives';

/** შესვლა და რეგისტრაცია — ერთი კომპონენტი, ორი რეჟიმი */
export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = () => {
    const e = {};
    if (!isLogin) {
      if (form.firstName.trim().length < 2) e.firstName = 'სახელი სავალდებულოა';
      if (form.lastName.trim().length < 2) e.lastName = 'გვარი სავალდებულოა';
      if (form.password !== form.confirm) e.confirm = 'პაროლები არ ემთხვევა';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'ელფოსტის ფორმატი არასწორია';
    if (form.password.length < 6) e.password = 'პაროლი მინიმუმ 6 სიმბოლო';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) await login({ email: form.email.trim(), password: form.password });
      else await register({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), password: form.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors(err.errors || {});
      toast.error(isLogin ? 'შესვლა ვერ მოხერხდა' : 'რეგისტრაცია ვერ მოხერხდა', err.message);
    } finally {
      setLoading(false);
    }
  };

  const err = (key) => (errors[key] ? <span className="error-text"><AlertCircle size={12} /> {errors[key]}</span> : null);
  const cls = (key) => `input${errors[key] ? ' has-error' : ''}`;

  return (
    <div className="container auth-wrap">
      <div className="panel panel-pad auth-card anim-scale-in">
        <div className="text-center mb-20">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><LogoMark size={52} /></div>
          <h1 style={{ fontSize: '1.4rem' }}>{isLogin ? 'კეთილი იყოს შენი დაბრუნება' : 'შემოგვიერთდი RelicVerse-ში'}</h1>
          <p className="text-muted text-sm mt-8">
            {isLogin ? 'შედი ანგარიშში შეკვეთების სანახავად' : 'შექმენი ანგარიში და შეინახე შენი საყვარელი ნივთები'}
          </p>
        </div>

        <form onSubmit={submit} noValidate>
          {!isLogin && (
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="firstName">სახელი <span className="req">*</span></label>
                <input id="firstName" className={cls('firstName')} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
                {err('firstName')}
              </div>
              <div className="field">
                <label className="label" htmlFor="lastName">გვარი <span className="req">*</span></label>
                <input id="lastName" className={cls('lastName')} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
                {err('lastName')}
              </div>
            </div>
          )}

          <div className="field">
            <label className="label" htmlFor="email">ელფოსტა <span className="req">*</span></label>
            <input id="email" type="email" className={cls('email')} value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
            {err('email')}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">პაროლი <span className="req">*</span></label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={cls('password')}
                value={form.password}
                onChange={set('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err('password')}
          </div>

          {!isLogin && (
            <div className="field">
              <label className="label" htmlFor="confirm">გაიმეორე პაროლი <span className="req">*</span></label>
              <input id="confirm" type="password" className={cls('confirm')} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
              {err('confirm')}
            </div>
          )}

          <button className="btn btn-primary btn-block btn-lg mt-14" type="submit" disabled={loading}>
            {loading ? <Spinner /> : isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}
            {isLogin ? 'შესვლა' : 'რეგისტრაცია'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-20">
          {isLogin ? 'ჯერ არ გაქვს ანგარიში? ' : 'უკვე გაქვს ანგარიში? '}
          <Link to={isLogin ? '/register' : '/login'} style={{ color: 'var(--violet-300)', fontWeight: 700 }}>
            {isLogin ? 'დარეგისტრირდი' : 'შედი'}
          </Link>
        </p>

        {isLogin && (
          <div className="mt-20" style={{ padding: 14, borderRadius: 'var(--r-md)', background: 'rgba(139,92,246,.1)', border: '1px dashed var(--border-hi)' }}>
            <div className="flex-center gap-8 mb-8"><Sparkles size={14} style={{ color: 'var(--gold)' }} /><b className="text-sm">დემო ადმინისტრატორი</b></div>
            <div className="text-xs text-muted">admin@relicverse.ge / RelicAdmin2026!</div>
          </div>
        )}
      </div>
    </div>
  );
}
