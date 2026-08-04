import runeCircleUrl from '../../assets/intro/rune-circle.svg';

/**
 * პორტალი — მბრუნავი რგოლები, რუნების წრე, ენერგიის ბირთვი
 * და „სხვა სამყაროს" ბუნდოვანი შიგთავსი.
 */
export function Portal({ reg }) {
  return (
    <div className="ci-portal" ref={reg('portal')} aria-hidden="true">
      {/* რუნების პატარა წრე — ფორმირების პირველი ნიშანი */}
      <div className="ci-portal-runes" ref={reg('portalRunes')}>
        <img src={runeCircleUrl} alt="" draggable="false" />
      </div>

      {/* გარე რგოლი */}
      <div className="ci-ring ci-ring-outer" ref={reg('ringOuter')}>
        <svg viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="238" stroke="#a875ff" strokeOpacity=".8" strokeWidth="2" strokeDasharray="40 18" />
          <circle cx="250" cy="250" r="224" stroke="#6d38c8" strokeOpacity=".6" strokeWidth="1" />
          <g stroke="#e9d5ff" strokeWidth="2.4" strokeLinecap="round" strokeOpacity=".9">
            <path d="M250 6 v18" /><path d="M250 476 v18" />
            <path d="M6 250 h18" /><path d="M476 250 h18" />
            <path d="M78 78 l12 12" /><path d="M410 410 l12 12" />
            <path d="M422 78 l-12 12" /><path d="M90 410 l-12 12" />
          </g>
        </svg>
      </div>

      {/* შუა რგოლი — საწინააღმდეგო ბრუნვით */}
      <div className="ci-ring ci-ring-mid" ref={reg('ringMid')}>
        <svg viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="180" stroke="#c9b2ff" strokeOpacity=".55" strokeWidth="1.4" strokeDasharray="6 22" />
          <circle cx="250" cy="250" r="160" stroke="#a875ff" strokeOpacity=".4" strokeWidth="1" strokeDasharray="90 40" />
          <g fill="#e9d5ff" fillOpacity=".85">
            <circle cx="250" cy="70" r="4" /><circle cx="250" cy="430" r="4" />
            <circle cx="70" cy="250" r="4" /><circle cx="430" cy="250" r="4" />
          </g>
        </svg>
      </div>

      {/* ენერგიის ბირთვი */}
      <div className="ci-portal-core" ref={reg('portalCore')}>
        {/* პორტალის შიგნით — სხვა სამყაროს ბუნდოვანი ფორმები */}
        <div className="ci-portal-world" ref={reg('portalWorld')}>
          <span className="ci-world-blob b1" />
          <span className="ci-world-blob b2" />
          <span className="ci-world-blob b3" />
          <span className="ci-world-stars" />
        </div>
        <span className="ci-portal-rays" />
      </div>
    </div>
  );
}
