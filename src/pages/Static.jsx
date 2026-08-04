import { Link } from 'react-router-dom';
import { Sparkles, Truck, RotateCcw, ShieldCheck, HelpCircle, Compass, Heart, Package } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useReveal } from '../hooks';
import { Breadcrumbs } from '../components/ui/Widgets';
import { LogoMark } from '../components/ui/Logo';

/* ─────────────── ჩვენ შესახებ ─────────────── */
export function About() {
  const revealRef = useReveal();
  const { settings, universes, categories } = useShop();

  return (
    <div className="container" ref={revealRef} style={{ maxWidth: 980 }}>
      <Breadcrumbs items={[{ label: 'ჩვენ შესახებ' }]} />

      <div className="text-center mb-20" style={{ paddingBlock: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><LogoMark size={64} /></div>
        <h1 className="section-title">RelicVerse-ის <span className="accent">ისტორია</span></h1>
        <p className="section-sub" style={{ marginInline: 'auto' }}>{settings.slogan}</p>
      </div>

      <div className="panel panel-pad mb-20 reveal">
        <p className="text-soft mb-14">
          RelicVerse დაიბადა მარტივი აზრიდან: საქართველოში არ არსებობდა ადგილი, სადაც ფენდომის ნივთებს
          ერთ სივრცეში, ქართულ ენაზე და ადეკვატურ ფასად იპოვიდი. ვიწყებდით ორი ადამიანით და ერთი თაროთი
          ჰარი პოტერის ჯოხებით — დღეს კი {universes.length || 17} სამყაროსა და {categories.length || 11} კატეგორიის ნივთს ვთავაზობთ.
        </p>
        <p className="text-soft">
          ჩვენ არ ვყიდით უბრალოდ ნივთებს. ვყიდით იმ განცდას, როცა თაროზე ხედავ საგანს, რომელიც შენს საყვარელ
          ისტორიას გახსენებს. ყველა პროდუქტი ხელით შემოწმებულია გაგზავნამდე და თუ რამე არ მოგეწონა — 14 დღეში
          ყოველგვარი ახსნის გარეშე დაგიბრუნებთ თანხას.
        </p>
      </div>

      <div className="grid mb-20" style={{ gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          { icon: Sparkles, title: 'შერჩეული ასორტიმენტი', desc: 'ყველა ნივთს ხელით ვარჩევთ — შემთხვევითი „მასა" არ გვაქვს.' },
          { icon: ShieldCheck, title: 'რეალური ხარისხი', desc: 'ფოტო და აღწერა ზუსტად ემთხვევა იმას, რასაც მიიღებ.' },
          { icon: Heart, title: 'ფენები ფენებისთვის', desc: 'ჩვენი გუნდიც იგივე სერიალებს უყურებს, რასაც შენ.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="panel panel-pad reveal">
            <span className="cc-icon" style={{ color: 'var(--violet-300)', marginBottom: 10 }}><Icon size={20} /></span>
            <h3 style={{ fontSize: '1rem' }}>{title}</h3>
            <p className="text-sm text-muted mt-8">{desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/catalog" className="btn btn-primary btn-lg"><Compass size={17} /> კატალოგის ნახვა</Link>
      </div>
    </div>
  );
}

/* ─────────────── დახმარება ─────────────── */
const FAQ = [
  { q: 'როგორ გავაფორმო შეკვეთა?', a: 'აირჩიე ნივთი, დაამატე კალათაში და გადადი გაფორმებაზე. შეავსე საკონტაქტო მონაცემები, აირჩიე მიწოდებისა და გადახდის მეთოდი და დაადასტურე. ანგარიშის შექმნა სავალდებულო არ არის.' },
  { q: 'რამდენ ხანში მივიღებ შეკვეთას?', a: 'თბილისში 1–2 სამუშაო დღე, რეგიონებში 2–4 სამუშაო დღე. შეკვეთის სტატუსს SMS-ით და ელფოსტით შეგატყობინებთ.' },
  { q: 'შემიძლია ნივთის დაბრუნება?', a: 'დიახ. მიღებიდან 14 დღის განმავლობაში, თუ ნივთი გამოუყენებელია და შენარჩუნებულია ორიგინალი შეფუთვა.' },
  { q: 'როგორ გამოვიყენო პრომოკოდი?', a: 'კალათის გვერდზე იპოვე ველი „პრომოკოდი", ჩაწერე კოდი და დააჭირე ღილაკს. ფასდაკლება მაშინვე აისახება ჯამში.' },
  { q: 'ნივთები ორიგინალია?', a: 'ჩვენი პროდუქცია არის ფენ-ატრიბუტიკა და რეპლიკები, რომლებიც შთაგონებულია ფილმებითა და სერიალებით. თითოეული ნივთის აღწერაში მითითებულია მასალა და ზომა.' },
  { q: 'რა ხდება, თუ ნივთი მარაგში არ არის?', a: 'დაამატე რჩეულებში — შემოსვლისთანავე შეგატყობინებთ. ასევე შეგიძლია მოგვწერო და მოგამზადებთ ინდივიდუალურ შეთავაზებას.' },
];

export function Help() {
  const revealRef = useReveal();
  const { settings } = useShop();

  return (
    <div className="container" ref={revealRef} style={{ maxWidth: 860 }}>
      <Breadcrumbs items={[{ label: 'დახმარება' }]} />
      <h1 className="section-title mb-20"><HelpCircle size={26} style={{ display: 'inline', verticalAlign: '-4px', marginRight: 8 }} /> ხშირად დასმული კითხვები</h1>

      <div className="flex" style={{ flexDirection: 'column', gap: 12 }}>
        {FAQ.map((item) => (
          <details key={item.q} className="panel panel-pad reveal">
            <summary style={{ cursor: 'pointer', fontWeight: 700, listStyle: 'none' }}>{item.q}</summary>
            <p className="text-soft text-sm mt-14">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="panel panel-pad mt-30 text-center">
        <h3 style={{ fontSize: '1.05rem' }}>ვერ იპოვე პასუხი?</h3>
        <p className="text-muted text-sm mt-8">დაგვიკავშირდი — ყოველდღე 10:00-დან 20:00-მდე ვპასუხობთ.</p>
        <div className="flex gap-10 mt-14 flex-wrap" style={{ justifyContent: 'center' }}>
          {settings.phone && <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="btn btn-primary">{settings.phone}</a>}
          {settings.email && <a href={`mailto:${settings.email}`} className="btn btn-ghost">{settings.email}</a>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── მიწოდება ─────────────── */
export function Shipping() {
  const { settings } = useShop();
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <Breadcrumbs items={[{ label: 'მიწოდება' }]} />
      <h1 className="section-title mb-20"><Truck size={26} style={{ display: 'inline', verticalAlign: '-4px', marginRight: 8 }} /> მიწოდების პირობები</h1>

      <div className="panel panel-pad">
        <div className="info-row"><Truck size={17} /> <span><b>თბილისი:</b> 1–2 სამუშაო დღე</span></div>
        <div className="info-row"><Truck size={17} /> <span><b>რეგიონები:</b> 2–4 სამუშაო დღე</span></div>
        <div className="info-row"><Package size={17} /> <span><b>მიწოდების ღირებულება:</b> {settings.shippingFee} ₾</span></div>
        <div className="info-row"><ShieldCheck size={17} /> <span><b>უფასო მიწოდება:</b> {settings.freeShippingThreshold} ₾-ზე მეტ შეკვეთაზე</span></div>
        <div className="info-row"><Package size={17} /> <span><b>თვითგატანა:</b> უფასოა — {settings.address}</span></div>
      </div>

      <div className="panel panel-pad mt-20">
        <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>როგორ მუშაობს</h3>
        <ol className="text-soft text-sm" style={{ paddingLeft: 18, listStyle: 'decimal' }}>
          <li style={{ marginBottom: 8 }}>შეკვეთის მიღების შემდეგ 2 საათში დაგიკავშირდებით დასადასტურებლად.</li>
          <li style={{ marginBottom: 8 }}>ნივთს ვამოწმებთ და ვაფუთავთ დამცავი მასალით.</li>
          <li style={{ marginBottom: 8 }}>კურიერი გამოგიგზავნის SMS-ს მისვლამდე 30 წუთით ადრე.</li>
          <li>ნაღდი ანგარიშსწორების შემთხვევაში გადაიხდი ნივთის ჩაბარებისას.</li>
        </ol>
      </div>
    </div>
  );
}

/* ─────────────── დაბრუნება ─────────────── */
export function Returns() {
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <Breadcrumbs items={[{ label: 'დაბრუნების პირობები' }]} />
      <h1 className="section-title mb-20"><RotateCcw size={26} style={{ display: 'inline', verticalAlign: '-4px', marginRight: 8 }} /> დაბრუნების პირობები</h1>

      <div className="panel panel-pad">
        <p className="text-soft mb-14">
          ნივთის დაბრუნება შესაძლებელია <b>მიღებიდან 14 კალენდარული დღის</b> განმავლობაში, თუ პროდუქტი
          გამოუყენებელია, არ დაზიანებულა და შენარჩუნებულია ორიგინალი შეფუთვა და იარლიყები.
        </p>
        <div className="info-row"><ShieldCheck size={17} /> <span>თანხა ბრუნდება 5 სამუშაო დღეში იმავე მეთოდით, რომლითაც გადაიხადე.</span></div>
        <div className="info-row"><Truck size={17} /> <span>თუ მიზეზი ჩვენი შეცდომაა (დაზიანება, არასწორი ნივთი) — უკან გაგზავნასაც ჩვენ ვფარავთ.</span></div>
        <div className="info-row"><Package size={17} /> <span>ინდივიდუალური შეკვეთით დამზადებული ნივთები დაბრუნებას არ ექვემდებარება.</span></div>
      </div>
    </div>
  );
}

/* ─────────────── კონფიდენციალურობა ─────────────── */
export function Privacy() {
  const { settings } = useShop();
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <Breadcrumbs items={[{ label: 'კონფიდენციალურობა' }]} />
      <h1 className="section-title mb-20"><ShieldCheck size={26} style={{ display: 'inline', verticalAlign: '-4px', marginRight: 8 }} /> კონფიდენციალურობის პოლიტიკა</h1>

      <div className="panel panel-pad text-soft text-sm" style={{ lineHeight: 1.8 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>რა მონაცემებს ვაგროვებთ</h3>
        <p className="mb-14">სახელი, გვარი, ტელეფონი, ელფოსტა და მისამართი — მხოლოდ იმისთვის, რომ შეკვეთა მოგაწოდოთ.</p>

        <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>როგორ ვინახავთ</h3>
        <p className="mb-14">პაროლები ინახება დაშიფრული სახით (bcrypt). საბანკო ბარათის მონაცემებს არ ვინახავთ — დემო რეჟიმში გადახდის ფორმა მხოლოდ ვიზუალურია.</p>

        <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Cookie</h3>
        <p className="mb-14">ვიყენებთ cookie-ს კალათისა და რჩეულების შესანახად. ეს მონაცემები მხოლოდ შენს ბრაუზერშია.</p>

        <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>შენი უფლებები</h3>
        <p>ნებისმიერ დროს შეგიძლია მოგვთხოვო შენი მონაცემების წაშლა — მოგვწერე {settings.email || 'info@relicverse.ge'}.</p>
      </div>
    </div>
  );
}
