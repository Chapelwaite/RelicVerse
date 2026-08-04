import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { INTRO_LABELS, PROGRESS_STEPS, TEXT_WINDOWS } from './introTimelineConfig';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const BODY_HIDE = 'rv-intro-hide';
const BODY_REVEAL = 'rv-intro-reveal';

/**
 * Pinned scroll cinematic timeline v2.
 *
 * ქართული ტექსტის წესები:
 *  • ტექსტი ასოებად არასდროს იყოფა (split('') აკრძალულია ქართულზე)
 *  • ანიმაცია: mask reveal (შიდა ხაზის yPercent) + blur-to-clear + fade
 *  • letterSpacing / clipPath / scale ტექსტზე არ იტვინება — რეფლოუ და
 *    ასოების მოჭრა გამორიცხულია
 *  • timeline იქმნება მხოლოდ document.fonts.ready-ს შემდეგ, შემდეგ
 *    ScrollTrigger.refresh() — ზომები ზუსტი ფონტითაა გაზომილი
 *  • gsap.context + სრული cleanup → StrictMode-ში დუბლი არ ჩნდება
 */
export function useIntroTimeline({ wrapperRef, sceneRef, nodes, relics, isMobile, reduced, onPhase, onDone }) {
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const stRef = useRef(null);

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const wrapper = wrapperRef.current;
    const scene = sceneRef.current;
    if (!wrapper || !scene) return undefined;

    let cancelled = false;
    let ctx = null;
    let removeParallax = null;

    document.body.classList.add(BODY_HIDE);

    const n = nodes.current;
    const el = (key) => n[key] || null;

    const headerTarget = () => {
      const mark = document.querySelector('.header .logo-mark');
      if (!mark) return { x: -window.innerWidth * 0.36, y: -window.innerHeight * 0.42 };
      const r = mark.getBoundingClientRect();
      return { x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 };
    };

    const setBodyClasses = (p) => {
      const body = document.body;
      if (p < INTRO_LABELS['site-transition'] - 0.02) {
        body.classList.add(BODY_HIDE);
        body.classList.remove(BODY_REVEAL);
      } else if (p < 0.995) {
        body.classList.remove(BODY_HIDE);
        body.classList.add(BODY_REVEAL);
      } else {
        body.classList.remove(BODY_HIDE, BODY_REVEAL);
      }
      scene.classList.toggle('is-done', p >= 0.985);
    };

    const handleProgress = (p) => {
      progressRef.current = p;
      setBodyClasses(p);
      const step = PROGRESS_STEPS.findIndex((s) => p <= s.until);
      onPhase?.(step === -1 ? PROGRESS_STEPS.length - 1 : step);
      const fill = el('progressFill');
      if (fill) fill.style.transform = `scaleY(${p})`;
      if (p >= 0.995 && !doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
    };

    /* ─── ქართული ხაზის mask reveal (საერთო helper) ─── */
    const lineIn = (tl, id, at, dur) => {
      tl.fromTo(el(`${id}Mask`), { autoAlpha: 0 }, { autoAlpha: 1, duration: dur * 0.5, ease: 'none' }, at);
      tl.fromTo(el(id),
        { yPercent: 118, filter: 'blur(7px)' },
        { yPercent: 0, filter: 'blur(0px)', duration: dur, ease: 'power2.out' }, at);
    };
    const lineOut = (tl, id, at, dur) => {
      tl.to(el(id), { yPercent: -112, filter: 'blur(6px)', duration: dur, ease: 'power2.in' }, at);
      tl.to(el(`${id}Mask`), { autoAlpha: 0, duration: dur * 0.7, ease: 'none' }, at + dur * 0.3);
    };
    const textWindow = (tl, id) => {
      const [inAt, inDur, outAt, outDur] = TEXT_WINDOWS[id];
      lineIn(tl, id, inAt, inDur);
      lineOut(tl, id, outAt, outDur);
    };

    const build = () => {
      if (cancelled || !wrapperRef.current) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => handleProgress(self.progress),
            onRefresh: (self) => handleProgress(self.progress),
          },
        });
        stRef.current = tl.scrollTrigger;

        // ეტიკეტები — მთელი სცენარი წაკითხვადია labels-ით
        Object.entries(INTRO_LABELS).forEach(([label, pos]) => tl.addLabel(label, pos));

        /* ═════════ სცენა 1 · ფილმის შემდეგ დარჩენილი სიჩუმე ═════════ */
        tl.fromTo(el('spark'), { scale: 0.35, opacity: 0.12 }, { scale: 1, opacity: 1, duration: 0.09 }, 'intro-start');
        tl.fromTo(el('bgRune'), { opacity: 0.03, rotate: -8 }, { opacity: 0.09, rotate: 6, duration: 0.4 }, 'intro-start');
        tl.to(el('fog1'), { opacity: 0.48, duration: 0.14 }, 'intro-start');
        tl.to(el('fog2'), { opacity: 0.32, duration: 0.14 }, 0.02);

        // ტექსტი 1 — და მისი „დაშლა" ნაწილაკებად
        textWindow(tl, 't1');
        tl.set(el('dissolve'), { autoAlpha: 1 }, 0.116);
        (n.dissDots || []).forEach((dot, i) => {
          tl.fromTo(dot,
            { x: () => parseFloat(dot.style.getPropertyValue('--dx')), y: () => parseFloat(dot.style.getPropertyValue('--dy')), autoAlpha: 0 },
            { autoAlpha: 0.9, duration: 0.008, ease: 'none' }, 0.116 + (i % 4) * 0.002);
          tl.to(dot, { x: 0, y: 0, autoAlpha: 0, duration: 0.034, ease: 'power2.in' }, 0.126 + (i % 4) * 0.002);
        });
        tl.set(el('dissolve'), { autoAlpha: 0 }, 0.17);

        // ტექსტი 2
        textWindow(tl, 't2');

        // scroll მინიშნება ქრება
        tl.to(el('hint'), { autoAlpha: 0, y: 16, duration: 0.03 }, 0.19);
        // ნაპერწკალი მიინავლება — ადგილს მოგონებებს უთმობს
        tl.to(el('spark'), { scale: 0.5, opacity: 0.25, duration: 0.06 }, 0.22);

        /* ═════════ სცენა 2 · მოგონებების გამოჩენა ═════════ */
        const radius = () => Math.min(window.innerWidth, window.innerHeight) * (isMobile ? 0.3 : 0.3);
        relics.forEach((item, i) => {
          const node = el(`sil-${i}`);
          if (!node) return;
          const rad = (item.angle * Math.PI) / 180;
          const fx = () => Math.cos(rad) * radius();
          const fy = () => Math.sin(rad) * radius();
          const startBlur = item.depth === 'bg' ? 14 : item.depth === 'fg' ? 10 : 12;

          // ჯერ მხოლოდ ბუნდოვანი კონტური შორიდან…
          tl.fromTo(node,
            { x: () => fx() * 1.3, y: () => fy() * 1.3, autoAlpha: 0, scale: 0.7, filter: `blur(${startBlur}px) saturate(.4)` },
            { x: fx, y: fy, autoAlpha: 0.42, scale: 0.88, filter: `blur(${startBlur * 0.55}px) saturate(.6)`, duration: 0.075, ease: 'power1.out' },
            0.285 + i * 0.012);
          // …სქროლისას თანდათან მკაფიოვდება
          tl.to(node, {
            autoAlpha: item.depth === 'bg' ? 0.62 : 0.92,
            scale: 1,
            filter: `blur(${item.depth === 'bg' ? 4 : item.depth === 'fg' ? 1 : 2}px) saturate(1)`,
            duration: 0.1,
            ease: 'power1.inOut',
          }, 0.4 + i * 0.006);
        });

        textWindow(tl, 't3a');
        textWindow(tl, 't3b');

        /* ═════════ სცენა 3 · ნივთები ერთმანეთს პოულობს (ორბიტა) ═════════ */
        const orbitDeg = 46;
        tl.to(el('silStage'), { rotate: orbitDeg, duration: 0.19, ease: 'power1.inOut' }, 'relics-orbit');
        relics.forEach((item, i) => {
          const node = el(`sil-${i}`);
          const trail = el(`trail-${i}`);
          if (!node) return;
          // counter-rotation — ნივთები სწორად რჩება
          tl.to(node, { rotate: -orbitDeg, duration: 0.19, ease: 'power1.inOut' }, 'relics-orbit');
          if (trail) {
            tl.fromTo(trail, { autoAlpha: 0, scaleX: 0.4 }, { autoAlpha: 0.85, scaleX: 1, duration: 0.05, ease: 'power1.out' }, 0.478 + i * 0.005);
          }
        });

        textWindow(tl, 't4a');
        textWindow(tl, 't4b');

        /* ═════════ სცენა 4 · light trails → პორტალი ═════════ */
        tl.fromTo(el('portalRunes'),
          { autoAlpha: 0, scale: 0.55, rotate: -30 },
          { autoAlpha: 0.85, scale: 1, rotate: 0, duration: 0.05, ease: 'power1.out' }, 'portal-build');
        tl.fromTo(el('ringOuter'),
          { autoAlpha: 0, scale: 0.5, rotate: -34 },
          { autoAlpha: 1, scale: 1, rotate: 12, duration: 0.055, ease: 'power1.out' }, 0.665);
        tl.fromTo(el('ringMid'),
          { autoAlpha: 0, scale: 0.42, rotate: 40 },
          { autoAlpha: 1, scale: 1, rotate: -16, duration: 0.055, ease: 'power1.out' }, 0.685);
        tl.to(el('ringOuter'), { rotate: 55, duration: 0.3 }, 0.72);
        tl.to(el('ringMid'), { rotate: -62, duration: 0.3 }, 0.72);

        tl.fromTo(el('portalCore'),
          { autoAlpha: 0, scale: 0.24 },
          { autoAlpha: 1, scale: 1, duration: 0.07, ease: 'power2.out' }, 0.71);
        tl.fromTo(el('portalWorld'), { autoAlpha: 0, scale: 1.35 }, { autoAlpha: 1, scale: 1, duration: 0.05 }, 0.745);

        // ნივთები ტრაექტორიით ცენტრში იკრიბება — მათი შუქი პორტალად იქცევა
        tl.to(el('silStage'), { rotate: orbitDeg + 30, duration: 0.12, ease: 'power2.in' }, 0.7);
        relics.forEach((item, i) => {
          const node = el(`sil-${i}`);
          const trail = el(`trail-${i}`);
          if (!node) return;
          tl.to(node, { x: 0, y: 0, scale: 0.14, autoAlpha: 0, rotate: -(orbitDeg + 30), duration: 0.085, ease: 'power2.in' }, 0.705 + i * 0.006);
          if (trail) tl.to(trail, { autoAlpha: 0, duration: 0.04 }, 0.73 + i * 0.004);
        });
        tl.fromTo(el('flash'), { opacity: 0 }, { opacity: 0.75, duration: 0.014, ease: 'power1.in' }, 0.775);
        tl.to(el('flash'), { opacity: 0, duration: 0.024 }, 0.792);
        tl.to(el('spark'), { opacity: 0, duration: 0.03 }, 0.7);
        tl.to(el('bgRune'), { opacity: 0, duration: 0.05 }, 0.72);

        /* ═════════ სცენა 5 · RelicVerse ═════════ */
        tl.fromTo(el('calm'), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.78);
        tl.to([el('fog1'), el('fog2')], { opacity: 0.16, duration: 0.06 }, 0.78);

        tl.fromTo(el('brandSymbol'),
          { autoAlpha: 0, scale: 0.35, y: 12, filter: 'blur(8px)' },
          { autoAlpha: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.04, ease: 'power2.out' }, 'brand-reveal');

        // wordmark — ლათინური ასოები (ქართული ასოებად არ იყოფა)
        (n.letters || []).forEach((letter, i) => {
          tl.fromTo(letter,
            { autoAlpha: 0, y: 24, filter: 'blur(6px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.022, ease: 'power1.out' },
            0.818 + i * 0.0048);
        });
        // სინათლის ტალღა ასოებში
        (n.letters || []).forEach((letter, i) => {
          const at = 0.862 + i * 0.0038;
          tl.to(letter, { filter: 'blur(0px) brightness(2.1)', duration: 0.006, ease: 'power1.in' }, at);
          tl.to(letter, { filter: 'blur(0px) brightness(1)', duration: 0.009, ease: 'power1.out' }, at + 0.007);
        });

        // tagline — იგივე mask reveal
        tl.fromTo(el('brandTaglineMask'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.014 }, 0.856);
        tl.fromTo(el('brandTagline'),
          { yPercent: 118, filter: 'blur(6px)' },
          { yPercent: 0, filter: 'blur(0px)', duration: 0.026, ease: 'power2.out' }, 0.856);

        (n.triad || []).forEach((word, i) => {
          tl.fromTo(word, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.016 }, 0.878 + i * 0.006);
        });

        tl.fromTo(el('finalGlow'), { opacity: 0 }, { opacity: 0.55, duration: 0.05 }, 0.82);

        /* ═════════ სცენა 6 · portal საიტად გარდაიქმნება ═════════ */
        tl.to(el('brandTriad'), { autoAlpha: 0, y: -22, duration: 0.026 }, 'site-transition');
        tl.to(el('brandTaglineMask'), { autoAlpha: 0, y: -20, duration: 0.026 }, 0.906);

        tl.to(el('brandGroup'), {
          x: () => headerTarget().x,
          y: () => headerTarget().y,
          scale: 0.2,
          autoAlpha: 0,
          duration: 0.07,
          ease: 'power1.in',
        }, 0.918);

        // პორტალის ნათება ნელა დნება Hero-ს ფონში
        tl.to(el('portal'), { scale: 1.55, autoAlpha: 0, duration: 0.075, ease: 'power1.in' }, 0.9);
        tl.to([el('calm'), el('bgBase'), el('stars')], { opacity: 0, duration: 0.06 }, 0.916);
        tl.to([el('fog1'), el('fog2'), el('dust')], { opacity: 0, duration: 0.05 }, 0.912);
        tl.to(el('finalGlow'), { opacity: 0, duration: 0.05 }, 0.945);
        tl.to(el('vignette'), { opacity: 0, duration: 0.05 }, 0.935);
        tl.to(scene, { autoAlpha: 0, duration: 0.026, ease: 'none' }, 0.974);
      }, wrapper);

      /* ─── Mouse parallax (მხოლოდ desktop) ─── */
      if (!isMobile && window.matchMedia('(hover: hover)').matches) {
        const targets = [
          [el('silStage'), 10], [el('portalWorld'), 8], [el('fog1'), 18],
          [el('dust'), 7], [el('brandGroup'), 5],
        ].filter(([node]) => node);
        const setters = targets.map(([node, f]) => ({
          x: gsap.quickTo(node, 'xPercent', { duration: 0.9, ease: 'power2.out' }),
          y: gsap.quickTo(node, 'yPercent', { duration: 0.9, ease: 'power2.out' }),
          f,
        }));
        const onMove = (e) => {
          const dx = e.clientX / window.innerWidth - 0.5;
          const dy = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => { s.x(dx * s.f * 0.4); s.y(dy * s.f * 0.4); });
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        removeParallax = () => window.removeEventListener('mousemove', onMove);
      }

      handleProgress(stRef.current?.progress ?? 0);
    };

    /* ფონტების ჩატვირთვას ველოდებით — ზომები რომ სწორად გაიზომოს */
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        build();
        requestAnimationFrame(() => { if (!cancelled) ScrollTrigger.refresh(); });
      });
    } else {
      build();
    }

    return () => {
      cancelled = true;
      removeParallax?.();
      ctx?.revert();
      stRef.current = null;
      document.body.classList.remove(BODY_HIDE, BODY_REVEAL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, reduced]);

  /** „Intro-ს გამოტოვება" */
  const skip = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const endY = window.scrollY + rect.top + wrapper.offsetHeight - window.innerHeight;

    const htmlStyle = document.documentElement.style;
    const prevBehavior = htmlStyle.scrollBehavior;
    htmlStyle.scrollBehavior = 'auto';

    gsap.to(window, {
      scrollTo: { y: endY, autoKill: false },
      duration: 1.05,
      ease: 'power2.inOut',
      onComplete: () => {
        htmlStyle.scrollBehavior = prevBehavior;
        const main = document.getElementById('main');
        if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
      },
    });
  };

  return { skip, progressRef };
}
