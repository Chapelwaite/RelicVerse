import { PROGRESS_STEPS } from './introTimelineConfig';

/** მარჯვენა მხარეს მინიმალისტური ეტაპების ინდიკატორი */
export function IntroProgress({ reg, activeStep }) {
  return (
    <nav className="ci-progress" aria-label="Intro-ს პროგრესი">
      <span className="ci-progress-track" aria-hidden="true">
        <span className="ci-progress-fill" ref={reg('progressFill')} />
      </span>
      <ol>
        {PROGRESS_STEPS.map((step, i) => (
          <li key={step.id} className={i === activeStep ? 'is-active' : ''}>
            <span className="ci-step-id">{step.id}</span>
            <span className="ci-step-label">{step.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
