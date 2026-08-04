import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Compass } from 'lucide-react';
import { SafeImage } from '../ui/Primitives';

/** მთავარი გვერდის hero — პორტალი, ძიება და მოლივლივე ნივთები */
export function Hero({ floatingProducts = [], stats }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/catalog?q=${encodeURIComponent(query.trim())}` : '/catalog');
  };

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-portal" />
        <div className="hero-ring r1" />
        <div className="hero-ring r2" />
        <div className="hero-ring r3" />
        <div className="orb orb-violet orb-anim" style={{ width: 340, height: 340, top: '6%', left: '-6%' }} />
        <div className="orb orb-pink orb-anim" style={{ width: 300, height: 300, bottom: '2%', right: '-4%', animationDelay: '4s' }} />
        <div className="orb orb-blue orb-anim" style={{ width: 260, height: 260, top: '52%', left: '38%', animationDelay: '8s' }} />
      </div>

      {floatingProducts.slice(0, 5).map((p, i) => (
        <Link key={p.id} to={`/product/${p.slug}`} className={`hero-float f${i + 1}`} title={p.name} aria-label={p.name}>
          <SafeImage src={p.images?.[0]} alt={p.name} />
        </Link>
      ))}

      <div className="container hero-inner">
        <span className="eyebrow anim-fade-up">RelicVerse · ქართული ფენდომ-მაღაზია</span>

        <h1 className="hero-title anim-fade-up d-1">
          იპოვე ნივთები <span className="glow">შენი საყვარელი სამყაროებიდან</span>
        </h1>

        <p className="hero-sub anim-fade-up d-2">
          ფილმები, სერიალები, ანიმე და მულტფილმები — ერთი სამყაროს მიღმა.
        </p>

        <form className="hero-search anim-fade-up d-3" onSubmit={submit} role="search">
          <Search size={19} style={{ color: 'var(--violet-300)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="მოძებნე ფილმი, პერსონაჟი ან ნივთი..."
            aria-label="პროდუქტის ძიება"
          />
          <button type="submit" className="btn btn-primary">ძიება</button>
        </form>

        <div className="hero-actions anim-fade-up d-4">
          <Link to="/catalog" className="btn btn-primary btn-lg">
            <Sparkles size={17} /> კატალოგის ნახვა
          </Link>
          <Link to="/universes" className="btn btn-outline btn-lg">
            <Compass size={17} /> სამყაროების აღმოჩენა
          </Link>
        </div>

        {stats && (
          <div className="hero-stats anim-fade-up d-5">
            <div className="hero-stat">
              <div className="n">{stats.products}+</div>
              <div className="l">უნიკალური ნივთი</div>
            </div>
            <div className="hero-stat">
              <div className="n">{stats.universes}</div>
              <div className="l">სამყარო</div>
            </div>
            <div className="hero-stat">
              <div className="n">{stats.categories}</div>
              <div className="l">კატეგორია</div>
            </div>
            <div className="hero-stat">
              <div className="n">4.7★</div>
              <div className="l">საშუალო შეფასება</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
