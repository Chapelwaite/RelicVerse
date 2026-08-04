import { useState } from 'react';
import { Compass, UserRound, Gem, LibraryBig, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    id: 'world', icon: Compass, title: 'სამყარო',
    text: 'აირჩიე ისტორია, რომელიც გიყვარს.',
    color: '#a875ff',
  },
  {
    id: 'character', icon: UserRound, title: 'პერსონაჟი',
    text: 'იპოვე ნივთი, რომელიც მას გახსენებს.',
    color: '#63d1c0',
  },
  {
    id: 'relic', icon: Gem, title: 'რელიკვია',
    text: 'დაამატე შენი სამყაროს ნაწილი კალათაში.',
    color: '#f0abfc',
  },
  {
    id: 'collection', icon: LibraryBig, title: 'კოლექცია',
    text: 'შექმენი მოგონებების საკუთარი თარო.',
    color: '#e9c46a',
  },
];

/** Relic Trail — მარტივი, ემოციური მოგზაურობა 4 ნაბიჯად */
export function RelicTrail() {
  const [active, setActive] = useState(0);

  return (
    <section className="section-tight">
      <div className="container">
        <div className="relic-trail reveal">
          <div className="rt-head">
            <span className="eyebrow">როგორ მუშაობს</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.9rem)' }}>
              შენი გზა <span className="accent">რელიკვიამდე</span>
            </h2>
          </div>

          <ol className="rt-steps">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.id}
                  className={`rt-step${i === active ? ' is-active' : ''}`}
                  style={{ '--rt-color': step.color }}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  tabIndex={0}
                >
                  <span className="rt-icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  {i < STEPS.length - 1 && <ArrowRight size={16} className="rt-arrow" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
