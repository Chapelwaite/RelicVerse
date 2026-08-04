import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IntroScene } from './IntroScene';
import { IntroProgress } from './IntroProgress';
import { IntroSkipButton } from './IntroSkipButton';
import { IntroSoundToggle } from './IntroSoundToggle';
import { useIntroTimeline } from './useIntroTimeline';
import { INTRO_SEEN_KEY, MEMORY_RELICS, MEMORY_RELICS_MOBILE } from './introTimelineConfig';
import { useMediaQuery } from '../../hooks';
import symbolUrl from '../../assets/intro/relicverse-symbol.svg';
import './cinematic-intro.css';

const hasSeenIntro = () => {
  try { return sessionStorage.getItem(INTRO_SEEN_KEY) === 'true'; } catch { return false; }
};
const markSeen = () => {
  try { sessionStorage.setItem(INTRO_SEEN_KEY, 'true'); } catch { /* ignore */ }
};

/** მოკლე ვერსია — session-ში მეორედ შემოსვლისას ან reduced motion-ზე */
function ShortIntro() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setGone(true), 1500);
    return () => clearTimeout(id);
  }, []);
  if (gone) return null;
  return createPortal(
    <div className="ci-short" aria-hidden="true">
      <div className="ci-short-inner">
        <span className="ci-short-glow" />
        <img src={symbolUrl} alt="" draggable="false" />
        <strong>RelicVerse</strong>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Cinematic pinned-scroll intro.
 *
 * რეჟიმები:
 *  • full  — პირველი ვიზიტი session-ში: სრული scroll-driven timeline
 *  • short — უკვე ნანახია ან prefers-reduced-motion: მოკლე ლოგო-გადასვლა
 */
export function CinematicIntro() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mode] = useState(() => (hasSeenIntro() ? 'short' : 'full'));
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  const wrapperRef = useRef(null);
  const sceneRef = useRef(null);
  const nodes = useRef({});

  /** ref-რეესტრი: reg('name') ან reg('item-3', 'items') ჯგუფური სიისთვის */
  const reg = useCallback((name, group) => (el) => {
    if (!el) return;
    nodes.current[name] = el;
    if (group) {
      const idx = Number(name.split('-').pop());
      (nodes.current[group] ||= [])[idx] = el;
    }
  }, []);

  const relics = isMobile ? MEMORY_RELICS_MOBILE : MEMORY_RELICS;
  const fullMode = mode === 'full' && !reduced;

  const { skip, progressRef } = useIntroTimeline({
    wrapperRef,
    sceneRef,
    nodes,
    relics,
    isMobile,
    reduced: !fullMode,
    onPhase: setPhase,
    onDone: () => { markSeen(); setDone(true); },
  });

  // reduced-motion / short რეჟიმზეც ჩავთვალოთ ნანახად
  useEffect(() => { if (!fullMode) markSeen(); }, [fullMode]);

  // dev-რეჟიმის reset ინსტრუმენტი
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__rvResetIntro = () => {
      try { sessionStorage.removeItem(INTRO_SEEN_KEY); } catch { /* ignore */ }
      window.location.reload();
    };
    return () => { delete window.__rvResetIntro; };
  }, []);

  if (!fullMode) return reduced && mode === 'full' ? <ShortIntro /> : (mode === 'short' ? <ShortIntro /> : null);

  const handleSkip = () => {
    markSeen();
    skip();
  };

  return (
    <>
      <section
        className={`cinematic-intro${isMobile ? ' is-mobile' : ''}`}
        ref={wrapperRef}
        aria-label="RelicVerse — შესავალი"
      >
        <div className="ci-scene" ref={sceneRef}>
          <IntroScene reg={reg} relics={relics} isMobile={isMobile} />
        </div>
      </section>

      {/* Overlay UI — body-ში, რომ layout ანიმაციებმა fixed პოზიციები არ დაამახინჯოს */}
      {!done && createPortal(
        <div className="ci-ui">
          <IntroSoundToggle progressRef={progressRef} />
          <IntroSkipButton onSkip={handleSkip} />
          <IntroProgress reg={reg} activeStep={phase} />
        </div>,
        document.body,
      )}
    </>
  );
}
