import { SkipForward } from 'lucide-react';

/** „Intro-ს გამოტოვება" — ელეგანტური ნახევრად გამჭვირვალე ღილაკი */
export function IntroSkipButton({ onSkip }) {
  return (
    <button type="button" className="ci-skip" onClick={onSkip}>
      Intro-ს გამოტოვება
      <SkipForward size={13} aria-hidden="true" />
    </button>
  );
}
