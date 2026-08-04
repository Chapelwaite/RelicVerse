/**
 * RelicVerse-ის მთავარი არტეფაქტი — მრავალფენიანი კრისტალი
 * ორბიტული ნაწილაკებითა და რუნებით. არცერთი კონკრეტული ფილმის ნივთი არაა.
 */
export function RelicCore({ reg }) {
  return (
    <div className="ci-relic" ref={reg('relic')} aria-hidden="true">
      <div className="ci-relic-inner" ref={reg('relicInner')}>
        {/* უკანა შუქი */}
        <span className="ci-relic-halo" />

        {/* კრისტალი */}
        <svg className="ci-relic-gem" viewBox="0 0 120 160" width="150" height="200">
          <defs>
            <linearGradient id="ci-gem-a" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#f5f3ff" />
              <stop offset="40%" stopColor="#a875ff" />
              <stop offset="100%" stopColor="#4a1d96" />
            </linearGradient>
            <linearGradient id="ci-gem-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e9d5ff" stopOpacity=".9" />
              <stop offset="100%" stopColor="#6d38c8" stopOpacity=".2" />
            </linearGradient>
          </defs>
          <path d="M60 6 L104 58 L60 154 L16 58 Z" fill="url(#ci-gem-a)" />
          <path d="M60 6 L104 58 L60 154 Z" fill="#0b0615" fillOpacity=".24" />
          <path d="M60 6 L74 58 L60 154 L46 58 Z" fill="url(#ci-gem-b)" opacity=".75" />
          <path d="M16 58 H104" stroke="#f5f3ff" strokeOpacity=".55" strokeWidth="1.4" />
          <path d="M60 6 V154" stroke="#f5f3ff" strokeOpacity=".28" strokeWidth="1" />
          <path d="M16 58 L60 74 L104 58" fill="none" stroke="#f5f3ff" strokeOpacity=".22" strokeWidth="1" />
        </svg>

        {/* შიდა ბირთვის ციმციმი */}
        <span className="ci-relic-heart" />

        {/* ორბიტული ნაწილაკები */}
        <span className="ci-orbit o1"><i /></span>
        <span className="ci-orbit o2"><i /></span>
        <span className="ci-orbit o3"><i /></span>
      </div>

      {/* რელიკვიის გარშემო რუნები */}
      <div className="ci-relic-runes" ref={reg('relicRunes')}>
        <svg viewBox="0 0 300 300" width="100%" height="100%" fill="none">
          <circle cx="150" cy="150" r="128" stroke="#a875ff" strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 14" />
          <circle cx="150" cy="150" r="104" stroke="#a875ff" strokeOpacity=".22" strokeWidth="1" />
          <g stroke="#d8c7ff" strokeWidth="1.6" strokeLinecap="round" strokeOpacity=".8">
            <path d="M150 14 v12 M144 20 h12" />
            <path d="M266 96 l-9 9 M257 96 l9 9" />
            <path d="M280 186 h12 M286 180 v12" />
            <path d="M150 274 l-8 -10 M158 264 l-8 10" />
            <path d="M34 196 q8 -8 0 -16" />
            <path d="M22 106 l10 -6 v12 z" fill="#d8c7ff" fillOpacity=".45" />
          </g>
        </svg>
      </div>
    </div>
  );
}
