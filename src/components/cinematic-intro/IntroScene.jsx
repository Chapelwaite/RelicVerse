import { useMemo } from 'react';
import { Portal } from './Portal';
import { FloatingRelics } from './FloatingRelics';
import { INTRO_TEXTS, PARTICLE_COUNT, DISSOLVE_COUNT } from './introTimelineConfig';
import runeCircleUrl from '../../assets/intro/rune-circle.svg';
import symbolUrl from '../../assets/intro/relicverse-symbol.svg';

/* wordmark ლათინურია — split('') უსაფრთხოა; ქართული ტექსტი ასოებად არ იყოფა */
const WORDMARK = 'RelicVerse'.split('');

/**
 * ქართული ტექსტის ხაზი mask-wrapper-ით:
 *  • გარე .ci-line-mask — overflow:hidden + საკმარისი padding, რომ
 *    ასოების ზედა/ქვედა ელემენტები არ მოიჭრას
 *  • შიდა .ci-line — თავად ტექსტი; ანიმაცია მხოლოდ transform/opacity/blur
 */
function IntroLine({ reg, id, position, size = '', children }) {
  return (
    <div className={`ci-line-mask ${position}`} ref={reg(`${id}Mask`)}>
      <p className={`ci-line ${size}`} ref={reg(id)}>{children}</p>
    </div>
  );
}

/** მტვრის ნაწილაკები */
function Dust({ reg, count }) {
  const particles = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.4,
      delay: -Math.random() * 22,
      dur: 15 + Math.random() * 18,
      opacity: 0.12 + Math.random() * 0.36,
      pink: i % 5 === 0,
    })),
    [count],
  );
  return (
    <div className="ci-dust" ref={reg('dust')} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={p.pink ? 'is-pink' : ''}
          style={{
            left: `${p.left}%`, top: `${p.top}%`,
            width: p.size, height: p.size, opacity: p.opacity,
            animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** ტექსტის „დაშლის" ნაწილაკები — ცენტრისკენ მიფრინავენ */
function Dissolve({ reg }) {
  const dots = useMemo(
    () => Array.from({ length: DISSOLVE_COUNT }, () => ({
      dx: (Math.random() - 0.5) * 340,
      dy: (Math.random() - 0.5) * 60,
      size: 2 + Math.random() * 3,
    })),
    [],
  );
  return (
    <div className="ci-dissolve" ref={reg('dissolve')} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          ref={reg(`diss-${i}`, 'dissDots')}
          style={{ '--dx': `${d.dx}px`, '--dy': `${d.dy}px`, width: d.size, height: d.size }}
        />
      ))}
    </div>
  );
}

/** Pinned სცენის სრული შემადგენლობა */
export function IntroScene({ reg, relics, isMobile }) {
  return (
    <>
      {/* ── ფონი ── */}
      <div className="ci-bg-base" ref={reg('bgBase')} aria-hidden="true" />
      <div className="ci-grain" aria-hidden="true" />
      <div className="ci-stars" ref={reg('stars')} aria-hidden="true" />
      <div className="ci-fog f1" ref={reg('fog1')} aria-hidden="true" />
      <div className="ci-fog f2" ref={reg('fog2')} aria-hidden="true" />
      <img className="ci-bg-rune" ref={reg('bgRune')} src={runeCircleUrl} alt="" aria-hidden="true" draggable="false" />

      {/* ── მშვიდი ფინალური ფონი ── */}
      <div className="ci-calm" ref={reg('calm')} aria-hidden="true" />

      <Dust reg={reg} count={isMobile ? PARTICLE_COUNT.mobile : PARTICLE_COUNT.desktop} />

      {/* ── ცენტრი: ნაპერწკალი, პორტალი, მოგონებების ნივთები ── */}
      <span className="ci-spark" ref={reg('spark')} aria-hidden="true" />
      <Portal reg={reg} />
      <FloatingRelics reg={reg} items={relics} />
      <Dissolve reg={reg} />

      <div className="ci-flash" ref={reg('flash')} aria-hidden="true" />

      {/* ── ტექსტები (mask reveal, ასოებად დაყოფის გარეშე) ── */}
      <IntroLine reg={reg} id="t1" position="ci-pos-center" size="ci-size-lg">{INTRO_TEXTS.t1}</IntroLine>
      <IntroLine reg={reg} id="t2" position="ci-pos-center">{INTRO_TEXTS.t2}</IntroLine>
      <IntroLine reg={reg} id="t3a" position="ci-pos-low">{INTRO_TEXTS.t3a}</IntroLine>
      <IntroLine reg={reg} id="t3b" position="ci-pos-low" size="ci-size-sm">{INTRO_TEXTS.t3b}</IntroLine>
      <IntroLine reg={reg} id="t4a" position="ci-pos-high">{INTRO_TEXTS.t4a}</IntroLine>
      <IntroLine reg={reg} id="t4b" position="ci-pos-high" size="ci-size-lg">{INTRO_TEXTS.t4b}</IntroLine>

      {/* ── ბრენდის ფინალი ── */}
      <div className="ci-brand" ref={reg('brandGroup')}>
        <img className="ci-brand-symbol" ref={reg('brandSymbol')} src={symbolUrl} alt="" aria-hidden="true" draggable="false" />
        <h2 className="ci-wordmark" aria-label="RelicVerse">
          <span className="ci-letters" aria-hidden="true">
            {WORDMARK.map((ch, i) => (
              <span key={i} className="ci-letter" ref={reg(`letter-${i}`, 'letters')}>{ch}</span>
            ))}
          </span>
        </h2>
        <div className="ci-line-mask ci-mask-static" ref={reg('brandTaglineMask')}>
          <p className="ci-line ci-size-sm ci-brand-tagline" ref={reg('brandTagline')}>„{INTRO_TEXTS.tagline}“</p>
        </div>
        <p className="ci-brand-triad" ref={reg('brandTriad')}>
          {INTRO_TEXTS.triad.map((word, i) => (
            <span key={word} ref={reg(`triad-${i}`, 'triad')}>
              {word}
              {i < INTRO_TEXTS.triad.length - 1 && <i aria-hidden="true"> • </i>}
            </span>
          ))}
        </p>
      </div>

      <div className="ci-final-glow" ref={reg('finalGlow')} aria-hidden="true" />
      <div className="ci-vignette" ref={reg('vignette')} aria-hidden="true" />

      {/* ── scroll მინიშნება ── */}
      <div className="ci-hint" ref={reg('hint')}>
        <span className="ci-hint-mouse" aria-hidden="true"><i /></span>
        {INTRO_TEXTS.scrollHint}
      </div>
    </>
  );
}
