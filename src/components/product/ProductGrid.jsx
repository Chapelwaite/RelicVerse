import { useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { QuickView } from './QuickView';
import { SkeletonGrid, EmptyState } from '../ui/Primitives';

/**
 * პროდუქტების ბადე — თვითონ მართავს სწრაფი ნახვის ფანჯარას,
 * loading და empty მდგომარეობებს.
 */
export function ProductGrid({ products = [], loading = false, skeletonCount = 8, view = 'grid', empty }) {
  const [quick, setQuick] = useState(null);

  if (loading) return <SkeletonGrid count={skeletonCount} />;

  if (!products.length) {
    return empty || (
      <EmptyState
        icon={PackageSearch}
        title="ამ სამყაროდან ნივთი ჯერ ვერ ვიპოვეთ."
        description="სცადე სხვა ფილტრი ან დაათვალიერე მთელი კატალოგი."
      />
    );
  }

  return (
    <>
      <div className={view === 'list' ? 'products-list' : 'products-grid'}>
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} onQuickView={setQuick} />
        ))}
      </div>
      <QuickView product={quick} open={Boolean(quick)} onClose={() => setQuick(null)} />
    </>
  );
}
