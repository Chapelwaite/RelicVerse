import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * ატმოსფერული ხმის ჩართვა/გამორთვა.
 * აუდიო ფაილები არ გვჭირდება — WebAudio API აგენერირებს ძალიან ჩუმ,
 * დაბალი სიხშირის ambient drone-ს. თუ AudioContext მიუწვდომელია,
 * ღილაკი უბრალოდ disabled ხდება (console error-ის გარეშე).
 */
export function IntroSoundToggle({ progressRef }) {
  const [on, setOn] = useState(false);
  const [supported, setSupported] = useState(true);
  const engineRef = useRef(null);
  const rafRef = useRef(0);

  // scroll progress-ზე რეაგირება — ფილტრის სიხშირე ნელა იხსნება
  useEffect(() => {
    if (!on) return undefined;
    const tick = () => {
      const eng = engineRef.current;
      if (eng?.filter) {
        const p = progressRef?.current ?? 0;
        eng.filter.frequency.value = 220 + p * 900;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [on, progressRef]);

  // გამორთვა/გასუფთავება unmount-ისას
  useEffect(() => () => {
    const eng = engineRef.current;
    if (eng) {
      try {
        eng.master.gain.cancelScheduledValues(0);
        eng.master.gain.value = 0;
        eng.ctx.close();
      } catch { /* ignore */ }
      engineRef.current = null;
    }
  }, []);

  const buildEngine = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();

    const master = ctx.createGain();
    master.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 0.6;

    // ორი ოდნავ განსხვავებული ტონი — მშვიდი "космический" drone
    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 55;
    const oscB = ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.value = 55.6;
    const oscC = ctx.createOscillator();
    oscC.type = 'triangle';
    oscC.frequency.value = 110.4;
    const gainC = ctx.createGain();
    gainC.gain.value = 0.22;

    // ნელი "სუნთქვის" LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.006;
    lfo.connect(lfoGain).connect(master.gain);

    oscA.connect(filter);
    oscB.connect(filter);
    oscC.connect(gainC).connect(filter);
    filter.connect(master).connect(ctx.destination);

    oscA.start(); oscB.start(); oscC.start(); lfo.start();
    return { ctx, master, filter };
  };

  const toggle = async () => {
    try {
      if (!engineRef.current) {
        const engine = buildEngine();
        if (!engine) { setSupported(false); return; }
        engineRef.current = engine;
      }
      const eng = engineRef.current;
      await eng.ctx.resume();
      const now = eng.ctx.currentTime;
      eng.master.gain.cancelScheduledValues(now);

      if (on) {
        eng.master.gain.linearRampToValueAtTime(0, now + 0.6);
        setOn(false);
      } else {
        eng.master.gain.setValueAtTime(eng.master.gain.value, now);
        eng.master.gain.linearRampToValueAtTime(0.022, now + 2);
        setOn(true);
      }
    } catch {
      setSupported(false);
    }
  };

  return (
    <button
      type="button"
      className={`ci-sound${on ? ' is-on' : ''}`}
      onClick={toggle}
      disabled={!supported}
      aria-pressed={on}
      title={supported ? (on ? 'ხმის გამორთვა' : 'ხმის ჩართვა') : 'ხმა მიუწვდომელია'}
    >
      {on ? <Volume2 size={14} /> : <VolumeX size={14} />}
      <span>{on ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}</span>
    </button>
  );
}
