import { Link } from 'react-router-dom';

/**
 * RelicVerse-ის ლოგო — ჯადოსნური კრისტალი პორტალის რგოლში + ტექსტი.
 * ლოგოს შესაცვლელად საკმარისია ამ ფაილის რედაქტირება.
 */
export function LogoMark({ size = 40 }) {
  return (
    <span className="logo-mark" style={{ width: size, height: size }}>
      <span className="halo" />
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="rv-gem" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#f5f3ff" />
            <stop offset="42%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="24" rx="21" ry="8.5" stroke="#a78bfa" strokeOpacity=".55" strokeWidth="1.3" transform="rotate(-24 24 24)" />
        <ellipse cx="24" cy="24" rx="21" ry="8.5" stroke="#f0abfc" strokeOpacity=".3" strokeWidth="1.1" transform="rotate(28 24 24)" />
        <path d="M24 5 L34 19 L24 43 L14 19 Z" fill="url(#rv-gem)" />
        <path d="M24 5 L34 19 L24 43 Z" fill="#0a0616" fillOpacity=".2" />
        <path d="M14 19 H34" stroke="#f5f3ff" strokeOpacity=".5" strokeWidth="1" />
        <circle cx="38" cy="11" r="1.6" fill="#f0abfc" />
        <circle cx="9" cy="34" r="1.2" fill="#c4b5fd" fillOpacity=".85" />
      </svg>
    </span>
  );
}

export function Logo({ slogan = 'Fandom Relics Store', size = 40, to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="RelicVerse — მთავარი გვერდი">
      <LogoMark size={size} />
      <span className="logo-text">
        <span className="logo-name">RelicVerse</span>
        {slogan && <span className="logo-slogan">{slogan}</span>}
      </span>
    </Link>
  );
}
