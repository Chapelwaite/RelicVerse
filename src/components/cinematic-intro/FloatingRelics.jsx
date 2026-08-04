/**
 * მოგონებების რელიკვიები — თითო ნივთი საკუთარი სამყაროს
 * light-trail ფერით. კონტეინერი ორბიტის „სცენაა" (GSAP აბრუნებს),
 * ნივთები კი counter-rotation-ით რჩებიან სწორ მდგომარეობაში.
 */
export function FloatingRelics({ reg, items }) {
  return (
    <div className="ci-silhouettes" ref={reg('silStage')} aria-hidden="true">
      {items.map((item, i) => (
        <div key={item.src} className={`ci-orb ci-orb-${item.depth}`} ref={reg(`sil-${i}`)}>
          <span
            className="ci-orb-trail"
            ref={reg(`trail-${i}`)}
            style={{ '--trail': item.trail, transform: `rotate(${item.angle + 90}deg)` }}
          />
          <img src={item.src} alt="" draggable="false" loading="lazy" />
        </div>
      ))}
    </div>
  );
}
