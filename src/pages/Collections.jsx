import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { useAsync, useReveal } from '../hooks';
import { useShop } from '../context/ShopContext';
import { CollectionCard } from '../components/home/CollectionCard';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumbs, AgeGate } from '../components/ui/Widgets';
import { EmptyState } from '../components/ui/Primitives';

/** ყველა კოლექცია */
export function CollectionList() {
  const { collections } = useShop();
  const revealRef = useReveal();

  return (
    <div className="container" ref={revealRef}>
      <Breadcrumbs items={[{ label: 'კოლექციები' }]} />
      <div className="mb-20">
        <span className="eyebrow"><Layers size={12} /> კურირებული ნაკრებები</span>
        <h1 className="section-title">სპეციალური <span className="accent">კოლექციები</span></h1>
        <p className="section-sub">ჩვენ მიერ შერჩეული ნივთები განწყობის, თემისა და ბიუჯეტის მიხედვით.</p>
      </div>

      <div className="collection-grid">
        {collections.map((c) => <CollectionCard key={c.slug} collection={c} />)}
      </div>
    </div>
  );
}

/** ერთი კოლექციის გვერდი */
export default function CollectionDetail() {
  const { slug } = useParams();
  const revealRef = useReveal();
  const { collectionBySlug } = useShop();
  const collection = collectionBySlug(slug);
  const [ageOk, setAgeOk] = useState(false);

  const query = useMemo(() => ({ collection: slug, limit: 60, sort: 'popular' }), [slug]);
  const { data, loading } = useAsync((signal) => api.products(query, signal), [JSON.stringify(query)]);

  if (!collection) {
    return (
      <div className="container">
        <EmptyState icon={Layers} title="ასეთი კოლექცია ვერ ვიპოვეთ">
          <Link to="/collections" className="btn btn-primary">ყველა კოლექცია</Link>
        </EmptyState>
      </div>
    );
  }

  const needsAge = collection.ageRestricted && !ageOk;

  return (
    <div className="container" ref={revealRef}>
      <AgeGate open={needsAge} onConfirm={() => setAgeOk(true)} onCancel={() => window.history.back()} />

      <Breadcrumbs items={[{ label: 'კოლექციები', to: '/collections' }, { label: collection.name }]} />

      <div className="promo-banner mb-20" style={{ textAlign: 'left', padding: 'clamp(22px, 4vw, 38px)' }}>
        <span className="cc-blob" style={{ background: collection.color, position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', filter: 'blur(50px)', opacity: 0.5 }} />
        <h1 className="pb-title" style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.4rem)' }}>{collection.name}</h1>
        <p className="pb-sub">{collection.desc}</p>
      </div>

      <div className="flex-between mb-20 flex-wrap gap-10">
        <span className="result-count">ნაპოვნია <b>{data?.total ?? 0}</b> ნივთი</span>
        <Link to="/collections" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> ყველა კოლექცია</Link>
      </div>

      {!needsAge && <ProductGrid products={data?.items || []} loading={loading} skeletonCount={8} />}
    </div>
  );
}
