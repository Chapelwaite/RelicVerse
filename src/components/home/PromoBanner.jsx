import { Link } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import { useCountdown } from '../../hooks';

const UNITS = [
  { key: 'days', label: 'დღე' },
  { key: 'hours', label: 'საათი' },
  { key: 'minutes', label: 'წუთი' },
  { key: 'seconds', label: 'წამი' },
];

/** აქციის ბანერი უკუთვლით */
export function PromoBanner({ banner }) {
  const time = useCountdown(banner?.endsAt);
  if (!banner?.active) return null;

  return (
    <section className="section-tight">
      <div className="container">
        <div className="promo-banner reveal">
          <span className="badge badge-sale" style={{ marginBottom: 14 }}>
            <Flame size={12} /> შეზღუდული დროით
          </span>
          <h2 className="pb-title">{banner.title}</h2>
          <p className="pb-sub">{banner.subtitle}</p>

          {!time.finished ? (
            <div className="countdown">
              {UNITS.map((u) => (
                <div key={u.key} className="cd-unit">
                  <div className="cd-n">{String(time[u.key]).padStart(2, '0')}</div>
                  <div className="cd-l">{u.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ margin: '22px 0' }}>აქციის დრო ამოიწურა — მალე ახალი დაიწყება.</p>
          )}

          <Link to="/sale" className="btn btn-primary btn-lg">
            ფასდაკლებული ნივთების ნახვა <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
