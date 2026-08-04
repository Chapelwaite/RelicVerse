import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Clock } from 'lucide-react';
import { api } from '../api/client';
import { useAsync, useReveal } from '../hooks';
import { useShop } from '../context/ShopContext';
import { Hero } from '../components/home/Hero';
import { CinematicIntro } from '../components/cinematic-intro/CinematicIntro';
import { UniverseShowcase } from '../components/home/UniverseShowcase';
import { RelicTrail } from '../components/home/RelicTrail';
import { CollectionCard } from '../components/home/CollectionCard';
import { PromoBanner } from '../components/home/PromoBanner';
import { Testimonials } from '../components/home/Testimonials';
import { Newsletter } from '../components/home/Newsletter';
import { ProductGrid } from '../components/product/ProductGrid';
import { SafeImage } from '../components/ui/Primitives';
import { formatPrice } from '../utils/format';

const PERKS = [
  { icon: Truck, title: 'სწრაფი მიწოდება', desc: 'თბილისში 1–2 დღეში, რეგიონებში 2–4 დღეში' },
  { icon: ShieldCheck, title: 'ორიგინალი ხარისხი', desc: 'თითოეული ნივთი ხელით შემოწმებულია' },
  { icon: RotateCcw, title: '14 დღიანი დაბრუნება', desc: 'თუ არ მოგეწონა — უკან მიიღებ თანხას' },
  { icon: Headphones, title: 'ქართული მხარდაჭერა', desc: 'ყოველდღე 10:00-დან 20:00-მდე' },
];

export default function Home() {
  const revealRef = useReveal();
  const { universes, collections, categories, settings } = useShop();

  const featured = useAsync((signal) => api.products({ featured: 1, limit: 8, sort: 'popular' }, signal), []);
  const newest = useAsync((signal) => api.products({ limit: 8, sort: 'newest' }, signal), []);
  const sale = useAsync((signal) => api.products({ onSale: 1, limit: 6, sort: 'discount' }, signal), []);

  const heroFloats = featured.data?.items?.slice(0, 5) || [];

  return (
    <div ref={revealRef}>
      {/* Cinematic pinned-scroll intro — პირველი ვიზიტისას სრული, შემდეგ მოკლე */}
      <CinematicIntro />

      <Hero
        floatingProducts={heroFloats}
        stats={{ products: 58, universes: universes.length || 17, categories: categories.length || 11 }}
      />

      {/* ─── უპირატესობები ─── */}
      <section className="section-tight">
        <div className="container">
          <div className="grid reveal" style={{ gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(232px, 1fr))' }}>
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="panel panel-pad flex gap-14" style={{ alignItems: 'flex-start' }}>
                <span className="cc-icon" style={{ color: 'var(--violet-300)', flexShrink: 0 }}><Icon size={20} /></span>
                <div>
                  <div className="fw-700 text-sm">{title}</div>
                  <div className="text-xs text-muted mt-8" style={{ marginTop: 4 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── სამყაროების showcase (identity cards + spotlight) ─── */}
      <UniverseShowcase />

      {/* ─── Relic Trail — გზა რელიკვიამდე ─── */}
      <RelicTrail />

      {/* ─── პოპულარული პროდუქტები ─── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">ბესტსელერები</span>
              <h2 className="section-title">პოპულარული <span className="accent">პროდუქტები</span></h2>
              <p className="section-sub">ის ნივთები, რომლებსაც ყველაზე ხშირად ირჩევენ.</p>
            </div>
            <Link to="/catalog" className="btn btn-ghost">ყველა პროდუქტი <ArrowRight size={15} /></Link>
          </div>

          <ProductGrid products={featured.data?.items || []} loading={featured.loading} skeletonCount={8} />
        </div>
      </section>

      {/* ─── აქციის ბანერი ─── */}
      <PromoBanner banner={settings.saleBanner} />

      {/* ─── სპეციალური კოლექციები ─── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">კურირებული</span>
              <h2 className="section-title">სპეციალური <span className="accent">კოლექციები</span></h2>
              <p className="section-sub">ჩვენი მიერ შერჩეული ნაკრებები განწყობის მიხედვით.</p>
            </div>
            <Link to="/collections" className="btn btn-ghost">ყველა კოლექცია <ArrowRight size={15} /></Link>
          </div>

          <div className="collection-grid">
            {collections.map((c) => <CollectionCard key={c.slug} collection={c} />)}
          </div>
        </div>
      </section>

      {/* ─── ფასდაკლებები ─── */}
      {(sale.data?.items?.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow"><Clock size={12} /> მიმდინარე აქციები</span>
                <h2 className="section-title">ყველაზე დიდი <span className="accent">ფასდაკლებები</span></h2>
              </div>
              <Link to="/sale" className="btn btn-ghost">ყველა აქცია <ArrowRight size={15} /></Link>
            </div>

            <div className="carousel">
              {sale.data.items.map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="panel reveal" style={{ overflow: 'hidden' }}>
                  <div style={{ position: 'relative', aspectRatio: 1 }}>
                    <SafeImage src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="badge badge-sale" style={{ position: 'absolute', top: 10, left: 10 }}>−{p.discount}%</span>
                  </div>
                  <div style={{ padding: '12px 14px 15px' }}>
                    <div className="pc-universe">{p.universe}</div>
                    <div className="fw-700 text-sm line-2" style={{ marginBlock: 4 }}>{p.name}</div>
                    <div className="flex-center gap-6">
                      <span className="price" style={{ fontSize: '1rem' }}>{formatPrice(p.price)}</span>
                      <span className="price-old" style={{ marginLeft: 0 }}>{formatPrice(p.oldPrice)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── ახალი ნივთები ─── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">ახლახან დაემატა</span>
              <h2 className="section-title">ახალი <span className="accent">ნივთები</span></h2>
              <p className="section-sub">უახლესი შემოსვლები RelicVerse-ის საწყობში.</p>
            </div>
            <Link to="/catalog?sort=newest" className="btn btn-ghost">ყველა სიახლე <ArrowRight size={15} /></Link>
          </div>

          <ProductGrid products={newest.data?.items || []} loading={newest.loading} skeletonCount={8} />
        </div>
      </section>

      <Testimonials />
      <Newsletter />
    </div>
  );
}
