import { Stars, Avatar } from '../ui/Primitives';

const REVIEWS = [
  { name: 'ნინო კვარაცხელია', rating: 5, product: 'ფილოსოფიური ქვა', text: 'შეკვეთა ორ დღეში მივიღე. ქვა ბევრად უკეთესია, ვიდრე ფოტოზე ჩანს — სიბნელეში ნამდვილად ანათებს. ჩემი ჰარი პოტერის კუთხე ბოლოს და ბოლოს დასრულდა.' },
  { name: 'გიორგი მაისურაძე', rating: 5, product: 'Death Note რვეული', text: 'ყდა მძიმეა, ქაღალდი სქელი — რეალურად ვიყენებ ჩანაწერებისთვის. ბიჭებმა უნივერსიტეტში ვერ დაიჯერეს, რომ ნამდვილი მაქვს.' },
  { name: 'ანა ბერიძე', rating: 5, product: 'ჩეშირის კატის ჭიქა', text: 'ჩაის ჩასხმისას ღიმილი მართლა ჩნდება. საჩუქრად ვიყიდე დასთვის და ახლა მეც მინდა თავისთვის. შეფუთვაც ძალიან ლამაზი იყო.' },
  { name: 'ლუკა ტაბატაძე', rating: 4, product: 'ჯეკ ბეღურას კომპასი', text: 'კომპასი მძიმეა და ხარისხიანი ჩანს. ერთადერთი — ხის ყუთს პატარა ნაკაწრი ჰქონდა, თუმცა თვითონ ნივთი უნაკლოა.' },
  { name: 'მარიამ ჯანელიძე', rating: 5, product: 'ტოტოროს ფიგურა', text: 'ულამაზესი და საოცრად რბილი. ჩემი და უკვე ორ კვირაა არ ეშვება. Ghibli-ს ფანებისთვის ნამდვილად გირჩევთ.' },
  { name: 'საბა გოგოლაძე', rating: 5, product: 'ერთადერთი ბეჭედი', text: 'ზომაში ზუსტად მოვხვდი, წარწერაც სუფთად არის ამოტვიფრული. მადლობა კონსულტაციისთვის — ზომაში დამეხმარნენ.' },
];

/** მომხმარებლების შეფასებები */
export function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">მომხმარებლების ხმა</span>
            <h2 className="section-title">რას წერენ <span className="accent">ჩვენზე</span></h2>
            <p className="section-sub">რეალური შეფასებები იმ ადამიანებისგან, რომლებმაც უკვე იპოვეს თავიანთი ნივთი.</p>
          </div>
        </div>

        <div className="testimonial-grid">
          {REVIEWS.map((r) => (
            <article key={r.name} className="testimonial reveal">
              <span className="quote-mark" aria-hidden="true">"</span>
              <Stars value={r.rating} size={14} />
              <p className="t-text">{r.text}</p>
              <div className="t-user">
                <Avatar name={r.name} />
                <div>
                  <div className="t-name">{r.name}</div>
                  <div className="t-item">შეიძინა: {r.product}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
