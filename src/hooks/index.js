import { useCallback, useEffect, useRef, useState } from 'react';

export { useLocalStorage } from './useLocalStorage';

/** მნიშვნელობის დაყოვნება (ძიებისთვის) */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** ელემენტის გარეთ დაწკაპუნება */
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, active]);
}

/** Escape ღილაკი */
export function useEscape(handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') handler(e); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler, active]);
}

/** body-ს სქროლის დაბლოკვა (modal / drawer) */
export function useLockBody(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

/** უკუთვლა მოცემულ თარიღამდე */
export function useCountdown(targetDate) {
  const calc = useCallback(() => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (!targetDate || Number.isNaN(diff) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
    }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      finished: false,
    };
  }, [targetDate]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

/** სქროლის პოზიცია (header-ის სტილისთვის) */
export function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/** სქროლის პროგრესი 0..100 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return progress;
}

/** ხედვაში მოხვედრისას .is-visible კლასის დამატება */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll('.reveal');
    if (!nodes?.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  });
  return ref;
}

/** მედია მოთხოვნა */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/**
 * API მოთხოვნის ჩატვირთვის სტანდარტული სქემა:
 * loading / error / data + ხელახლა ცდის შესაძლებლობა.
 */
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!immediate) return undefined;
    let alive = true;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.resolve(fnRef.current(controller.signal))
      .then((data) => { if (alive) setState({ data, loading: false, error: null }); })
      .catch((err) => {
        if (!alive || err.name === 'AbortError') return;
        setState({ data: null, loading: false, error: err.message || 'დაფიქსირდა შეცდომა' });
      });

    return () => { alive = false; controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, immediate]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, retry };
}
